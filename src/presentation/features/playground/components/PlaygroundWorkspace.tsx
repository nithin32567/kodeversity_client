import { memo, useCallback, useRef, useState, useEffect } from "react";
import type { PlaygroundConfig } from "@/domain/playground";
import { usePlaygroundSession } from "../hooks/usePlaygroundSession";
import { PlaygroundStatusOverlay } from "./PlaygroundStatusOverlay";
import { PlaygroundHeader, type ActivePanelTab, type TerminalTabEntry } from "./PlaygroundHeader";
import { TerminalPanel } from "./TerminalPanel";
import { CodeEditorPanel, type CodeEditorPanelHandle } from "./CodeEditorPanel";

interface PlaygroundWorkspaceProps {
  config: PlaygroundConfig;
  from: string;
  fromId: string;
  perm?: "rw" | "ro";
  existingInstance?: { id: string; postName: string };
  onStop?: () => void;
  onMarkComplete?: () => void;
}

interface TabEntry {
  vmId: number;
  tabId: number;
  displayNumber: number;
}

function initTerminalTabs(vmCount: number): TabEntry[] {
  return Array.from({ length: vmCount }, (_, vmId) => ({
    vmId,
    tabId: 0,
    displayNumber: 1,
  }));
}

function PlaygroundWorkspaceInner({
  config,
  from,
  fromId,
  perm = "rw",
  existingInstance,
  onStop,
}: PlaygroundWorkspaceProps) {
  const { session, phase, isActive, hasError, teardown, retry } = usePlaygroundSession(
    config,
    from,
    fromId,
    existingInstance,
  );

  const [activeTab, setActiveTab] = useState<ActivePanelTab>("terminal");
  const [isSplit, setIsSplit] = useState(() => {
    return localStorage.getItem("pg-split") === "true";
  });
  const [terminalTabs, setTerminalTabs] = useState<TabEntry[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<{
    vmId: number;
    tabId: number;
  } | null>(null);

  const vsCodeRef = useRef<CodeEditorPanelHandle>(null);
  const desktopRef = useRef<CodeEditorPanelHandle>(null);

  const vmCount = session.connection ? Math.max(1, session.connection.ips.length) : 1;
  const connectionPorts = session.connection ? Object.keys(session.connection.ports) : [];
  const hasIDE =
    session.templateConfig?.templates.some((t) => t["enable-ide"]) ??
    connectionPorts.some((k) => k.includes("ide") || k.includes("code"));
  const hasGUI =
    session.templateConfig?.templates.some((t) => t["enable-gui"]) ??
    connectionPorts.some((k) => k.includes("gui") || k.includes("vnc") || k.includes("desktop"));
  const showOverlay = !isActive && phase !== "TEARDOWN";

  useEffect(() => {
    if (isActive && session.connection) {
      const count = Math.max(1, session.connection.ips.length);
      setTerminalTabs(initTerminalTabs(count));
      setActiveTerminal({ vmId: 0, tabId: 0 });
    }
  }, [isActive, session.connection]);

  useEffect(() => {
    localStorage.setItem("pg-split", String(isSplit));
  }, [isSplit]);

  const handleAddTerminal = useCallback((vmId: number) => {
    setTerminalTabs((prev) => {
      const vmTabs = prev.filter((t) => t.vmId === vmId);
      if (vmTabs.length >= 4) return prev;
      const maxTabId = Math.max(-1, ...vmTabs.map((t) => t.tabId));
      const maxDisplay = Math.max(0, ...vmTabs.map((t) => t.displayNumber));
      const newTab: TabEntry = {
        vmId,
        tabId: maxTabId + 1,
        displayNumber: maxDisplay + 1,
      };
      return [...prev, newTab];
    });
  }, []);

  const handleRemoveTerminal = useCallback(
    (vmId: number, tabId: number) => {
      setTerminalTabs((prev) => {
        const vmTabs = prev.filter((t) => t.vmId === vmId);
        if (vmTabs.length <= 1) return prev;
        const next = prev.filter((t) => !(t.vmId === vmId && t.tabId === tabId));

        if (activeTerminal?.vmId === vmId && activeTerminal?.tabId === tabId) {
          const remaining = next.filter((t) => t.vmId === vmId);
          if (remaining.length > 0) {
            setActiveTerminal({ vmId, tabId: remaining[0].tabId });
          }
        }
        return next;
      });
    },
    [activeTerminal],
  );

  const handleTerminalSwitch = useCallback((vmId: number, tabId: number) => {
    setActiveTerminal({ vmId, tabId });
  }, []);

  const handleRefresh = useCallback(() => {
    if (activeTab === "vscode") vsCodeRef.current?.refresh();
    else if (activeTab === "desktop") desktopRef.current?.refresh();
  }, [activeTab]);

  const handleStop = useCallback(async () => {
    await teardown();
    onStop?.();
  }, [teardown, onStop]);

  if (showOverlay) {
    const phaseMap: Record<
      string,
      | "IDLE"
      | "GENERATING_ID"
      | "CREATING"
      | "POLLING"
      | "CONNECTING"
      | "READY"
      | "VALIDATING"
      | "SCORING"
      | "TEARING_DOWN"
      | "DESTROYED"
      | "ERROR"
    > = {
      IDLE: "IDLE",
      PROVISIONING: "GENERATING_ID",
      BOOTING: "POLLING",
      CONNECTING: "CONNECTING",
      ACTIVE: "READY",
      TEARDOWN: "TEARING_DOWN",
      ERROR: "ERROR",
    };
    const overlayInstance = {
      id: session.instanceId ?? "",
      phase: phaseMap[phase] ?? "IDLE",
      statusMessage: session.statusMessage,
      connection: session.connection,
      startTime: session.startTime,
      postName: session.postName,
      error: session.error,
    };

    return <PlaygroundStatusOverlay instance={overlayInstance} onRetry={retry} onCancel={onStop} />;
  }

  if (phase === "TEARDOWN") {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Playground environment has been stopped.</p>
      </div>
    );
  }

  const vmIdsWithIde = (session.templateConfig?.templates ?? [])
    .map((t, i) => (t["enable-ide"] ? i : -1))
    .filter((i) => i >= 0);
  void vmIdsWithIde;

  const pgId = session.instanceId!;

  return (
    <div
      id="playground-workspace"
      className="flex-1 flex flex-col overflow-hidden bg-background relative"
    >
      {}
      <PlaygroundHeader
        templateConfig={session.templateConfig}
        phase={phase}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        terminalTabs={terminalTabs.map(
          (t): TerminalTabEntry => ({
            vmId: t.vmId,
            tabId: t.tabId,
            displayNumber: t.displayNumber,
          }),
        )}
        activeTerminal={activeTerminal}
        onTerminalSwitch={handleTerminalSwitch}
        onAddTerminal={handleAddTerminal}
        onRemoveTerminal={handleRemoveTerminal}
        isSplit={isSplit}
        onSplitToggle={() => setIsSplit((v) => !v)}
        onRefresh={handleRefresh}
        onStop={handleStop}
        vmCount={vmCount}
      />

      {}
      <div id="playground-content" className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
        {}
        {terminalTabs.map((tab) => {
          const vmLabel = `vm${tab.vmId + 1}`;
          const isTabActive =
            activeTab === "terminal" &&
            activeTerminal?.vmId === tab.vmId &&
            activeTerminal?.tabId === tab.tabId;

          return (
            <div
              key={`${tab.vmId}-${tab.tabId}`}
              id={`terminal-container-${tab.vmId}-${tab.tabId}`}
              className="absolute inset-0 flex flex-col"
              style={{
                zIndex: isTabActive ? 5 : -1,
                opacity: isTabActive ? 1 : 0,
                pointerEvents: isTabActive ? "auto" : "none",
              }}
            >
              {isSplit ? (
                <SplitTerminalLayout
                  pg={pgId}
                  vmid={vmLabel}
                  vmNumber={tab.vmId + 1}
                  tabNumber={tab.tabId + 1}
                  perm={perm}
                  visible={isTabActive}
                />
              ) : (
                <TerminalPanel
                  pg={pgId}
                  vmid={vmLabel}
                  terminalId={`vmt-${tab.vmId + 1}${tab.tabId + 1}`}
                  perm={perm}
                  visible={isTabActive}
                />
              )}
            </div>
          );
        })}

        {}
        {hasIDE && session.instanceId && (
          <CodeEditorPanel
            ref={vsCodeRef}
            type="vscode"
            instanceId={session.instanceId}
            src={
              session.postName
                ? `${location.protocol}//${session.postName}-codeserverprt.${import.meta.env.VITE_PORT_URL ?? ""}`
                : ""
            }
            visible={activeTab === "vscode"}
          />
        )}

        {}
        {hasGUI && session.instanceId && (
          <CodeEditorPanel
            ref={desktopRef}
            type="desktop"
            instanceId={session.instanceId}
            src={
              session.postName
                ? `${location.protocol}//${session.postName}-desktopprt.${import.meta.env.VITE_PORT_URL ?? ""}`
                : ""
            }
            visible={activeTab === "desktop"}
          />
        )}
      </div>

      {}
      {hasError && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2 flex items-center gap-3 text-xs shadow-lg">
          <span className="text-destructive font-medium">{session.error}</span>
          <button onClick={retry} className="text-destructive/80 hover:text-destructive underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function SplitTerminalLayout({
  pg,
  vmid,
  vmNumber,
  tabNumber,
  perm,
  visible,
}: {
  pg: string;
  vmid: string;
  vmNumber: number;
  tabNumber: number;
  perm: "rw" | "ro";
  visible: boolean;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    const resizer = resizerRef.current;
    const container = containerRef.current;
    if (!top || !bottom || !resizer || !container) return;

    let isDragging = false;
    let startY = 0;
    let startTopHeight = 0;
    const MIN_HEIGHT = 80;
    const RESIZER_H = 6;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startTopHeight = top.offsetHeight;
      document.body.style.cursor = "row-resize";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dy = e.clientY - startY;
      let newTop = startTopHeight + dy;
      const total = container.offsetHeight;
      newTop = Math.max(MIN_HEIGHT, Math.min(newTop, total - MIN_HEIGHT - RESIZER_H));
      top.style.height = `${newTop}px`;
      top.style.flex = "none";
      bottom.style.height = `${total - newTop - RESIZER_H}px`;
      bottom.style.flex = "none";
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = "";
    };

    resizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      resizer.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div ref={topRef} className="flex-1 min-h-0 overflow-hidden top-terminal">
        <TerminalPanel
          pg={pg}
          vmid={vmid}
          terminalId={`vmt-${vmNumber}${tabNumber}`}
          perm={perm}
          visible={visible}
          splitPosition="top"
          isSplit
        />
      </div>
      <div
        ref={resizerRef}
        className="h-1.5 bg-border/30 hover:bg-primary/40 cursor-row-resize transition-colors shrink-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <div className="h-0.5 w-8 rounded-full bg-border/60" />
      </div>
      <div ref={bottomRef} className="flex-1 min-h-0 overflow-hidden bottom-terminal">
        <TerminalPanel
          pg={pg}
          vmid={vmid}
          terminalId={`vmt-${vmNumber}0`}
          perm={perm}
          visible={visible}
          splitPosition="bottom"
          isSplit
        />
      </div>
    </div>
  );
}

export const PlaygroundWorkspace = memo(PlaygroundWorkspaceInner);
