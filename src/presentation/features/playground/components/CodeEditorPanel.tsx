import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Code, Monitor, Loader2, RefreshCcw } from "lucide-react";
import { playgroundApi } from "../api";

export type EditorPanelType = "vscode" | "desktop";

export interface CodeEditorPanelProps {
  type: EditorPanelType;
  instanceId: string;
  src: string;
  visible: boolean;
  onReady?: () => void;
}

export interface CodeEditorPanelHandle {
  refresh: () => void;
}

function CodeEditorPanelInner(
  { type, instanceId, src, visible, onReady }: CodeEditorPanelProps,
  ref: React.Ref<CodeEditorPanelHandle>,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      if (!iframeRef.current) return;
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setIsLoading(true);
      setHasError(false);
      requestAnimationFrame(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      });
    },
  }));

  // ── Server initialization ───────────────────────────────────────────

  useEffect(() => {
    if (!src || !instanceId) return;

    // Server is initialized during CONNECTING phase in usePlaygroundSession
    setIsLoading(false);
    onReady?.();
  }, [type, instanceId, src, onReady]);

  // ── Panel metadata ──────────────────────────────────────────────────

  const meta = {
    vscode: {
      Icon: Code,
      label: "VS Code",
      subLabel: "Starting code-server…",
      loadingMsg: "Loading VS Code Editor",
    },
    desktop: {
      Icon: Monitor,
      label: "Desktop GUI",
      subLabel: "Starting desktop server…",
      loadingMsg: "Loading Desktop Environment",
    },
  }[type];

  return (
    <div
      id={`code-editor-panel-${type}`}
      className="absolute inset-0"
      style={{
        zIndex: visible ? 10 : -1,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0f]">
          {}
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <meta.Icon className="h-7 w-7 text-primary" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-primary/20 animate-ping" />
          </div>

          <h3 className="text-sm font-bold text-foreground mb-1">{meta.loadingMsg}</h3>
          <p className="text-xs text-muted-foreground mb-6">{meta.subLabel}</p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Please wait…</span>
          </div>
        </div>
      )}

      {}
      {hasError && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0f]">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
            <meta.Icon className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">Failed to load {meta.label}</p>
          <button
            onClick={() => {
              if (!iframeRef.current) return;
              setHasError(false);
              setIsLoading(true);
              const s = src;
              iframeRef.current.src = "";
              setTimeout(() => {
                if (iframeRef.current) iframeRef.current.src = s;
              }, 100);
            }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 text-foreground transition-colors"
          >
            <RefreshCcw className="h-3 w-3" />
            Reload
          </button>
        </div>
      )}

      {}
      {src && !isLoading && (
        <iframe
          ref={iframeRef}
          src={src}
          title={meta.label}
          className="w-full h-full border-0"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          style={{
            display: isLoading ? "none" : "block",
            backgroundColor: "transparent",
          }}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}

export const CodeEditorPanel = memo(forwardRef(CodeEditorPanelInner));
