/**
 * usePlaygroundLifecycle.ts — Custom hook orchestrating the full 7-step
 * playground provisioning lifecycle as a state machine.
 *
 * Responsibilities:
 * 1. Fetch template config
 * 2. Generate instance ID
 * 3. Create the container
 * 4. Poll until ready
 * 5. Fetch connection info
 * 6. Expose teardown + test validation
 * 7. Auto-teardown on unmount
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PlaygroundLifecyclePhase,
  PlaygroundInstance,
  PlaygroundConfig,
  TemplateConfig,
} from "@/domain/playground";
import { playgroundApi } from "../api";

// ─── Constants ──────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 60; // ~3 minutes max wait
const KEEPALIVE_INTERVAL_MS = 2.5 * 60 * 1000; // 2.5 minutes

// ─── Hook Return Type ───────────────────────────────────────────────────────

export interface UsePlaygroundLifecycleReturn {
  /** The current playground instance state. */
  instance: PlaygroundInstance;
  /** The fetched template configuration (null until loaded). */
  templateConfig: TemplateConfig | null;
  /** Manually trigger teardown (also fires on unmount). */
  teardown: () => Promise<void>;
  /** Run a validation test against the playground. */
  runTest: (
    vm: string,
    test: string,
    args?: string[],
  ) => Promise<{ message: string; passed: boolean }>;
  /** Whether the lifecycle is in a terminal error state. */
  hasError: boolean;
  /** Retry provisioning from scratch (after error). */
  retry: () => void;
}

// ─── Initial State ──────────────────────────────────────────────────────────

function createInitialInstance(): PlaygroundInstance {
  return {
    id: "",
    phase: "IDLE",
    statusMessage: "Initializing…",
    connection: null,
    startTime: null,
    postName: null,
    error: null,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePlaygroundLifecycle(
  config: PlaygroundConfig,
  /** Origin context: "course" or "challenge". */
  from: string,
  /** ID of the course or challenge triggering this. */
  fromId: string,
): UsePlaygroundLifecycleReturn {
  const [instance, setInstance] = useState<PlaygroundInstance>(createInitialInstance);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Refs for cleanup safety
  const instanceIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const updatePhase = useCallback(
    (phase: PlaygroundLifecyclePhase, statusMessage: string, extra?: Partial<PlaygroundInstance>) => {
      setInstance((prev) => ({ ...prev, phase, statusMessage, ...extra }));
    },
    [],
  );

  const setError = useCallback(
    (message: string) => {
      updatePhase("ERROR", message, { error: message });
    },
    [updatePhase],
  );

  // ── Core Lifecycle ─────────────────────────────────────────────────────

  const provision = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      // Phase 0: Fetch template config
      updatePhase("GENERATING_ID", "Loading template configuration…");
      const template = await playgroundApi.getTemplateConfig(config.pg);
      if (!isMountedRef.current) return;
      setTemplateConfig(template);

      // Phase 1: Generate instance ID
      updatePhase("GENERATING_ID", "Allocating playground instance…");
      const { id } = await playgroundApi.generateId(
        config.pg,
        config.pgname,
        config.playground,
        from,
        fromId,
      );
      if (!isMountedRef.current) return;
      instanceIdRef.current = id;
      setInstance((prev) => ({ ...prev, id }));

      // Phase 2: Create the container
      updatePhase("CREATING", "Spinning up container…");
      const createResult = await playgroundApi.create(id);
      if (!isMountedRef.current) return;
      setInstance((prev) => ({
        ...prev,
        startTime: createResult.startTime,
        postName: createResult.postName,
        statusMessage: createResult.message || "Container created, waiting for boot…",
      }));

      // Phase 3: Poll for readiness
      updatePhase("POLLING", "Waiting for environment to be ready…");
      let ready = false;
      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
        if (!isMountedRef.current) return;
        ready = await playgroundApi.poll(id);
        if (ready) break;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!isMountedRef.current) return;
      if (!ready) {
        setError("Environment timed out. Please try again.");
        return;
      }

      // Phase 4: Get connection info
      updatePhase("CONNECTING", "Establishing connection…");
      const connection = await playgroundApi.getConnectionInfo(id);
      if (!isMountedRef.current) return;

      // ✅ READY
      updatePhase("READY", "Playground is ready!", { connection });

      // Start keepalive polling
      keepaliveRef.current = setInterval(() => {
        if (instanceIdRef.current) {
          playgroundApi.poll(instanceIdRef.current).catch(() => {});
        }
      }, KEEPALIVE_INTERVAL_MS);
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to provision playground.";
      setError(message);
    }
  }, [config, from, fromId, updatePhase, setError]);

  // ── Teardown ───────────────────────────────────────────────────────────

  const teardown = useCallback(async () => {
    if (keepaliveRef.current) {
      clearInterval(keepaliveRef.current);
      keepaliveRef.current = null;
    }

    const id = instanceIdRef.current;
    if (!id) return;

    updatePhase("TEARING_DOWN", "Cleaning up environment…");
    instanceIdRef.current = null;

    try {
      await playgroundApi.teardown(id);
    } catch {
      // Best-effort cleanup
    }

    if (isMountedRef.current) {
      updatePhase("DESTROYED", "Playground destroyed.");
    }
  }, [updatePhase]);

  // ── Test Validation ────────────────────────────────────────────────────

  const runTest = useCallback(
    async (vm: string, test: string, args: string[] = []) => {
      const id = instanceIdRef.current;
      if (!id) {
        return { message: "No active playground instance.", passed: false };
      }

      try {
        updatePhase("VALIDATING", "Running validation…");
        const result = await playgroundApi.checkTest(id, vm, test, args);
        updatePhase("READY", result.passed ? "Test passed!" : "Test failed.");
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Validation failed.";
        updatePhase("READY", message);
        return { message, passed: false };
      }
    },
    [updatePhase],
  );

  // ── Retry ──────────────────────────────────────────────────────────────

  const retry = useCallback(() => {
    setInstance(createInitialInstance());
    setTemplateConfig(null);
    instanceIdRef.current = null;
    setRetryKey((k) => k + 1);
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────

  // Mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-provision on mount (and on retry)
  useEffect(() => {
    provision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  // Auto-teardown on unmount
  useEffect(() => {
    return () => {
      if (keepaliveRef.current) {
        clearInterval(keepaliveRef.current);
      }
      const id = instanceIdRef.current;
      if (id) {
        instanceIdRef.current = null;
        playgroundApi.teardown(id).catch(() => {});
      }
    };
  }, []);

  return {
    instance,
    templateConfig,
    teardown,
    runTest,
    hasError: instance.phase === "ERROR",
    retry,
  };
}
