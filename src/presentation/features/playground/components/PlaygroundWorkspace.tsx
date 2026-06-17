/**
 * PlaygroundWorkspace.tsx — Main playground workspace component.
 *
 * Renders the full-height split-pane environment with:
 * - Terminal panel (left/main) with Xterm.js-ready iframe
 * - Optional code-server / desktop GUI iframes
 * - Status overlay during provisioning phases
 * - Automatic cleanup on unmount
 *
 * This component is designed to be embedded within the Student Course Viewer
 * when a chapter of type "PLAYGROUND" is active.
 */

import { memo, useCallback, useRef, useState } from "react";
import {
  TerminalSquare,
  Code,
  Monitor,
  RefreshCcw,
  Square,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { PlaygroundConfig, TemplateConfig } from "@/domain/playground";
import { usePlaygroundLifecycle } from "../hooks/usePlaygroundLifecycle";
import { PlaygroundStatusOverlay } from "./PlaygroundStatusOverlay";

// ─── Constants ──────────────────────────────────────────────────────────────

const PLAYGROUND_PORT_URL = (import.meta.env.VITE_PORT_URL as string) ?? "";

// ─── Tab Types ──────────────────────────────────────────────────────────────

type ActiveTab = "terminal" | "vscode" | "desktop";

// ─── Props ──────────────────────────────────────────────────────────────────

interface PlaygroundWorkspaceProps {
  /** Playground configuration from the chapter entity. */
  config: PlaygroundConfig;
  /** Origin context: "course" or "challenge". */
  from: string;
  /** ID of the course or challenge. */
  fromId: string;
  /** Callback when the user stops/exits the playground. */
  onStop?: () => void;
  /** Callback for marking the lesson complete. */
  onMarkComplete?: () => void;
  /** Optional: Markdown/document content for split-pane instructions. */
  instructionContent?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

function PlaygroundWorkspaceInner({
  config,
  from,
  fromId,
  onStop,
}: PlaygroundWorkspaceProps) {
  const { instance, templateConfig, teardown, hasError, retry } =
    usePlaygroundLifecycle(config, from, fromId);

  const [activeTab, setActiveTab] = useState<ActiveTab>("terminal");
  const [isMaximized, setIsMaximized] = useState(false);

  // Iframe refs for refresh functionality
  const terminalIframeRef = useRef<HTMLIFrameElement>(null);
  const vscodeIframeRef = useRef<HTMLIFrameElement>(null);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);

  // ── Derived state ─────────────────────────────────────────────────────

  const isReady = instance.phase === "READY";
  const showOverlay = !isReady && instance.phase !== "DESTROYED";
  const hasIDE = templateConfig?.templates.some((t) => t["enable-ide"]) ?? false;
  const hasGUI = templateConfig?.templates.some((t) => t["enable-gui"]) ?? false;

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleStop = useCallback(async () => {
    await teardown();
    onStop?.();
  }, [teardown, onStop]);

  const handleRefresh = useCallback(() => {
    const refs: Record<ActiveTab, React.RefObject<HTMLIFrameElement | null>> = {
      terminal: terminalIframeRef,
      vscode: vscodeIframeRef,
      desktop: desktopIframeRef,
    };
    const iframe = refs[activeTab]?.current;
    if (iframe) {
      iframe.src = iframe.src;
    }
  }, [activeTab]);

  // ── Build iframe URLs ─────────────────────────────────────────────────

  const buildTerminalUrl = () => {
    if (!instance.postName || !PLAYGROUND_PORT_URL) return "";
    return `${location.protocol}//${instance.postName}-terminalprt.${PLAYGROUND_PORT_URL}`;
  };

  const buildVSCodeUrl = () => {
    if (!instance.postName || !PLAYGROUND_PORT_URL) return "";
    return `${location.protocol}//${instance.postName}-codeserverprt.${PLAYGROUND_PORT_URL}`;
  };

  const buildDesktopUrl = () => {
    if (!instance.postName || !PLAYGROUND_PORT_URL) return "";
    return `${location.protocol}//${instance.postName}-desktopprt.${PLAYGROUND_PORT_URL}`;
  };

  // ── Render overlay during provisioning ────────────────────────────────

  if (showOverlay) {
    return (
      <PlaygroundStatusOverlay
        instance={instance}
        onRetry={retry}
        onCancel={onStop}
      />
    );
  }

  // ── Main workspace UI ─────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-10 px-2 bg-card border-b border-border shrink-0 select-none">
        {/* Left: Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* Terminal Tab */}
          <TabButton
            icon={<TerminalSquare className="h-3.5 w-3.5" />}
            label="Terminal"
            active={activeTab === "terminal"}
            onClick={() => setActiveTab("terminal")}
          />

          {/* VS Code Tab (conditional) */}
          {hasIDE && (
            <TabButton
              icon={<Code className="h-3.5 w-3.5" />}
              label="VS Code"
              active={activeTab === "vscode"}
              onClick={() => setActiveTab("vscode")}
            />
          )}

          {/* Desktop Tab (conditional) */}
          {hasGUI && (
            <TabButton
              icon={<Monitor className="h-3.5 w-3.5" />}
              label="Desktop"
              active={activeTab === "desktop"}
              onClick={() => setActiveTab("desktop")}
            />
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<RefreshCcw className="h-3.5 w-3.5" />}
            title="Refresh"
            onClick={handleRefresh}
          />
          <ActionButton
            icon={
              isMaximized ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )
            }
            title={isMaximized ? "Restore" : "Maximize"}
            onClick={() => setIsMaximized(!isMaximized)}
          />
          <div className="h-4 w-px bg-border mx-0.5" />
          <ActionButton
            icon={<Square className="h-3.5 w-3.5" />}
            title="Stop Playground"
            onClick={handleStop}
            danger
          />
        </div>
      </div>

      {/* ── Content Area ──────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
        {/* Terminal iframe */}
        <IframePane
          ref={terminalIframeRef}
          src={buildTerminalUrl()}
          visible={activeTab === "terminal"}
          title="Terminal"
        />

        {/* VS Code iframe */}
        {hasIDE && (
          <IframePane
            ref={vscodeIframeRef}
            src={buildVSCodeUrl()}
            visible={activeTab === "vscode"}
            title="VS Code"
          />
        )}

        {/* Desktop iframe */}
        {hasGUI && (
          <IframePane
            ref={desktopIframeRef}
            src={buildDesktopUrl()}
            visible={activeTab === "desktop"}
            title="Desktop GUI"
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TabButton({
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
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
        active
          ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_12px_-3px_var(--primary-glow)]"
          : "bg-transparent border-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}

function ActionButton({
  icon,
  title,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all ${
        danger
          ? "text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      {icon}
    </button>
  );
}

import { forwardRef } from "react";

const IframePane = forwardRef<
  HTMLIFrameElement,
  { src: string; visible: boolean; title: string }
>(function IframePane({ src, visible, title }, ref) {
  if (!src) return null;

  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: visible ? 10 : -1,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <iframe
        ref={ref}
        src={src}
        title={title}
        className="w-full h-full border-0 bg-[#0a0a0f]"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
});

// ─── Export ──────────────────────────────────────────────────────────────────

export const PlaygroundWorkspace = memo(PlaygroundWorkspaceInner);
