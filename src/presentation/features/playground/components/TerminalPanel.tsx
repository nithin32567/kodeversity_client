import { memo, useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { TerminalWebSocket } from "@/infrastructure/playground/terminalWebSocket";

export interface TerminalPanelProps {
  pg: string;
  vmid: string;
  terminalId: string;
  perm?: "rw" | "ro";
  sessionOverride?: string;
  isSplit?: boolean;
  splitPosition?: "top" | "bottom";
  fontSize?: number;
  fontFamily?: string;
  visible?: boolean;
}

const DEFAULT_FONT_FAMILY =
  "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace";
const DEFAULT_FONT_SIZE = 14;

function TerminalPanelInner({
  pg,
  vmid,
  terminalId,
  perm = "rw",
  sessionOverride,
  isSplit = false,
  splitPosition,
  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = DEFAULT_FONT_FAMILY,
  visible = true,
}: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null!);

  const termRef = useRef<Terminal>(null!);
  const fitRef = useRef<FitAddon>(null!);
  const wsRef = useRef<TerminalWebSocket>(null!);
  const resizeHandlerRef = useRef<() => void>(null!);

  const handleCopy = useCallback(async () => {
    if (!termRef.current) return;
    const text = termRef.current.getSelection();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        void 0;
      }
    }
  }, []);

  const handlePaste = useCallback(async () => {
    if (!termRef.current || !wsRef.current) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        wsRef.current.send(`\x1b[200~${text}\x1b[201~`);
      }
    } catch {
      void 0;
    }
  }, []);

  const handleClear = useCallback(() => {
    termRef.current?.clear();
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const menu = document.createElement("div");
      menu.id = "pg-terminal-ctx-menu";
      menu.style.cssText = [
        `position: fixed`,
        `left: ${event.clientX}px`,
        `top: ${event.clientY}px`,
        `z-index: 9999`,
        `background: var(--card, #121212)`,
        `border: 1px solid var(--border)`,
        `border-radius: 0.5rem`,
        `padding: 4px`,
        `min-width: 120px`,
        `box-shadow: 0 4px 24px rgba(0,0,0,0.5)`,
        `font-family: inherit`,
        `font-size: 12px`,
      ].join(";");

      const items = [
        { label: "Copy", action: handleCopy },
        { label: "Paste", action: handlePaste },
        null,
        { label: "Clear", action: handleClear },
      ];

      for (const item of items) {
        if (!item) {
          const sep = document.createElement("div");
          sep.style.cssText = "height:1px;background:var(--border);margin:3px 0";
          menu.appendChild(sep);
          continue;
        }
        const btn = document.createElement("button");
        btn.textContent = item.label;
        btn.style.cssText = [
          "display:block;width:100%;text-align:left;padding:6px 12px",
          "color:var(--foreground);background:transparent;border:none",
          "cursor:pointer;border-radius:4px",
        ].join(";");
        btn.onmouseenter = () => (btn.style.background = "var(--secondary)");
        btn.onmouseleave = () => (btn.style.background = "transparent");
        btn.onclick = () => {
          item.action();
          menu.remove();
        };
        menu.appendChild(btn);
      }

      document.body.appendChild(menu);

      const removeMenu = (e: MouseEvent) => {
        if (!menu.contains(e.target as Node)) {
          menu.remove();
          document.removeEventListener("click", removeMenu);
        }
      };
      document.addEventListener("click", removeMenu);
    },
    [handleCopy, handlePaste, handleClear],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontFamily,
      fontSize,
      allowTransparency: true,
      theme: {
        background: "transparent",
        foreground: "var(--foreground, #e5e5e5)",
        cursor: "#a78bfa",
        selectionBackground: "rgba(167, 139, 250, 0.3)",
      },
      rightClickSelectsWord: true,
    });

    const fitAddon = new FitAddon();
    term.open(containerRef.current);
    term.loadAddon(fitAddon);

    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    termRef.current = term;
    fitRef.current = fitAddon;

    const ws = new TerminalWebSocket({
      pg,
      vmid,
      terminalId,
      perm,
      sessionOverride,
      onData: (data) => {
        term.write(data);
      },
      onOpen: () => {
        term.writeln("\x1b[32mConnected to playground terminal.\x1b[0m");
      },
      onClose: () => {
        term.writeln("\x1b[33m\r\n[Connection closed]\x1b[0m");
      },
    });

    try {
      if (containerRef.current?.clientWidth > 0) {
        fitAddon.fit();
      }
    } catch (e) {
      void 0;
    }

    ws.connect(term.cols, term.rows);

    wsRef.current = ws;

    const dataDisposable = term.onData((data) => {
      ws.send(data);
    });

    resizeHandlerRef.current = () => {
      try {
        if (containerRef.current?.clientWidth > 0) fitAddon.fit();
        ws.resize(term.cols, term.rows);
      } catch (e) {
        void 0;
      }
    };

    window.addEventListener("resize", resizeHandlerRef.current);

    const resizeObserver = new ResizeObserver(resizeHandlerRef.current);
    resizeObserver.observe(containerRef.current);

    const leftPane = document.querySelector(".left-pane") as HTMLElement | null;
    if (leftPane) resizeObserver.observe(leftPane);

    return () => {
      dataDisposable.dispose();
      window.removeEventListener("resize", resizeHandlerRef.current);
      resizeObserver.disconnect();
      ws.destroy();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontSize = fontSize;
      resizeHandlerRef.current?.();
    }
  }, [fontSize]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.fontFamily = fontFamily;
      resizeHandlerRef.current?.();
    }
  }, [fontFamily]);

  useEffect(() => {
    if (visible && fitRef.current) {
      requestAnimationFrame(() => {
        try {
          if (containerRef.current?.clientWidth > 0) fitRef.current?.fit();
        } catch (e) {
          void 0;
        }
        if (termRef.current && wsRef.current) {
          wsRef.current.resize(termRef.current.cols, termRef.current.rows);
        }
      });
    }
  }, [visible]);

  return (
    <div
      id={`terminal-panel-${vmid}-${terminalId}${splitPosition ? `-${splitPosition}` : ""}`}
      className={[
        "terminal-panel relative flex flex-col h-full bg-transparent overflow-hidden",
        isSplit && splitPosition === "top" ? "top-terminal" : "",
        isSplit && splitPosition === "bottom" ? "bottom-terminal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onContextMenu={handleContextMenu}
    >
      {/* Xterm mount point */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 p-2 bg-transparent"
        style={{ height: "100%", width: "100%" }}
      />

      {}
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground/10 pointer-events-none select-none">
        KODEVERSITY
      </div>
    </div>
  );
}

export const TerminalPanel = memo(TerminalPanelInner);
