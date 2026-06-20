import axios from "axios";
import { nanoid } from "nanoid";

const PORT_URL = (import.meta.env.VITE_PORT_URL as string) || "serverhostlayer.in";
const CONDUCTOR_HOST = `conductor.${PORT_URL}`;
const PING_INTERVAL_MS = 4_000;
const RESIZE_DEBOUNCE_MS = 100;
import { tokenStore } from "@/infrastructure/http/apiClient";

export type DataCallback = (data: string | Uint8Array) => void;

export interface TerminalWebSocketOptions {
  pg: string;
  vmid: string;
  terminalId: string;
  perm?: "rw" | "ro";
  sessionOverride?: string;
  onData: DataCallback;
  onOpen?: () => void;
  onClose?: () => void;
}

function getOrCreateSessionId(): string {
  const stored = sessionStorage.getItem("sessionid");
  if (stored) return stored;
  const id = nanoid(10);
  sessionStorage.setItem("sessionid", id);
  return id;
}

function decodeMessage(event: MessageEvent, cb: (data: Uint8Array | string) => void): void {
  if (event.data instanceof ArrayBuffer) {
    cb(new Uint8Array(event.data));
  } else if (event.data instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result && typeof reader.result !== "string") {
        cb(new Uint8Array(reader.result));
      }
    };
    reader.readAsArrayBuffer(event.data);
  } else {
    const str: string = typeof event.data === "string" ? event.data : String(event.data);

    try {
      const parsed = JSON.parse(str);
      if (parsed?.type === "pong") return;
    } catch {
      void 0;
    }
    cb(str);
  }
}

export class TerminalWebSocket {
  private socket: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private reconnectCount = 0;
  private lastCols = 80;
  private lastRows = 24;

  private readonly opts: Required<TerminalWebSocketOptions>;

  constructor(opts: TerminalWebSocketOptions) {
    this.opts = {
      perm: "rw",
      sessionOverride: "",
      onOpen: () => {},
      onClose: () => {},
      ...opts,
    };
  }

  // ── Connection ─────────────────────────────────────────────────────────

  /**
   * Open the WebSocket connection to the SmartSpace conductor.
   *
   * URL pattern (extracted from sandbox terminal.tsx line 218):
   *   ws(s)://conductor.{PORT_URL}/ws/{pg}/{vmid}/{session}-{terminalId}?cols={cols}&rows={rows}&perm={perm}
   */
  connect(cols: number, rows: number): void {
    if (this.destroyed) return;
    this.lastCols = cols;
    this.lastRows = rows;

    const { pg, vmid, terminalId, perm, sessionOverride, onData, onOpen, onClose } = this.opts;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const sessionId = sessionOverride || getOrCreateSessionId();
    const compositeSession = `${sessionId}-${terminalId}`;
    const token =
      tokenStore.get() ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";

    const url =
      `${protocol}://${CONDUCTOR_HOST}/ws/${pg}/${vmid}/${compositeSession}` +
      `?cols=${cols}&rows=${rows}&perm=${perm}${token ? `&token=${token}` : ""}`;

    const socket = new WebSocket(url);
    this.socket = socket;

    // Keepalive ping
    this.pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, PING_INTERVAL_MS);

    socket.onopen = () => {
      this.reconnectCount = 0;
      onOpen?.();
    };

    socket.onmessage = (event) => {
      decodeMessage(event, onData);
    };

    socket.onerror = () => {};

    socket.onclose = () => {
      this._clearPing();
      if (!this.destroyed) {
        const backoffMs = Math.min(1000 * Math.pow(1.5, this.reconnectCount), 10000);
        this.reconnectCount++;
        this.reconnectTimer = setTimeout(() => {
          if (!this.destroyed) this.connect(this.lastCols, this.lastRows);
        }, backoffMs);
      } else {
        onClose?.();
      }
    };
  }

  send(data: string): void {
    if (this.opts.perm === "ro") return;
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  resize(cols: number, rows: number): void {
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = setTimeout(() => {
      const { pg, vmid, terminalId, perm, sessionOverride } = this.opts;
      const sessionId = sessionOverride || sessionStorage.getItem("sessionid");
      if (!sessionId) return;

      const effectiveSession = sessionOverride && perm === "rw" ? sessionOverride : sessionId;
      const compositeSession = `${effectiveSession}-${terminalId}`;

      const protocol = window.location.protocol;
      const url =
        `${protocol}//${CONDUCTOR_HOST}/resize/${pg}/${vmid}/${compositeSession}` +
        `?cols=${cols}&rows=${rows}`;

      axios.get(url, { withCredentials: false }).catch(() => {});
    }, RESIZE_DEBOUNCE_MS);
  }

  destroy(): void {
    this.destroyed = true;
    this._clearPing();
    if (this.resizeTimer !== null) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  private _clearPing(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
