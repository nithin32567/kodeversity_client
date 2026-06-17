// ---------------------------------------------------------------------------
// playgroundService.ts — Unified Playground API service for the LMS client.
//
// Migrates the 7-step playground lifecycle from the sandbox app's Axios-based
// `api-client.ts` to the LMS client's custom `apiClient` fetch wrapper.
//
// All calls inherit: silent 401 refresh, Bearer token injection, and typed
// ApiError throws — no raw fetch/axios anywhere in this file.
// ---------------------------------------------------------------------------

import { apiClient } from "@/infrastructure/http/apiClient";
import { endpoints } from "@/infrastructure/http/endpoints";
import type {
  TemplateConfig,
  PlaygroundConnectionInfo,
  TestResult,
  ScorePayload,
  ScoreResponse,
  XpPayload,
  XpResponse,
} from "@/domain/playground";

// ─── Response shapes from the sandbox backend ───────────────────────────────
// The sandbox backend does NOT use the `{ success, data }` envelope that the
// LMS auth/course services use. It returns raw JSON. Our apiClient handles
// both: if there's no `success` key, it returns the raw JSON as-is.

interface GenIdResponse {
  id: string;
  [key: string]: unknown;
}

interface CreatePGResponse {
  msg: string;
  details?: {
    start?: number;
    post_name?: string;
    [key: string]: unknown;
  };
}

interface ActivePlayground {
  id: string;
  [key: string]: unknown;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const playgroundService = {
  // ─────────────────────────────────────────────────────────────────────────
  // Step 0: Fetch Template Configuration
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Retrieves the full template configuration (VM specs, bridges, etc.)
   * for a given playground template ID.
   */
  getTemplateConfig: async (pgid: string): Promise<TemplateConfig> => {
    return apiClient.get<TemplateConfig>(endpoints.playground.templateConfig(pgid));
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Generate Instance ID
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Allocates a new playground instance ID based on a template.
   * This is the first step in the provisioning lifecycle.
   *
   * @param pg        - Template group ID (ConfigDoc._id)
   * @param pgname    - Human-readable template name (uppercased)
   * @param playground - Template slug (e.g. "ubuntu2404n1")
   * @param from      - Origin context ("course" | "challenge")
   * @param fromId    - ID of the course/challenge triggering this
   */
  generateId: async (
    pg: string,
    pgname: string,
    playground: string,
    from: string,
    fromId: string,
  ): Promise<{ id: string; raw: GenIdResponse }> => {
    const data = await apiClient.get<GenIdResponse>(
      endpoints.playground.generateId(pg, pgname, playground, from, fromId),
    );
    return { id: data.id, raw: data };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Create Playground (spin up the container)
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Signals the backend ZFS/VM system to physically spin up the instance.
   * Returns the status message, start time, and post_name.
   */
  create: async (
    id: string,
  ): Promise<{
    message: string;
    startTime: number | null;
    postName: string | null;
    details: CreatePGResponse["details"];
  }> => {
    const data = await apiClient.post<CreatePGResponse>(
      endpoints.playground.create(id),
      {},
    );
    return {
      message: data.msg,
      startTime: data.details?.start ?? null,
      postName: data.details?.post_name ?? null,
      details: data.details,
    };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Poll Playground Readiness
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Polls the backend to check if the container has booted.
   * A successful (2xx) response means the playground is ready.
   * Throws ApiError on non-2xx (container still booting or failed).
   */
  poll: async (id: string): Promise<boolean> => {
    try {
      await apiClient.get<unknown>(endpoints.playground.poll(id));
      return true;
    } catch {
      return false;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4: Get Connection IP & Ports
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Retrieves the active IPs and ports for terminal (Xterm.js) and
   * webview (iframe) connections once the container is ready.
   */
  getConnectionInfo: async (id: string): Promise<PlaygroundConnectionInfo> => {
    const data = await apiClient.get<Record<string, unknown>>(
      endpoints.playground.getIp(id),
    );
    // The sandbox backend returns a flat object with IP/port info.
    // We normalize it into our domain type.
    return {
      ips: Array.isArray(data.ips)
        ? (data.ips as string[])
        : typeof data.ip === "string"
          ? [data.ip as string]
          : [],
      ports: (data.ports as Record<string, number>) ?? {},
      raw: data,
    };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 5: Validate Test
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Runs a validation test against the user's work inside the playground.
   * Supports both GET (simple) and POST (complex payloads) modes.
   */
  checkTest: async (
    id: string,
    vm: string,
    test: string,
    args: string[] = [],
    method: "GET" | "POST" = "POST",
  ): Promise<TestResult> => {
    if (method === "GET") {
      const queryArgs = args.length > 0 ? `?args=${args.join(",")}` : "";
      const data = await apiClient.get<{ msg: string; isPass: boolean }>(
        `${endpoints.playground.checkTestGet(id, vm, test)}${queryArgs}`,
      );
      return { message: data.msg, passed: data.isPass };
    }

    const data = await apiClient.post<{ msg: string; isPass: boolean }>(
      endpoints.playground.checkTestPost(id, vm),
      { test, args: args.join(",") },
    );
    return { message: data.msg, passed: data.isPass };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 6a: Record Score
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Records a task completion score for the user.
   */
  createScore: async (payload: ScorePayload): Promise<ScoreResponse> => {
    const data = await apiClient.post<{ msg: string }>(
      endpoints.playground.score,
      payload,
    );
    return { message: data.msg, success: true };
  },

  /**
   * Retrieves a user's score for a specific module.
   */
  getScore: async (
    userId: string,
    from: string,
    fromId?: string,
  ): Promise<{ data: unknown; success: boolean }> => {
    let url = `${endpoints.playground.score}?userId=${userId}&from=${from}`;
    if (fromId) url += `&fromId=${fromId}`;
    try {
      const data = await apiClient.get<unknown>(url);
      return { data, success: true };
    } catch {
      return { data: null, success: false };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 6b: Record XP
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Awards XP to the user upon successful task completion.
   */
  createXp: async (payload: XpPayload): Promise<XpResponse> => {
    const data = await apiClient.post<{ msg: string; isNew: boolean }>(
      endpoints.playground.xp,
      payload,
    );
    return { message: data.msg, success: true, isNew: data.isNew };
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Step 7: Teardown
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Destroys the playground container and cleans up session storage.
   * This is automatically triggered on component unmount.
   */
  teardown: async (id: string): Promise<boolean> => {
    // Clean up sessionStorage entries used by the terminal layer.
    try {
      sessionStorage.removeItem("URLs");
      sessionStorage.removeItem("ACA");
      sessionStorage.removeItem("PSH");
    } catch {
      // sessionStorage may not be available in all contexts.
    }

    try {
      await apiClient.del<unknown>(endpoints.playground.remove(id));
      return true;
    } catch {
      return false;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Auxiliary: List Active Playgrounds
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Retrieves all running playgrounds owned by the current user.
   * Used to resume sessions or prevent duplicate provisioning.
   */
  listActive: async (): Promise<ActivePlayground[]> => {
    try {
      const data = await apiClient.get<ActivePlayground[] | { data: ActivePlayground[] }>(
        endpoints.playground.active,
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * Lists all playground instances (broader scope than active).
   */
  list: async (): Promise<unknown[]> => {
    try {
      const data = await apiClient.get<unknown[]>(endpoints.playground.list);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Auxiliary: Open Code Server / Desktop GUI
  // ─────────────────────────────────────────────────────────────────────────
  /**
   * Signals the backend to start the code-server process for the given
   * playground instance. Must be called before embedding the IDE iframe.
   */
  openCodeServer: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post<unknown>(endpoints.playground.openCodeServer(id), {});
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Signals the backend to start the desktop GUI (noVNC/xpra) process.
   */
  openDesktopServer: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post<unknown>(endpoints.playground.openDesktopServer(id), {});
      return true;
    } catch {
      return false;
    }
  },
};
