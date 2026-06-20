import { memo } from "react";
import {
  TerminalSquare,
  Code,
  Monitor,
  SquareSplitVertical,
  Merge,
  RefreshCcw,
  Square,
  X,
  Plus,
} from "lucide-react";
import type { TemplateConfig } from "@/domain/playground";
import type { PlaygroundSessionPhase } from "../hooks/usePlaygroundSession";

export type ActivePanelTab = "terminal" | "vscode" | "desktop";

export interface TerminalTabEntry {
  vmId: number;
  tabId: number;
  displayNumber: number;
}

interface PlaygroundHeaderProps {
  templateConfig: TemplateConfig | null;
  phase: PlaygroundSessionPhase;
  activeTab: ActivePanelTab;
  onTabChange: (tab: ActivePanelTab) => void;
  terminalTabs: TerminalTabEntry[];
  activeTerminal: { vmId: number; tabId: number } | null;
  onTerminalSwitch: (vmId: number, tabId: number) => void;
  onAddTerminal: (vmId: number) => void;
  onRemoveTerminal: (vmId: number, tabId: number) => void;
  isSplit: boolean;
  onSplitToggle: () => void;
  onRefresh: () => void;
  onStop: () => void;
  vmCount: number;
}

const PHASE_BADGE: Record<PlaygroundSessionPhase, { label: string; className: string }> = {
  IDLE: {
    label: "Idle",
    className: "bg-muted/30 text-muted-foreground border-muted/30",
  },
  PROVISIONING: {
    label: "Provisioning…",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse",
  },
  BOOTING: {
    label: "Booting…",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse",
  },
  CONNECTING: {
    label: "Connecting…",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/30 animate-pulse",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  TEARDOWN: {
    label: "Stopping…",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  ERROR: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

function PlaygroundHeaderInner({
  templateConfig,
  phase,
  activeTab,
  onTabChange,
  terminalTabs,
  activeTerminal,
  onTerminalSwitch,
  onAddTerminal,
  onRemoveTerminal,
  isSplit,
  onSplitToggle,
  onRefresh,
  onStop,
  vmCount,
}: PlaygroundHeaderProps) {
  const hasIDE = templateConfig?.templates.some((t) => t["enable-ide"]) ?? false;
  const hasGUI = templateConfig?.templates.some((t) => t["enable-gui"]) ?? false;

  const badge = PHASE_BADGE[phase];

  const tabsByVm: Record<number, TerminalTabEntry[]> = {};
  for (const tab of terminalTabs) {
    if (!tabsByVm[tab.vmId]) tabsByVm[tab.vmId] = [];
    tabsByVm[tab.vmId].push(tab);
  }

  return (
    <div
      id="playground-header"
      className="flex items-center justify-between h-10 px-2 bg-card/80 backdrop-blur-md border-b border-border shrink-0 select-none z-20"
    >
      {}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 h-full">
        {}
        {hasIDE && (
          <HeaderTab
            icon={<Code className="h-3.5 w-3.5" />}
            label="VS Code"
            active={activeTab === "vscode"}
            onClick={() => onTabChange("vscode")}
          />
        )}

        {}
        {hasGUI && (
          <HeaderTab
            icon={<Monitor className="h-3.5 w-3.5" />}
            label="Desktop"
            active={activeTab === "desktop"}
            onClick={() => onTabChange("desktop")}
          />
        )}

        {}
        {Array.from({ length: vmCount }, (_, vmId) => (
          <div key={vmId} className="flex items-center gap-0.5 h-full">
            {(tabsByVm[vmId] ?? []).map((tab) => {
              const isActive =
                activeTab === "terminal" &&
                activeTerminal?.vmId === tab.vmId &&
                activeTerminal?.tabId === tab.tabId;
              const canRemove = (tabsByVm[vmId]?.length ?? 0) > 1;
              return (
                <button
                  key={`${tab.vmId}-${tab.tabId}`}
                  id={`terminal-tab-vm${tab.vmId}-t${tab.tabId}`}
                  onClick={() => {
                    onTabChange("terminal");
                    onTerminalSwitch(tab.vmId, tab.tabId);
                  }}
                  className={[
                    "group flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer",
                    "min-w-0 max-w-[140px] transition-all h-7",
                    isActive
                      ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_12px_-3px_var(--primary-glow)]"
                      : "bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  ].join(" ")}
                >
                  <TerminalSquare
                    className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : ""}`}
                  />
                  <span className="truncate">
                    VM{vmId + 1}.{tab.displayNumber}
                  </span>
                  {canRemove && (
                    <X
                      className="h-3 w-3 opacity-0 group-hover:opacity-80 hover:text-red-400 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTerminal(tab.vmId, tab.tabId);
                      }}
                    />
                  )}
                </button>
              );
            })}

            {}
            {(tabsByVm[vmId]?.length ?? 0) < 4 && (
              <button
                id={`add-terminal-vm${vmId}`}
                onClick={() => onAddTerminal(vmId)}
                title={`New terminal on VM ${vmId + 1}`}
                className="h-6 w-6 flex items-center justify-center rounded-md border border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center gap-1 pl-2 shrink-0">
        {}
        <span
          className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mr-1.5 ${badge.className}`}
        >
          {phase === "ACTIVE" && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
          )}
          {badge.label}
        </span>

        {}
        <ActionButton
          id="playground-split-toggle"
          icon={
            isSplit ? (
              <Merge className="h-3.5 w-3.5" />
            ) : (
              <SquareSplitVertical className="h-3.5 w-3.5" />
            )
          }
          title={isSplit ? "Merge terminals" : "Split terminal vertically"}
          onClick={onSplitToggle}
          active={isSplit}
        />

        {}
        <ActionButton
          id="playground-refresh"
          icon={<RefreshCcw className="h-3.5 w-3.5" />}
          title="Refresh active panel"
          onClick={onRefresh}
        />

        <div className="h-4 w-px bg-border mx-0.5" />

        {}
        <ActionButton
          id="playground-stop"
          icon={<Square className="h-3.5 w-3.5" />}
          title="Stop playground"
          onClick={onStop}
          danger
        />
      </div>
    </div>
  );
}

function HeaderTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer h-7 transition-all",
        active
          ? "bg-[#3c3c3c] border-[#4a4a4a] text-[#e5e5e5] shadow-sm"
          : "bg-[#2d2d2d] border-[#3a3a3a] text-[#cccccc] hover:bg-[#333] hover:text-[#e5e5e5]",
      ].join(" ")}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function ActionButton({
  id,
  icon,
  title,
  onClick,
  danger = false,
  active = false,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      id={id}
      title={title}
      onClick={onClick}
      className={[
        "h-7 w-7 flex items-center justify-center rounded-lg transition-all",
        danger
          ? "text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          : active
            ? "text-primary bg-primary/20 shadow-[0_0_12px_-3px_var(--primary-glow)]"
            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      ].join(" ")}
    >
      {icon}
    </button>
  );
}

export const PlaygroundHeader = memo(PlaygroundHeaderInner);
