import { useCallback, useEffect, useRef, useState } from "react";
import { playgroundApi } from "../api";
import type {
  PlaygroundConfig,
  PlaygroundLifecyclePhase,
  PlaygroundConnectionInfo,
  TemplateConfig,
} from "@/domain/playground";
import { tokenStore } from "@/infrastructure/http/apiClient";

export type PlaygroundSessionPhase =
  | "IDLE"
  | "PROVISIONING"
  | "BOOTING"
  | "CONNECTING"
  | "ACTIVE"
  | "TEARDOWN"
  | "ERROR";

function toSessionPhase(internal: PlaygroundLifecyclePhase): PlaygroundSessionPhase {
  switch (internal) {
    case "IDLE":
      return "IDLE";
    case "GENERATING_ID":
    case "CREATING":
      return "PROVISIONING";
    case "POLLING":
      return "BOOTING";
    case "CONNECTING":
      return "CONNECTING";
    case "READY":
    case "VALIDATING":
    case "SCORING":
      return "ACTIVE";
    case "TEARING_DOWN":
    case "DESTROYED":
      return "TEARDOWN";
    case "ERROR":
      return "ERROR";
    default:
      return "IDLE";
  }
}

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 60;
const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1_000;

export interface PlaygroundSessionState {
  phase: PlaygroundSessionPhase;
  statusMessage: string;
  instanceId: string | null;
  postName: string | null;
  startTime: number | null;
  connection: PlaygroundConnectionInfo | null;
  error: string | null;
  templateConfig: TemplateConfig | null;
}

export interface UsePlaygroundSessionReturn {
  session: PlaygroundSessionState;
  phase: PlaygroundSessionPhase;
  isActive: boolean;
  hasError: boolean;
  teardown: () => Promise<void>;
  retry: () => void;
  runTest: (
    vm: string,
    test: string,
    args?: string[],
  ) => Promise<{ message: string; passed: boolean }>;
  buildWsUrl: (vmid: string, terminalId: string, cols: number, rows: number) => string;
  buildVsCodeUrl: () => string;
  buildDesktopUrl: () => string;
}

function createInitialState(): PlaygroundSessionState {
  return {
    phase: "IDLE",
    statusMessage: "Initializing playground…",
    instanceId: null,
    postName: null,
    startTime: null,
    connection: null,
    error: null,
    templateConfig: null,
  };
}

const PORT_URL = (import.meta.env.VITE_PORT_URL as string) || "serverhostlayer.in";

export function usePlaygroundSession(
  config: PlaygroundConfig,
  from: string,
  fromId: string,
  existingInstance?: { id: string; postName: string },
): UsePlaygroundSessionReturn {
  const [session, setSession] = useState<PlaygroundSessionState>(createInitialState);
  const [retryKey, setRetryKey] = useState(0);

  const instanceIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tornDownRef = useRef(false);
  const skipTeardownRef = useRef(!!existingInstance);

  const updateSession = useCallback(
    (
      phase: PlaygroundSessionPhase,
      statusMessage: string,
      extra?: Partial<PlaygroundSessionState>,
    ) => {
      setSession((prev) => ({ ...prev, phase, statusMessage, ...extra }));
    },
    [],
  );

  const setError = useCallback(
    (message: string) => {
      updateSession("ERROR", message, { error: message });
    },
    [updateSession],
  );

  const provision = useCallback(async () => {
    if (!isMountedRef.current) return;
    tornDownRef.current = false;

    try {
      if (existingInstance) {
        instanceIdRef.current = existingInstance.id;
        setSession((prev) => ({
          ...prev,
          instanceId: existingInstance.id,
          postName: existingInstance.postName,
        }));

        updateSession("CONNECTING", "Establishing connection to active instance…");
        const connection = await playgroundApi.getConnectionInfo(existingInstance.id);
        if (!isMountedRef.current) return;

        if (!connection || connection.ips.length === 0) {
          setError("Failed to obtain a reachable bridge IP.");
          return;
        }

        let templateConfig = null;
        try {
          if (config?.pg) templateConfig = await playgroundApi.getTemplateConfig(config.pg);
        } catch {
          void 0;
        }

        const connectionPorts = connection ? Object.keys(connection.ports) : [];
        const hasIDE =
          templateConfig?.templates.some((t) => t["enable-ide"]) ??
          connectionPorts.some((k) => k.includes("ide") || k.includes("code"));
        const hasGUI =
          templateConfig?.templates.some((t) => t["enable-gui"]) ??
          connectionPorts.some(
            (k) => k.includes("gui") || k.includes("vnc") || k.includes("desktop"),
          );

        if (hasIDE) {
          try {
            await playgroundApi.openCodeServer(existingInstance.id);
          } catch (e) {
            console.error(e);
          }
        }
        if (hasGUI) {
          try {
            await playgroundApi.openDesktopServer(existingInstance.id);
          } catch (e) {
            console.error(e);
          }
        }

        updateSession("ACTIVE", "Playground is ready!", { connection, templateConfig });

        keepaliveRef.current = setInterval(() => {
          playgroundApi.poll(existingInstance.id).catch(() => {});
        }, KEEPALIVE_INTERVAL_MS);
        return;
      }

      updateSession("PROVISIONING", "Allocating playground instance…");
      const { id } = await playgroundApi.generateId(
        config.pg,
        config.pgname,
        config.playground,
        from,
        fromId,
      );
      if (!isMountedRef.current) return;

      instanceIdRef.current = id;
      setSession((prev) => ({ ...prev, instanceId: id }));

      updateSession("PROVISIONING", "Spinning up container…");
      const createResult = await playgroundApi.create(id);
      if (!isMountedRef.current) return;

      setSession((prev) => ({
        ...prev,
        startTime: createResult.startTime,
        postName: createResult.postName,
        statusMessage: createResult.message || "Container created, waiting for boot…",
      }));

      updateSession("BOOTING", "Waiting for environment to be ready…");
      let ready = false;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (!isMountedRef.current) return;
        ready = await playgroundApi.poll(id);
        if (ready) break;
        await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      if (!isMountedRef.current) return;

      if (!ready) {
        setError("Environment timed out — please retry.");
        return;
      }

      updateSession("CONNECTING", "Establishing connection…");
      const connection = await playgroundApi.getConnectionInfo(id);
      if (!isMountedRef.current) return;

      if (!connection || connection.ips.length === 0) {
        setError("Failed to obtain a reachable bridge IP.");
        return;
      }

      let templateConfig = null;
      try {
        if (config?.pg) templateConfig = await playgroundApi.getTemplateConfig(config.pg);
      } catch {
        void 0;
      }

      const connectionPorts = connection ? Object.keys(connection.ports) : [];
      const hasIDE =
        templateConfig?.templates.some((t) => t["enable-ide"]) ??
        connectionPorts.some((k) => k.includes("ide") || k.includes("code"));
      const hasGUI =
        templateConfig?.templates.some((t) => t["enable-gui"]) ??
        connectionPorts.some(
          (k) => k.includes("gui") || k.includes("vnc") || k.includes("desktop"),
        );

      if (hasIDE) {
        try {
          await playgroundApi.openCodeServer(id);
        } catch (e) {
          console.error(e);
        }
      }
      if (hasGUI) {
        try {
          await playgroundApi.openDesktopServer(id);
        } catch (e) {
          console.error(e);
        }
      }

      updateSession("ACTIVE", "Playground is ready!", { connection, templateConfig });

      keepaliveRef.current = setInterval(() => {
        const currentId = instanceIdRef.current;
        if (currentId) {
          playgroundApi.poll(currentId).catch(() => {});
        }
      }, KEEPALIVE_INTERVAL_MS);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to provision playground.";
      setError(message);
    }
  }, [config, from, fromId, existingInstance, updateSession, setError]);

  const teardown = useCallback(async () => {
    if (tornDownRef.current || skipTeardownRef.current) return;
    tornDownRef.current = true;

    if (keepaliveRef.current) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }

    const id = instanceIdRef.current;
    if (!id) return;

    instanceIdRef.current = null;
    updateSession("TEARDOWN", "Cleaning up environment…");

    try {
      await playgroundApi.teardown(id);
    } catch {
      void 0;
    }

    if (isMountedRef.current) {
      updateSession("TEARDOWN", "Playground environment destroyed.");
    }
  }, [updateSession]);

  const runTest = useCallback(async (vm: string, test: string, args: string[] = []) => {
    const id = instanceIdRef.current;
    if (!id) {
      return { message: "No active playground instance.", passed: false };
    }
    try {
      const result = await playgroundApi.checkTest(id, vm, test, args);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Validation failed.";
      return { message, passed: false };
    }
  }, []);

  const retry = useCallback(() => {
    if (keepaliveRef.current) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }
    instanceIdRef.current = null;
    tornDownRef.current = false;
    setSession(createInitialState());
    setRetryKey((k) => k + 1);
  }, []);

  const buildWsUrl = useCallback(
    (vmid: string, terminalId: string, cols: number, rows: number): string => {
      if (!session.instanceId || !PORT_URL) return "";
      const { pg, playground: _playground } = config;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const sessionId =
        sessionStorage.getItem("sessionid") ||
        (() => {
          const id = Math.random().toString(36).slice(2, 12);
          sessionStorage.setItem("sessionid", id);
          return id;
        })();
      return (
        `${protocol}://conductor.${PORT_URL}/ws/${pg}/${vmid}/${sessionId}-${terminalId}` +
        `?cols=${cols}&rows=${rows}&perm=rw`
      );
    },
    [session.instanceId, config],
  );

  const buildVsCodeUrl = useCallback((): string => {
    if (!session.postName || !PORT_URL) return "";
    return `${location.protocol}//${session.postName}-codeserverprt.${PORT_URL}`;
  }, [session.postName]);

  const buildDesktopUrl = useCallback((): string => {
    if (!session.postName || !PORT_URL) return "";
    return `${location.protocol}//${session.postName}-desktopprt.${PORT_URL}`;
  }, [session.postName]);

  // ── Effects ─────────────────────────────────────────────────────────────

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-provision on mount + retry
  useEffect(() => {
    provision();
    // retryKey is intentional — provision() itself is stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  // Bulletproof teardown: fires on both React unmount AND page unload
  useEffect(() => {
    const skipTeardownInitial = skipTeardownRef.current;
    const handleBeforeUnload = () => {
      const id = instanceIdRef.current;
      if (!id || tornDownRef.current || skipTeardownInitial) return;
      tornDownRef.current = true;
      instanceIdRef.current = null;
      // `sendBeacon` is the only reliable way to fire DELETE on page close.
      // The backend must support DELETE via POST with _method override, OR
      // we use a keepalive fetch as a fallback:
      const url = `${import.meta.env.VITE_PLAYGROUND_SERVICE_URL ?? "http://localhost:4000"}/api/playground/${id}`;

      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, ""); // Will be ignored by DELETE-only endpoints
      }
      // Reliable fallback: synchronous XHR (deprecated but works for teardown)
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("DELETE", url, false);
        const token =
          tokenStore.get() ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token") ||
          "";
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send();
      } catch {
        void 0;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (keepaliveRef.current) {
        clearInterval(keepaliveRef.current);
        keepaliveRef.current = null;
      }
      const id = instanceIdRef.current;
      if (id && !tornDownRef.current && !skipTeardownInitial) {
        tornDownRef.current = true;
        instanceIdRef.current = null;

        playgroundApi.teardown(id).catch(() => {});
      }
    };
  }, []);

  return {
    session,
    phase: session.phase,
    isActive: session.phase === "ACTIVE",
    hasError: session.phase === "ERROR",
    teardown,
    retry,
    runTest,
    buildWsUrl,
    buildVsCodeUrl,
    buildDesktopUrl,
  };
}

export { toSessionPhase };
