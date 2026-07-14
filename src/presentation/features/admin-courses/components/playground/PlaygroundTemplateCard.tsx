import { Edit2, Trash2, Cpu, Sliders, Layers, HardDrive, Activity } from "lucide-react";
import type {
  TemplateConfig,
  TemplateBridge,
  TemplateVM,
  TemplateNetwork,
  TemplateDisk,
} from "./types";

interface PlaygroundTemplateCardProps {
  tpl: TemplateConfig & { _id: string };
  isDeleting: boolean;
  onEdit: (tpl: TemplateConfig & { _id: string }) => void;
  onDelete: (id: string, name: string) => void;
}

export function PlaygroundTemplateCard({
  tpl,
  isDeleting,
  onEdit,
  onDelete,
}: PlaygroundTemplateCardProps) {
  return (
    <div className="flex flex-col lg:flex-row bg-[var(--surface-2)]/20 border border-[var(--hairline)] rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all overflow-hidden group">
      {/* Left side: Profile Information */}
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
                <h2 className="text-base font-bold text-foreground truncate">{tpl.name}</h2>
              )}
              <p className="font-mono text-[10px] text-muted-foreground truncate" title={tpl._id}>
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
              onClick={() => onEdit(tpl)}
              className="px-2 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-md transition-colors flex items-center border border-indigo-500/20"
            >
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </button>
            <button
              onClick={() => onDelete(tpl._id, tpl.name || "Unnamed Profile")}
              disabled={isDeleting}
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

      {/* Right side: Virtual Machines */}
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

              {/* VM Specs */}
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
                    <span className="font-mono text-[10px] truncate" title={vm["zfs-snapshot"]}>
                      Snap: {vm["zfs-snapshot"]}
                    </span>
                  </div>
                )}
              </div>

              {/* Network Interfaces */}
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
                          <span className="font-semibold text-foreground">{net.name}</span>
                          {net["is-primary"] && (
                            <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[9px] font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground text-[10px]">
                          <span className="font-mono">{net.ip}</span>
                          <span className="text-muted-foreground/50">→</span>
                          <span className="font-mono font-bold text-orange-400">{net.bridge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disks */}
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
                          <span className="font-semibold text-foreground">{disk.name}</span>
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
}
