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

export const playgroundService = {
  getTemplateConfig: async (pgid: string): Promise<TemplateConfig> => {
    return apiClient.get<TemplateConfig>(endpoints.playground.templateConfig(pgid));
  },

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

  create: async (
    id: string,
  ): Promise<{
    message: string;
    startTime: number | null;
    postName: string | null;
    details: CreatePGResponse["details"];
  }> => {
    const data = await apiClient.post<CreatePGResponse>(endpoints.playground.create(id), {});
    return {
      message: data.msg,
      startTime: data.details?.start ?? null,
      postName: data.details?.post_name ?? null,
      details: data.details,
    };
  },

  poll: async (id: string): Promise<boolean> => {
    try {
      await apiClient.get<unknown>(endpoints.playground.poll(id));
      return true;
    } catch {
      return false;
    }
  },

  getConnectionInfo: async (id: string): Promise<PlaygroundConnectionInfo> => {
    const data = await apiClient.get<Record<string, unknown>>(endpoints.playground.getIp(id));

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
    const data = await apiClient.post<{ msg: string }>(endpoints.playground.score, payload);
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
      void 0;
    }

    try {
      await apiClient.del<unknown>(endpoints.playground.remove(id));
      return true;
    } catch {
      return false;
    }
  },

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

  list: async (): Promise<unknown[]> => {
    try {
      const data = await apiClient.get<unknown[]>(endpoints.playground.list);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  openCodeServer: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post<unknown>(endpoints.playground.openCodeServer(id), {});
      return true;
    } catch {
      return false;
    }
  },

  openDesktopServer: async (id: string): Promise<boolean> => {
    try {
      await apiClient.post<unknown>(endpoints.playground.openDesktopServer(id), {});
      return true;
    } catch {
      return false;
    }
  },
};
