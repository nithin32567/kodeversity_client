import { useState } from "react";
import {
  Edit2,
  Trash2,
  Cpu,
  Layers,
  HardDrive,
  Network,
  ChevronDown,
  ChevronUp,
  Monitor,
  Code,
} from "lucide-react";
import type { TemplateConfig } from "./types";

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
  const [showDetails, setShowDetails] = useState(false);

  const vmCount = tpl.templates?.length || 0;
  const bridgeCount = tpl.bridges?.length || 0;
  const hasGui = tpl.templates?.some((vm) => vm["enable-gui"]);
  const hasIde = tpl.templates?.some((vm) => vm["enable-ide"]);
  const hasZfs = tpl.templates?.some((vm) => vm["is-zfs"]);

  const totalCpu = tpl.templates?.reduce((acc, vm) => acc + (vm.cpu || 0), 0) || 0;
  const totalRam = tpl.templates?.reduce((acc, vm) => acc + (vm.ram || 0), 0) || 0;

  return (
    <div className="flex flex-col justify-between bg-[var(--surface-2)]/20 border border-[var(--hairline)] rounded-xl shadow-sm hover:border-indigo-500/30 hover:shadow-md transition-all p-4 relative group">
      {/* Top Section: Header & Quick Actions */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {tpl.image ? (
              <img
                src={tpl.image}
                alt={tpl.name || "Template"}
                className="w-9 h-9 rounded-lg object-cover border border-[var(--hairline)] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground truncate" title={tpl.name}>
                {tpl.name || "Unnamed Profile"}
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground truncate" title={tpl._id}>
                ID: {tpl._id ? `${tpl._id.substring(0, 10)}...` : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(tpl)}
              className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-colors border border-indigo-500/20"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(tpl._id, tpl.name || "Unnamed Profile")}
              disabled={isDeleting}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors border border-red-500/20 disabled:opacity-50"
              title="Delete Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {tpl.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5" title={tpl.description}>
            {tpl.description}
          </p>
        )}

        {/* Keywords */}
        {tpl.keywords && tpl.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {tpl.keywords.slice(0, 3).map((keyword, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-semibold border border-indigo-500/20"
              >
                {keyword}
              </span>
            ))}
            {tpl.keywords.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-[var(--surface-2)] text-muted-foreground rounded text-[10px] border border-[var(--hairline)]">
                +{tpl.keywords.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Specs Chips & Summary */}
      <div className="pt-2.5 mt-1 border-t border-[var(--hairline)] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-foreground">{vmCount}</span>
            <span>{vmCount === 1 ? "VM" : "VMs"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>{totalCpu} Cores</span>
            <span className="text-[10px] text-muted-foreground/60">•</span>
            <span>{totalRam >= 1024 ? `${(totalRam / 1024).toFixed(1)} GB` : `${totalRam} MB`}</span>
          </div>

          {bridgeCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Network className="w-3.5 h-3.5 text-orange-400" />
              <span>{bridgeCount} Br</span>
            </div>
          )}
        </div>

        {/* Feature Badges */}
        {(hasGui || hasIde || hasZfs) && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {hasGui && (
              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] rounded font-bold flex items-center gap-1">
                <Monitor className="w-2.5 h-2.5" /> GUI
              </span>
            )}
            {hasIde && (
              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] rounded font-bold flex items-center gap-1">
                <Code className="w-2.5 h-2.5" /> IDE
              </span>
            )}
            {hasZfs && (
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] rounded font-bold flex items-center gap-1">
                <HardDrive className="w-2.5 h-2.5" /> ZFS
              </span>
            )}
          </div>
        )}

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>{showDetails ? "Hide Quick Specs" : "View Quick Specs"}</span>
          {showDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showDetails && (
          <div className="pt-1.5 space-y-1.5 text-[11px] animate-fadeIn">
            {tpl.templates?.map((vm, idx) => (
              <div
                key={idx}
                className="p-2 bg-[var(--surface)] rounded border border-[var(--hairline)] space-y-1"
              >
                <div className="font-semibold text-foreground flex justify-between items-center">
                  <span>{vm.name || `VM ${idx + 1}`}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {vm.username}
                  </span>
                </div>
                <div className="text-muted-foreground text-[10px] flex flex-wrap gap-2">
                  <span>
                    {vm.cpu} Core / {vm.ram}MB
                  </span>
                  <span>Kernel: {vm.kernel}</span>
                </div>
              </div>
            ))}
            {tpl.bridges && tpl.bridges.length > 0 && (
              <div className="p-2 bg-[var(--surface)] rounded border border-[var(--hairline)] space-y-1">
                <div className="font-semibold text-orange-400 text-[10px] uppercase tracking-wider">
                  Bridges
                </div>
                {tpl.bridges.map((b, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] font-mono text-muted-foreground flex justify-between items-center"
                  >
                    <span>{b.bridge}</span>
                    <span>{b["bridge-ip"]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

