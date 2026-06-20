import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Loader2,
  Cpu,
  HardDrive,
  RefreshCw,
  Layers,
  Sliders,
  Activity,
  Server,
  Clock,
  Edit2,
  Terminal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { adminPlaygroundService } from "@/infrastructure/playground/adminPlaygroundService";
import { PlaygroundWorkspace } from "@/presentation/features/playground";
import CreateConfigModal from "./CreateConfigModal";
import EditConfigModal from "./EditConfigModal";
import type {
  TemplateConfig,
  TemplateBridge,
  TemplateVM,
  TemplateNetwork,
  TemplateDisk,
} from "@/domain/playground";

export function PlaygroundManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<(TemplateConfig & { _id: string }) | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"templates" | "instances">("templates");
  const [deployingIds, setDeployingIds] = useState<Record<string, boolean>>({});
  const [inspectingInstance, setInspectingInstance] = useState<{
    id: string;
    postName: string;
    type: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "templates"],
    queryFn: adminPlaygroundService.listTemplates,
  });

  const {
    data: activePlaygrounds = [],
    isLoading: isLoadingInstances,
    refetch: refetchInstances,
  } = useQuery({
    queryKey: ["admin", "playgrounds"],
    queryFn: adminPlaygroundService.listPlaygrounds,
    enabled: activeTab === "instances",
  });

  const deleteMutation = useMutation({
    mutationFn: adminPlaygroundService.deleteTemplate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast.success("Playground template deleted successfully");
    },
    onError: (err: unknown) => {
      toast.error((err as Error).message || "Failed to delete playground template");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" baseline profile?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl font-display text-foreground">
            Playground Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure baseline templates and monitor active running containers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void (activeTab === "templates" ? refetch() : refetchInstances())}
            disabled={activeTab === "templates" ? isLoading : isLoadingInstances}
            className="p-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-2)]/30 hover:bg-[var(--surface-2)] text-muted-foreground hover:text-foreground transition cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${(activeTab === "templates" ? isLoading : isLoadingInstances) ? "animate-spin" : ""}`}
            />
          </button>

          {activeTab === "templates" && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-cta)] text-xs font-semibold text-white px-4 py-2.5 shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Profile</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] pb-2">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === "templates"
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          Baseline Profiles
        </button>
        <button
          onClick={() => setActiveTab("instances")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "instances"
              ? "bg-indigo-500/10 text-indigo-400"
              : "text-muted-foreground hover:bg-white/[0.04]"
          }`}
        >
          <Activity className="h-4 w-4" />
          Active Instances
        </button>
      </div>

      {activeTab === "templates" ? (
        <>
          {}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col h-[220px] rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/20 animate-pulse overflow-hidden p-5 space-y-4"
                >
                  <div className="h-6 bg-white/[0.04] rounded w-3/4" />
                  <div className="h-4 bg-white/[0.04] rounded w-full" />
                  <div className="h-4 bg-white/[0.04] rounded w-2/3" />
                  <div className="flex gap-4 pt-4">
                    <div className="h-6 bg-white/[0.04] rounded w-1/4" />
                    <div className="h-6 bg-white/[0.04] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 border border-red-500/10 bg-red-500/5 rounded-2xl text-center space-y-2">
              <p className="text-sm text-red-400 font-semibold">
                Unable to connect to SmartSpace Service
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Please check that the sandbox playground backend is running on Port 3000 and
                database credentials are correctly aligned.
              </p>
              <button
                onClick={() => void refetch()}
                className="mt-4 px-3 py-1.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface)] text-xs text-foreground hover:bg-white/[0.02] transition"
              >
                Retry Connection
              </button>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Layers className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-sm text-foreground/80">
                No playground profiles defined
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Create your first baseline container profile using the template builder to start
                linking labs to course lessons.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {templates.map((tpl: TemplateConfig & { _id: string }) => {
                return (
                  <div
                    key={tpl._id}
                    className="flex flex-col lg:flex-row bg-[var(--surface-2)]/20 border border-[var(--hairline)] rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all overflow-hidden group"
                  >
                    {}
                    <div className="lg:w-1/3 p-6 bg-[var(--surface-2)]/30 border-b lg:border-b-0 lg:border-r border-[var(--hairline)]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          {tpl.image ? (
                            <div className="flex-shrink-0">
                              <img
                                src={tpl.image}
                                alt={tpl.name || "Config"}
                                className="w-16 h-16 rounded-lg object-cover border border-[var(--hairline)]"
                              />
                            </div>
                          ) : (
                            <div className="w-2 h-8 bg-indigo-500/50 rounded-full flex-shrink-0"></div>
                          )}

                          <div className="flex-1 min-w-0">
                            {tpl.name && (
                              <h2 className="text-base font-bold text-foreground truncate">
                                {tpl.name}
                              </h2>
                            )}
                            <p
                              className="font-mono text-[10px] text-muted-foreground truncate"
                              title={tpl._id}
                            >
                              ID: {tpl?._id?.substring(0, 12)}...
                            </p>

                            {tpl.description && (
                              <p
                                className="text-xs text-muted-foreground mt-2 line-clamp-2"
                                title={tpl.description}
                              >
                                {tpl.description}
                              </p>
                            )}

                            {tpl.keywords && tpl.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {tpl.keywords.slice(0, 4).map((keyword: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[10px] font-semibold border border-indigo-500/20"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {tpl.keywords.length > 4 && (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-[var(--surface-2)] text-muted-foreground rounded-md text-[10px] border border-[var(--hairline)]">
                                    +{tpl.keywords.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedConfig(tpl);
                              setIsEditModalOpen(true);
                            }}
                            className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-md transition-colors flex items-center border border-indigo-500/20"
                          >
                            <Edit2 className="w-3 h-3 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tpl._id, tpl.name)}
                            disabled={deleteMutation.isPending}
                            className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-md transition-colors flex items-center border border-red-500/20 disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete
                          </button>
                        </div>
                      </div>

                      {tpl.bridges && tpl.bridges.length > 0 && (
                        <>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center mt-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500/80 mr-2"></span>
                            Bridges
                            <span className="ml-2 bg-[var(--surface-2)] text-foreground py-0.5 px-2 rounded-full text-[10px]">
                              {tpl.bridges.length}
                            </span>
                          </h3>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {tpl.bridges.map((bridge: TemplateBridge, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 bg-[var(--surface)] border border-[var(--hairline)] rounded-xl hover:border-orange-500/30 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-mono text-xs font-semibold text-foreground">
                                    {bridge.bridge}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${bridge.nat ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-[var(--surface-2)] text-muted-foreground border border-[var(--hairline)]"}`}
                                  >
                                    {bridge.nat ? "NAT" : "BRIDGE"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {bridge["bridge-ip"]}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  Net: {bridge.network}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {}
                    <div className="lg:w-2/3 p-6 bg-transparent">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500/80 mr-2"></span>
                        Virtual Machines
                        <span className="ml-2 bg-[var(--surface-2)] text-foreground py-0.5 px-2 rounded-full text-[10px]">
                          {tpl.templates?.length || 0}
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {tpl.templates?.map((vm: TemplateVM, tIdx: number) => (
                          <div
                            key={tIdx}
                            className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--hairline)] hover:border-purple-500/30 transition-all"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="font-bold text-sm text-foreground">
                                  {vm.name || `Template ${tIdx + 1}`}
                                </div>
                              </div>
                              <div className="flex space-x-1.5">
                                {vm["is-zfs"] && (
                                  <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] rounded-md font-bold">
                                    ZFS
                                  </span>
                                )}
                                {vm["enable-overlay"] && (
                                  <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] rounded-md font-bold">
                                    OVL
                                  </span>
                                )}
                                {vm["enable-gui"] && (
                                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] rounded-md font-bold">
                                    GUI
                                  </span>
                                )}
                                {vm["enable-ide"] && (
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] rounded-md font-bold">
                                    IDE
                                  </span>
                                )}
                              </div>
                            </div>

                            {}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Cpu className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                                <span>
                                  {vm.cpu} Cores / {vm.ram} MB
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Sliders className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                                <span>User: {vm.username}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground col-span-2">
                                <Layers className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                                <span className="font-mono text-[10px] truncate" title={vm.kernel}>
                                  Kernel: {vm.kernel}
                                </span>
                              </div>
                              {vm["is-zfs"] && vm["zfs-snapshot"] && (
                                <div className="flex items-center text-xs text-muted-foreground col-span-2">
                                  <HardDrive className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                                  <span
                                    className="font-mono text-[10px] truncate"
                                    title={vm["zfs-snapshot"]}
                                  >
                                    Snap: {vm["zfs-snapshot"]}
                                  </span>
                                </div>
                              )}
                            </div>

                            {}
                            {vm.network && vm.network.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                  Network Interfaces
                                </div>
                                <div className="space-y-2">
                                  {vm.network.map((net: TemplateNetwork, nIdx: number) => (
                                    <div
                                      key={nIdx}
                                      className="flex items-center justify-between text-xs bg-[var(--surface-2)]/30 p-2.5 rounded-lg border border-[var(--hairline)]"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Activity className="w-3.5 h-3.5 text-muted-foreground/70" />
                                        <span className="font-semibold text-foreground">
                                          {net.name}
                                        </span>
                                        {net["is-primary"] && (
                                          <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[9px] font-bold">
                                            PRIMARY
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-2 text-muted-foreground text-[10px]">
                                        <span className="font-mono">{net.ip}</span>
                                        <span className="text-muted-foreground/50">→</span>
                                        <span className="font-mono font-bold text-orange-400">
                                          {net.bridge}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {}
                            {vm.disks && vm.disks.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                  Disks
                                </div>
                                <div className="space-y-2">
                                  {vm.disks.map((disk: TemplateDisk, dIdx: number) => (
                                    <div
                                      key={dIdx}
                                      className="flex justify-between items-center text-xs bg-[var(--surface-2)]/30 p-2.5 rounded-lg border border-[var(--hairline)]"
                                    >
                                      <div className="flex items-center">
                                        <HardDrive className="w-3.5 h-3.5 mr-2 text-muted-foreground/70" />
                                        <span className="font-semibold text-foreground">
                                          {disk.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-muted-foreground text-[10px] font-mono">
                                          {disk.size} MB
                                        </span>
                                        {disk["is-read-only"] && (
                                          <span className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--hairline)] text-muted-foreground rounded-md text-[9px] font-bold">
                                            RO
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoadingInstances ? (
            <div className="col-span-full py-12 flex justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activePlaygrounds.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[var(--hairline)] bg-[var(--surface-2)]/10 text-center">
              <Server className="h-10 w-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-sm text-foreground/80">No active instances</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                There are currently no running playgrounds in the system.
              </p>
            </div>
          ) : (
            (
              activePlaygrounds as {
                _id: string;
                status: string;
                post_name?: string;
                type?: string;
                userid?: string;
                from?: string;
                ip?: string;
                start?: number;
              }[]
            ).map((pg) => (
              <div
                key={pg._id}
                className="group relative flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface-2)]/20 p-5 shadow-sm transition-all"
              >
                <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${pg.status === "active" ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <h3 className="font-bold text-sm text-foreground">
                      {pg.post_name || "Provisioning..."}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {pg.status === "active" && pg.post_name && (
                      <button
                        onClick={() =>
                          setInspectingInstance({
                            id: pg._id,
                            postName: pg.post_name!,
                            type: pg.type || "",
                          })
                        }
                        className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                        title="Open Terminal"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-full">
                      {pg.type || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">User ID:</span>
                    <span className="truncate max-w-[120px]">{pg.userid}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Context:</span>
                    <span>{pg.from}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">IP:</span>
                    <span className="font-mono text-indigo-400">{pg.ip || "Assigning..."}</span>
                  </div>
                  {pg.start && (
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
                      <span className="font-medium flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Uptime:
                      </span>
                      <span>{Math.floor((Date.now() - pg.start) / 60000)} mins</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {}
      {isFormOpen && (
        <CreateConfigModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
            toast.success("Profile created successfully!");
          }}
        />
      )}

      {}
      {isEditModalOpen && selectedConfig && (
        <EditConfigModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedConfig(null);
          }}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
            toast.success("Profile updated successfully!");
          }}
          config={selectedConfig}
        />
      )}

      {}
      {inspectingInstance && (
        <div className="fixed inset-0 z-50 flex overflow-hidden bg-background/80 backdrop-blur-sm">
          <div className="w-full h-full md:w-[95vw] md:h-[95vh] md:m-auto flex flex-col bg-background border border-[var(--hairline)] md:rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-[var(--hairline)] bg-[var(--surface)] shrink-0">
              <div className="flex items-center gap-3">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-foreground">Admin Overriding Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Inspecting: {inspectingInstance.postName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingInstance(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 relative">
              <PlaygroundWorkspace
                config={{
                  pg: inspectingInstance.type,
                  pgname: inspectingInstance.type,
                  playground: inspectingInstance.type,
                  difficulty: "medium",
                  maxScore: 100,
                }}
                from="admin"
                fromId="admin-inspect"
                perm="rw"
                existingInstance={{
                  id: inspectingInstance.id,
                  postName: inspectingInstance.postName,
                }}
                onStop={() => setInspectingInstance(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
