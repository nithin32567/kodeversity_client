import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, XCircle, Save } from "lucide-react";
import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import { processImage, getBase64SizeKB, MAX_IMAGE_SIZE_KB } from "./imageUtils";

interface Nameservers {
  ns1: string;
  ns2: string;
}

interface Bridge {
  nat: boolean;
  bridge: string;
  "bridge-ip": string;
  "bridge-mask": number;
  network: string;
  nameservers: Nameservers;
}

interface Disk {
  name: string;
  size: number;
  "is-read-only": boolean;
}

interface TemplateNetwork {
  "is-primary": boolean;
  name: string;
  tap: string;
  bridge: string;
  ip: string;
  mask: number;
  gateway: string;
  mac: string;
  nameservers: Nameservers;
}

interface Template {
  name: string;
  cpu: number;
  smt: boolean;
  multiplier: number;
  ram: number;
  "enable-overlay": boolean;
  "overlay-size"?: number;
  "is-zfs": boolean;
  "zfs-snapshot"?: string;
  "zfs-clone-path"?: string;
  "kernel-args": string;
  kernel: string;
  rootfs?: string;
  username: string;
  "enable-gui": boolean;
  "gui-port"?: number;
  "enable-ide": boolean;
  "ide-port"?: number;
  "terminal-layout": string;
  disks: Disk[];
  network: TemplateNetwork[];
}

interface Config {
  name: string;
  image?: string;
  description?: string;
  keywords?: string[];
  bridges: Bridge[];
  templates: Template[];
}

interface CreateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationErrors {
  bridges?: string[];
  templates?: { [key: number]: { name?: string; disks?: string[]; networks?: string[] } };
  general?: string;
}

const generateMAC = (): string => {
  const hexChars = "0123456789ABCDEF";
  let mac = "52:54:00";
  for (let i = 0; i < 3; i++) {
    mac += ":";
    for (let j = 0; j < 2; j++) {
      mac += hexChars.charAt(Math.floor(Math.random() * 16));
    }
  }
  return mac;
};

const generateTapName = (templateIdx: number, networkIdx: number): string => {
  return `tap${networkIdx}${templateIdx} `;
};

const getNextAvailableIP = (
  bridgeIP: string,
  bridgeNetwork: string,
  existingIPs: string[],
): string => {
  const networkParts = bridgeNetwork.split(".");

  const bridgeParts = bridgeIP.split(".");
  const bridgeLastOctet = parseInt(bridgeParts[3]);

  for (let i = bridgeLastOctet + 1; i < 255; i++) {
    const candidateIP = `${networkParts[0]}.${networkParts[1]}.${networkParts[2]}.${i} `;
    if (!existingIPs.includes(candidateIP)) {
      return candidateIP;
    }
  }

  return `${networkParts[0]}.${networkParts[1]}.${networkParts[2]} .100`;
};

const getNextInterfaceName = (existingNames: string[]): string => {
  const ethNumbers = existingNames
    .filter((name) => name.startsWith("eth"))
    .map((name) => parseInt(name.replace("eth", "")))
    .filter((num) => !isNaN(num));

  const maxNum = ethNumbers.length > 0 ? Math.max(...ethNumbers) : -1;
  return `eth${maxNum + 1} `;
};

const ROOTFS_OPTIONS = ["/dev/sda1", "/dev/sda2", "/dev/nvme0n1p1"];

const initialBridge: Bridge = {
  nat: true,
  bridge: "br0",
  "bridge-ip": "172.16.0.1",
  "bridge-mask": 24,
  network: "172.16.0.0",
  nameservers: { ns1: "8.8.8.8", ns2: "8.8.4.4" },
};

const initialDisk: Disk = {
  name: "Disk0",
  size: 20,
  "is-read-only": false,
};

const createInitialNetwork = (
  templateIdx: number,
  networkIdx: number,
  existingNames: string[] = [],
): TemplateNetwork => ({
  "is-primary": networkIdx === 0,
  name: networkIdx === 0 ? "eth0" : getNextInterfaceName(existingNames),
  tap: generateTapName(templateIdx, networkIdx),
  bridge: "",
  ip: "",
  mask: 24,
  gateway: "",
  mac: generateMAC(),
  nameservers: { ns1: "8.8.8.8", ns2: "8.8.4.4" },
});

const initialTemplate: Template = {
  name: "",
  cpu: 2,
  smt: true,
  multiplier: 1,
  ram: 4096,
  "enable-overlay": false,
  "is-zfs": false,
  "zfs-clone-path": "FirePool/clones",
  "kernel-args": "reboot=k panic=1 pci=off i8042.noaux i8042.nokbd random.trust_cpu=on",
  kernel: "/boot/vmlinuz",
  username: "root",
  "enable-gui": true,
  "gui-port": 8444,
  "enable-ide": true,
  "ide-port": 40000,
  "terminal-layout": "horizontal",
  disks: [{ ...initialDisk }],
  network: [createInitialNetwork(0, 0)],
};

export default function CreateConfigModal({ isOpen, onClose, onSuccess }: CreateConfigModalProps) {
  const [config, setConfig] = useState<Config>({
    name: "",
    bridges: [{ ...initialBridge }],
    templates: [{ ...initialTemplate }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [zfsSnapshotOptions, setZfsSnapshotOptions] = useState<string[]>([]);
  const [kernelOptions, setKernelOptions] = useState<string[]>([]);

  // Metadata state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  // Fetch ZFS snapshots and kernels when modal opens
  useEffect(() => {
    const fetchOptions = async () => {
      // Fetch ZFS snapshots
      try {
        const response = await apiClient.get<{ source: string; data: { name: string }[] }>(
          endpoints.playground.adminSnapshots,
        );
        if (response.data) {
          const snapshotNames = response.data.map((snapshot: { name: string }) => snapshot.name);
          setZfsSnapshotOptions(snapshotNames);
        }
      } catch (err) {
        console.error("Failed to fetch ZFS snapshots:", err);
        setZfsSnapshotOptions([]);
      }

      // Fetch kernel paths
      try {
        const response = await apiClient.get<{ source: string; data: { absolute_path: string }[] }>(
          endpoints.playground.adminKernels,
        );
        if (response.data) {
          const kernelPaths = response.data.map(
            (kernel: { absolute_path: string }) => kernel.absolute_path,
          );
          setKernelOptions(kernelPaths);
        }
      } catch (err) {
        console.error("Failed to fetch kernel paths:", err);
        setKernelOptions([]);
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const templatesLength = config.templates.length;
  const networkLengths = config.templates.map((t) => t.network.length).join(",");

  // Update TAP names whenever templates/networks change
  useEffect(() => {
    const newTemplates = config.templates.map((template, tIdx) => ({
      ...template,
      network: template.network.map((net, nIdx) => ({
        ...net,
        tap: generateTapName(tIdx, nIdx),
      })),
    }));

    // Only update if TAP names actually changed
    const hasChanged = newTemplates.some((t, tIdx) =>
      t.network.some((n, nIdx) => n.tap !== config.templates[tIdx].network[nIdx].tap),
    );

    if (hasChanged) {
      setConfig((prev) => ({ ...prev, templates: newTemplates }));
    }
  }, [templatesLength, networkLengths, config.templates]);

  if (!isOpen) return null;

  const validateConfig = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate bridge names uniqueness
    const bridgeNames = config.bridges.map((b) => b.bridge).filter((n) => n);
    const duplicateBridges = bridgeNames.filter((name, idx) => bridgeNames.indexOf(name) !== idx);
    if (duplicateBridges.length > 0) {
      errors.bridges = duplicateBridges;
    }

    // Validate template names uniqueness
    const templateNames = config.templates.map((t) => t.name).filter((n) => n);
    const duplicateTemplates = templateNames.filter(
      (name, idx) => templateNames.indexOf(name) !== idx,
    );

    // Validate disks and networks within each template
    config.templates.forEach((template, tIdx) => {
      const templateErrors: { name?: string; disks?: string[]; networks?: string[] } = {};

      if (duplicateTemplates.includes(template.name)) {
        templateErrors.name = "Duplicate template name";
      }

      const diskNames = template.disks.map((d) => d.name).filter((n) => n);
      const duplicateDisks = diskNames.filter((name, idx) => diskNames.indexOf(name) !== idx);
      if (duplicateDisks.length > 0) {
        templateErrors.disks = duplicateDisks;
      }

      const networkNames = template.network.map((n) => n.name).filter((n) => n);
      const duplicateNetworks = networkNames.filter(
        (name, idx) => networkNames.indexOf(name) !== idx,
      );
      if (duplicateNetworks.length > 0) {
        templateErrors.networks = duplicateNetworks;
      }

      if (Object.keys(templateErrors).length > 0) {
        if (!errors.templates) errors.templates = {};
        errors.templates[tIdx] = templateErrors;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfig()) {
      setError("Please fix validation errors before submitting");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transformedConfig = {
        ...config,
        image: selectedImage || undefined,
        description: config.description || undefined,
        keywords: keywords.length > 0 ? keywords : undefined,
        bridges: config.bridges.map((bridge) => ({
          bridge: bridge.bridge,
          "bridge-ip": `${bridge["bridge-ip"]}/${bridge["bridge-mask"]}`,
          network: `${bridge.network}/${bridge["bridge-mask"]}`,
          nat: bridge.nat,
          nameservers: bridge.nameservers,
        })),
        templates: config.templates.map((template) => ({
          ...template,
          "zfs-clone-path": "FirePool/clones",
          network: template.network.map((network) => ({
            ...network,
            tap: network.tap.trim(),
            ip: network.ip.trim(),
            name: network.name.trim(),
            bridge: network.bridge.trim(),
            gateway: network.gateway.trim(),
            mac: network.mac.trim(),
          })),
          disks: template.disks.map((disk) => ({
            ...disk,
            size: disk.size * 1024,
          })),
        })),
      };

      await apiClient.post(endpoints.playground.adminTemplateConfig, { config: transformedConfig });

      setConfig({
        name: "",
        bridges: [{ ...initialBridge }],
        templates: [
          {
            ...initialTemplate,
            disks: [{ ...initialDisk }],
            network: [createInitialNetwork(0, 0)],
          },
        ],
      });

      // Reset metadata
      setSelectedImage(null);
      setImageError(null);
      setKeywords([]);
      setKeywordInput("");

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Failed to create config", err);
      setError(
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
          "Failed to create configuration",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBridge = (index: number, field: keyof Bridge | "ns1" | "ns2", value: unknown) => {
    const newBridges = [...config.bridges];
    if (field === "ns1" || field === "ns2") {
      newBridges[index].nameservers[field] = value as string;
    } else {
      (newBridges[index] as unknown as Record<string, unknown>)[field] = value;
    }
    setConfig({ ...config, bridges: newBridges });
  };

  const addBridge = () => {
    setConfig({
      ...config,
      bridges: [
        ...config.bridges,
        { ...initialBridge, bridge: "", "bridge-ip": "", "bridge-mask": 24, network: "" },
      ],
    });
  };

  const removeBridge = (index: number) => {
    const newBridges = config.bridges.filter((_, i) => i !== index);
    setConfig({ ...config, bridges: newBridges });
  };

  const updateTemplate = (index: number, field: keyof Template, value: unknown) => {
    const newTemplates = [...config.templates];

    // Handle ZFS/Overlay mutual exclusivity
    if (field === "is-zfs" && value === true) {
      newTemplates[index]["enable-overlay"] = false;
      newTemplates[index]["overlay-size"] = undefined;
      newTemplates[index].rootfs = undefined;
    } else if (field === "enable-overlay" && value === true) {
      newTemplates[index]["is-zfs"] = false;
      newTemplates[index]["zfs-snapshot"] = undefined;
      newTemplates[index]["zfs-clone-path"] = undefined;
    }

    if (field === "enable-gui" && value === true) {
      newTemplates.forEach((t, idx) => {
        if (idx !== index) {
          t["enable-gui"] = false;
          t["gui-port"] = undefined;
        }
      });
    } else if (field === "enable-ide" && value === true) {
      newTemplates.forEach((t, idx) => {
        if (idx !== index) {
          t["enable-ide"] = false;
          t["ide-port"] = undefined;
        }
      });
    }

    if (field === "enable-gui" && value === false) {
      newTemplates[index]["gui-port"] = undefined;
    } else if (field === "enable-ide" && value === false) {
      newTemplates[index]["ide-port"] = undefined;
    }

    (newTemplates[index] as unknown as Record<string, unknown>)[field] = value;
    setConfig({ ...config, templates: newTemplates });
  };

  const addTemplate = () => {
    const newTemplate = {
      ...initialTemplate,
      name: "",
      "enable-gui": false,
      "gui-port": undefined,
      "enable-ide": false,
      "ide-port": undefined,
      network: [createInitialNetwork(config.templates.length, 0)],
    };
    setConfig({ ...config, templates: [...config.templates, newTemplate] });
  };

  const removeTemplate = (index: number) => {
    const newTemplates = config.templates.filter((_, i) => i !== index);
    setConfig({ ...config, templates: newTemplates });
  };

  const updateDisk = (tIdx: number, dIdx: number, field: keyof Disk, value: unknown) => {
    const newTemplates = [...config.templates];
    (newTemplates[tIdx].disks[dIdx] as unknown as Record<string, unknown>)[field] = value;
    setConfig({ ...config, templates: newTemplates });
  };

  const addDisk = (tIdx: number) => {
    const newTemplates = [...config.templates];
    const diskCount = newTemplates[tIdx].disks.length;
    newTemplates[tIdx].disks.push({ ...initialDisk, name: `Disk${diskCount}` });
    setConfig({ ...config, templates: newTemplates });
  };

  const removeDisk = (tIdx: number, dIdx: number) => {
    const newTemplates = [...config.templates];
    newTemplates[tIdx].disks = newTemplates[tIdx].disks.filter((_, i) => i !== dIdx);
    setConfig({ ...config, templates: newTemplates });
  };

  const updateNetwork = (
    tIdx: number,
    nIdx: number,
    field: keyof TemplateNetwork | "ns1" | "ns2",
    value: unknown,
  ) => {
    const newTemplates = [...config.templates];
    if (field === "ns1" || field === "ns2") {
      newTemplates[tIdx].network[nIdx].nameservers[field] = value as string;
    } else if (field === "bridge") {
      const selectedBridge = config.bridges.find((b) => b.bridge === value);
      if (selectedBridge) {
        newTemplates[tIdx].network[nIdx].bridge = value as string;
        newTemplates[tIdx].network[nIdx].gateway = selectedBridge["bridge-ip"];
        newTemplates[tIdx].network[nIdx].mask = selectedBridge["bridge-mask"];

        const existingIPs = config.templates.flatMap((t) =>
          t.network.filter((n) => n.bridge === value).map((n) => n.ip),
        );
        const nextIP = getNextAvailableIP(
          selectedBridge["bridge-ip"],
          selectedBridge.network,
          existingIPs,
        );
        newTemplates[tIdx].network[nIdx].ip = nextIP;
      } else {
        newTemplates[tIdx].network[nIdx].bridge = value as string;
      }
    } else {
      (newTemplates[tIdx].network[nIdx] as unknown as Record<string, unknown>)[field] = value;
    }
    setConfig({ ...config, templates: newTemplates });
  };

  const addNetwork = (tIdx: number) => {
    const newTemplates = [...config.templates];
    const networkIdx = newTemplates[tIdx].network.length;
    const existingNames = newTemplates[tIdx].network.map((n) => n.name);
    newTemplates[tIdx].network.push(createInitialNetwork(tIdx, networkIdx, existingNames));
    setConfig({ ...config, templates: newTemplates });
  };

  const removeNetwork = (tIdx: number, nIdx: number) => {
    const newTemplates = [...config.templates];
    newTemplates[tIdx].network = newTemplates[tIdx].network.filter((_, i) => i !== nIdx);
    setConfig({ ...config, templates: newTemplates });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-[var(--surface-2)] rounded-xl shadow-2xl w-full max-w-6xl mx-4 my-auto flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[var(--hairline)]">
          <h2 className="text-xl font-bold text-foreground">Create New Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-800 text-yellow-300 rounded-lg text-sm">
              <p className="font-semibold mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.bridges && <li>Duplicate bridge names found</li>}
                {validationErrors.templates && (
                  <li>Duplicate names found in templates, disks, or network interfaces</li>
                )}
              </ul>
            </div>
          )}

          <form id="create-config-form" onSubmit={handleSubmit} className="space-y-8">
            {}
            <section>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-foreground/80 mb-2">
                  Configuration Name
                </label>
                <input
                  type="text"
                  required
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-lg text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter configuration name"
                />
              </div>
            </section>

            {}
            <section className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--hairline)]">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                Configuration Metadata
              </h3>

              <div className="space-y-4">
                {}
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">
                    Configuration Image
                  </label>
                  {selectedImage ? (
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Config preview"
                        className="h-32 w-auto rounded-lg border border-[var(--hairline)]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImageError(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      {selectedImage && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Size: {getBase64SizeKB(selectedImage).toFixed(1)}kB / {MAX_IMAGE_SIZE_KB}
                          kB
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--hairline)] border-dashed rounded-lg cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG (MAX. {MAX_IMAGE_SIZE_KB}kB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const result = await processImage(file);
                            if (result.error) {
                              setImageError(result.error);
                              setSelectedImage(null);
                            } else {
                              setSelectedImage(result.base64);
                              setImageError(null);
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                  {imageError && <div className="mt-2 text-sm text-red-400">{imageError}</div>}
                </div>

                {}
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">
                    Description
                  </label>
                  <textarea
                    value={config.description || ""}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-lg text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    placeholder="Describe this configuration..."
                    rows={3}
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {(config.description || "").length} characters
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-foreground/80 mb-2">
                    Keywords
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
                            setKeywords([...keywords, keywordInput.trim()]);
                            setKeywordInput("");
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-lg text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Type keyword and press Enter..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
                          setKeywords([...keywords, keywordInput.trim()]);
                          setKeywordInput("");
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm border border-blue-800/50"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => setKeywords(keywords.filter((_, i) => i !== idx))}
                            className="ml-2 hover:text-blue-100"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </section>

            {/* Bridges Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                  Bridges
                </h3>
                <button
                  type="button"
                  onClick={addBridge}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Bridge
                </button>
              </div>
              <div className="space-y-4">
                {config.bridges.map((bridge, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--hairline)] relative group"
                  >
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removeBridge(idx)}
                        className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Bridge Name
                        </label>
                        <input
                          type="text"
                          required
                          value={bridge.bridge}
                          onChange={(e) => updateBridge(idx, "bridge", e.target.value)}
                          className={`w-full px-3 py-2 bg-[var(--surface)] border rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                            validationErrors.bridges?.includes(bridge.bridge)
                              ? "border-red-500"
                              : "border-[var(--hairline)]"
                          }`}
                          placeholder="br0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Bridge IP
                        </label>
                        <input
                          type="text"
                          required
                          value={bridge["bridge-ip"]}
                          onChange={(e) => updateBridge(idx, "bridge-ip", e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="172.16.0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Network
                        </label>
                        <input
                          type="text"
                          required
                          value={bridge.network}
                          onChange={(e) => updateBridge(idx, "network", e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="172.16.0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Mask</label>
                        <input
                          type="number"
                          required
                          min="0"
                          max="32"
                          value={bridge["bridge-mask"]}
                          onChange={(e) =>
                            updateBridge(idx, "bridge-mask", parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="24"
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bridge.nat}
                            onChange={(e) => updateBridge(idx, "nat", e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)] focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-foreground/80">Enable NAT</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  Templates
                </h3>
                <button
                  type="button"
                  onClick={addTemplate}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Template
                </button>
              </div>
              <div className="space-y-6">
                {config.templates.map((template, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-6 bg-[var(--surface)] border border-[var(--hairline)] rounded-xl shadow-sm relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeTemplate(tIdx)}
                      className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-foreground/80 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        required
                        value={template.name}
                        onChange={(e) => updateTemplate(tIdx, "name", e.target.value)}
                        className={`w-full px-3 py-2 bg-[var(--surface-2)] border rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none ${
                          validationErrors.templates?.[tIdx]?.name
                            ? "border-red-500"
                            : "border-[var(--hairline)]"
                        }`}
                        placeholder="e.g., Web Server Template"
                      />
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          CPU Cores
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={template.cpu}
                          onChange={(e) => updateTemplate(tIdx, "cpu", parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          RAM (MB)
                        </label>
                        <input
                          type="number"
                          required
                          min="128"
                          value={template.ram}
                          onChange={(e) => updateTemplate(tIdx, "ram", parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Kernel Path
                        </label>
                        <select
                          required
                          value={template.kernel}
                          onChange={(e) => updateTemplate(tIdx, "kernel", e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select kernel...</option>
                          {kernelOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          required
                          value={template.username}
                          onChange={(e) => updateTemplate(tIdx, "username", e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Kernel Args
                        </label>
                        <input
                          type="text"
                          value={template["kernel-args"]}
                          onChange={(e) => updateTemplate(tIdx, "kernel-args", e.target.value)}
                          className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Terminal Layout
                        </label>
                        <div className="flex space-x-2">
                          {}
                          <button
                            type="button"
                            onClick={() => updateTemplate(tIdx, "terminal-layout", "vertical")}
                            className={`flex-1 px-2 py-2 border-2 rounded-md transition-all flex items-center justify-center ${
                              template["terminal-layout"] === "vertical"
                                ? "border-blue-500 bg-blue-900/30"
                                : "border-[var(--hairline)] bg-[var(--surface)] hover:border-gray-400"
                            }`}
                            title="Vertical Split"
                          >
                            <svg className="w-6 h-6 mr-1" viewBox="0 0 24 24" fill="none">
                              <rect
                                x="2"
                                y="4"
                                width="9"
                                height="16"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={
                                  template["terminal-layout"] === "vertical" ? "#3b82f6" : "#9ca3af"
                                }
                                opacity="0.3"
                              />
                              <rect
                                x="13"
                                y="4"
                                width="9"
                                height="16"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={
                                  template["terminal-layout"] === "vertical" ? "#3b82f6" : "#9ca3af"
                                }
                                opacity="0.3"
                              />
                            </svg>
                            <span className="text-xs text-foreground/80">Vertical</span>
                          </button>

                          {}
                          <button
                            type="button"
                            onClick={() => updateTemplate(tIdx, "terminal-layout", "horizontal")}
                            className={`flex-1 px-2 py-2 border-2 rounded-md transition-all flex items-center justify-center ${
                              template["terminal-layout"] === "horizontal"
                                ? "border-blue-500 bg-blue-900/30"
                                : "border-[var(--hairline)] bg-[var(--surface)] hover:border-gray-400"
                            }`}
                            title="Horizontal Split"
                          >
                            <svg className="w-6 h-6 mr-1" viewBox="0 0 24 24" fill="none">
                              <rect
                                x="2"
                                y="4"
                                width="20"
                                height="7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={
                                  template["terminal-layout"] === "horizontal"
                                    ? "#3b82f6"
                                    : "#9ca3af"
                                }
                                opacity="0.3"
                              />
                              <rect
                                x="2"
                                y="13"
                                width="20"
                                height="7"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={
                                  template["terminal-layout"] === "horizontal"
                                    ? "#3b82f6"
                                    : "#9ca3af"
                                }
                                opacity="0.3"
                              />
                            </svg>
                            <span className="text-xs text-foreground/80">Horizontal</span>
                          </button>

                          {}
                          <button
                            type="button"
                            onClick={() => updateTemplate(tIdx, "terminal-layout", "normal")}
                            className={`flex-1 px-2 py-2 border-2 rounded-md transition-all flex items-center justify-center ${
                              template["terminal-layout"] === "normal"
                                ? "border-blue-500 bg-blue-900/30"
                                : "border-[var(--hairline)] bg-[var(--surface)] hover:border-gray-400"
                            }`}
                            title="Normal"
                          >
                            <svg className="w-6 h-6 mr-1" viewBox="0 0 24 24" fill="none">
                              <rect
                                x="2"
                                y="4"
                                width="20"
                                height="16"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill={
                                  template["terminal-layout"] === "normal" ? "#3b82f6" : "#9ca3af"
                                }
                                opacity="0.3"
                              />
                            </svg>
                            <span className="text-xs text-foreground/80">Normal</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={template.smt}
                            onChange={(e) => updateTemplate(tIdx, "smt", e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)]"
                          />
                          <span className="ml-2 text-sm text-foreground/80">SMT</span>
                        </label>
                      </div>
                    </div>

                    {}
                    <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                      <label className="block text-sm font-semibold text-foreground/80 mb-3">
                        Features
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={template["enable-gui"]}
                              onChange={(e) => updateTemplate(tIdx, "enable-gui", e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)]"
                            />
                            <span className="ml-2 text-sm font-medium text-foreground/80">
                              Enable GUI
                            </span>
                          </label>
                          {template["enable-gui"] && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                GUI Port
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="65535"
                                value={template["gui-port"] || ""}
                                onChange={(e) =>
                                  updateTemplate(tIdx, "gui-port", parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="8444"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="flex items-center cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={template["enable-ide"]}
                              onChange={(e) => updateTemplate(tIdx, "enable-ide", e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)]"
                            />
                            <span className="ml-2 text-sm font-medium text-foreground/80">
                              Enable IDE
                            </span>
                          </label>
                          {template["enable-ide"] && (
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                IDE Port
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                max="65535"
                                value={template["ide-port"] || ""}
                                onChange={(e) =>
                                  updateTemplate(tIdx, "ide-port", parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="40000"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--hairline)]">
                      <label className="block text-sm font-semibold text-foreground/80 mb-3">
                        Storage Mode
                      </label>
                      <div className="flex space-x-4 mb-4">
                        <label
                          className="flex items-center cursor-pointer px-4 py-2 border-2 rounded-lg transition-colors"
                          style={{
                            borderColor: template["is-zfs"] ? "#3b82f6" : "#4b5563",
                            backgroundColor: template["is-zfs"] ? "#1e3a8a33" : "#111827",
                          }}
                        >
                          <input
                            type="radio"
                            checked={template["is-zfs"]}
                            onChange={() => updateTemplate(tIdx, "is-zfs", true)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm font-medium text-foreground/80">ZFS</span>
                        </label>
                        <label
                          className="flex items-center cursor-pointer px-4 py-2 border-2 rounded-lg transition-colors"
                          style={{
                            borderColor: template["enable-overlay"] ? "#3b82f6" : "#4b5563",
                            backgroundColor: template["enable-overlay"] ? "#1e3a8a33" : "#111827",
                          }}
                        >
                          <input
                            type="radio"
                            checked={template["enable-overlay"]}
                            onChange={() => updateTemplate(tIdx, "enable-overlay", true)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm font-medium text-foreground/80">
                            Overlay
                          </span>
                        </label>
                        <label
                          className="flex items-center cursor-pointer px-4 py-2 border-2 rounded-lg transition-colors"
                          style={{
                            borderColor:
                              !template["is-zfs"] && !template["enable-overlay"]
                                ? "#3b82f6"
                                : "#4b5563",
                            backgroundColor:
                              !template["is-zfs"] && !template["enable-overlay"]
                                ? "#1e3a8a33"
                                : "#111827",
                          }}
                        >
                          <input
                            type="radio"
                            checked={!template["is-zfs"] && !template["enable-overlay"]}
                            onChange={() => {
                              updateTemplate(tIdx, "is-zfs", false);
                              updateTemplate(tIdx, "enable-overlay", false);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm font-medium text-foreground/80">None</span>
                        </label>
                      </div>

                      {template["is-zfs"] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              ZFS Snapshot
                            </label>
                            <select
                              value={template["zfs-snapshot"] || ""}
                              onChange={(e) => updateTemplate(tIdx, "zfs-snapshot", e.target.value)}
                              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Select snapshot...</option>
                              {zfsSnapshotOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {template["enable-overlay"] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Overlay Size (GB)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={template["overlay-size"] || ""}
                              onChange={(e) =>
                                updateTemplate(
                                  tIdx,
                                  "overlay-size",
                                  parseInt(e.target.value) * 1024,
                                )
                              }
                              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="1024"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Rootfs
                            </label>
                            <select
                              value={template.rootfs || ""}
                              onChange={(e) => updateTemplate(tIdx, "rootfs", e.target.value)}
                              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--hairline)] rounded-md text-sm text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="">Select rootfs...</option>
                              {ROOTFS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Disks Sub-section */}
                    <div className="bg-[var(--surface-2)] p-4 rounded-lg border border-[var(--hairline)] mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-semibold text-foreground/80">Disks</h5>
                        <button
                          type="button"
                          onClick={() => addDisk(tIdx)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Disk
                        </button>
                      </div>
                      <div className="space-y-3">
                        {template.disks.map((disk, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex items-center space-x-3 bg-[var(--surface)] p-2 rounded border border-[var(--hairline)]"
                          >
                            <input
                              type="text"
                              placeholder="Name"
                              value={disk.name}
                              onChange={(e) => updateDisk(tIdx, dIdx, "name", e.target.value)}
                              className={`flex-1 px-2 py-1 text-sm text-foreground border rounded ${
                                validationErrors.templates?.[tIdx]?.disks?.includes(disk.name)
                                  ? "border-red-500"
                                  : "border-[var(--hairline)]"
                              }`}
                            />
                            <div className="flex items-center w-32">
                              <input
                                type="number"
                                placeholder="Size"
                                value={disk.size}
                                onChange={(e) =>
                                  updateDisk(tIdx, dIdx, "size", parseFloat(e.target.value))
                                }
                                className="w-full px-2 py-1 text-sm text-foreground border border-[var(--hairline)] rounded-l"
                              />
                              <span className="bg-white/[0.04] border border-l-0 border-[var(--hairline)] px-2 py-1 text-sm text-foreground/80 rounded-r">
                                GB
                              </span>
                            </div>
                            <label className="flex items-center cursor-pointer px-2">
                              <input
                                type="checkbox"
                                checked={disk["is-read-only"]}
                                onChange={(e) =>
                                  updateDisk(tIdx, dIdx, "is-read-only", e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)]"
                              />
                              <span className="ml-2 text-xs text-gray-600">RO</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeDisk(tIdx, dIdx)}
                              className="p-1 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {}
                    <div className="bg-[var(--surface-2)] p-4 rounded-lg border border-[var(--hairline)]">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-sm font-semibold text-foreground/80">
                          Network Interfaces
                        </h5>
                        <button
                          type="button"
                          onClick={() => addNetwork(tIdx)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Network
                        </button>
                      </div>
                      <div className="space-y-3">
                        {template.network.map((net, nIdx) => (
                          <div
                            key={nIdx}
                            className="bg-[var(--surface)] p-3 rounded border border-[var(--hairline)]"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Interface Name
                                </label>
                                <input
                                  type="text"
                                  value={net.name}
                                  onChange={(e) =>
                                    updateNetwork(tIdx, nIdx, "name", e.target.value)
                                  }
                                  className={`w-full px-2 py-1 text-sm text-foreground border rounded ${
                                    validationErrors.templates?.[tIdx]?.networks?.includes(net.name)
                                      ? "border-red-500"
                                      : "border-[var(--hairline)]"
                                  }`}
                                  placeholder="eth0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  TAP Device
                                </label>
                                <input
                                  type="text"
                                  value={net.tap}
                                  disabled
                                  className="w-full px-2 py-1 text-sm text-gray-500 bg-white/[0.04] border border-[var(--hairline)] rounded cursor-not-allowed"
                                  placeholder="tap00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Bridge
                                </label>
                                <select
                                  value={net.bridge}
                                  onChange={(e) =>
                                    updateNetwork(tIdx, nIdx, "bridge", e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-sm text-foreground bg-[var(--surface)] border border-[var(--hairline)] rounded"
                                >
                                  <option value="">Select bridge...</option>
                                  {config.bridges.map((bridge, bIdx) => (
                                    <option key={bIdx} value={bridge.bridge}>
                                      {bridge.bridge || `Bridge ${bIdx + 1}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  IP Address
                                </label>
                                <input
                                  type="text"
                                  value={net.ip}
                                  onChange={(e) => updateNetwork(tIdx, nIdx, "ip", e.target.value)}
                                  className="w-full px-2 py-1 text-sm text-foreground border border-[var(--hairline)] rounded"
                                  placeholder="172.16.0.100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Gateway
                                </label>
                                <input
                                  type="text"
                                  value={net.gateway}
                                  onChange={(e) =>
                                    updateNetwork(tIdx, nIdx, "gateway", e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-sm text-foreground border border-[var(--hairline)] rounded"
                                  placeholder="172.16.0.1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  MAC Address
                                </label>
                                <input
                                  type="text"
                                  value={net.mac}
                                  onChange={(e) => updateNetwork(tIdx, nIdx, "mac", e.target.value)}
                                  className="w-full px-2 py-1 text-sm text-foreground border border-[var(--hairline)] rounded"
                                  placeholder="52:54:00:12:34:56"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={net["is-primary"]}
                                  onChange={(e) =>
                                    updateNetwork(tIdx, nIdx, "is-primary", e.target.checked)
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-[var(--hairline)]"
                                />
                                <span className="ml-2 text-xs text-gray-600">
                                  Primary Interface
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => removeNetwork(tIdx, nIdx)}
                                className="p-1 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </form>
        </div>

        <div className="p-6 border-t border-[var(--hairline)] bg-[var(--surface-2)] rounded-b-xl flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-foreground/80 bg-[var(--surface)] border border-[var(--hairline)] rounded-lg hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-config-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
