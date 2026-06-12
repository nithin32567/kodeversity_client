// ---------------------------------------------------------------------------
// apiClient — thin fetch wrapper with Bearer token + silent refresh.
// CLIENT-SIDE ONLY: accessToken is stored in module memory.
// Safe in a browser SPA (one user per tab); must never run on the server.
// ---------------------------------------------------------------------------

import { ApiError } from "./ApiError";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

let refreshPromise: Promise<string | null> | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  refresh: () => refreshToken(),
};

export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the automatic 401 → refresh → retry cycle (e.g. login, refresh itself). */
  skipAuthRefresh?: boolean;
}

// ---------------------------------------------------------------------------
// Envelope shape returned by the auth-service (and other services).
// { success: true, data: T }  OR  { success: false, error: string }
// ---------------------------------------------------------------------------
interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Parse the response body for error details before throwing. */
async function extractError(res: Response): Promise<ApiError> {
  let rawBody = "";
  try {
    rawBody = await res.clone().text();
    const payload = JSON.parse(rawBody) as ApiEnvelope<unknown>;

    console.error("====== API CLIENT ERROR ======");
    console.error("URL:", res.url);
    console.error("Status:", res.status);
    console.error("Payload:", payload);
    console.error("==============================");

    // Prefer the structured error code / message from the envelope.
    const code = payload.error ?? "UNKNOWN_ERROR";
    const msg = payload.error ?? payload.message ?? `Request failed: ${res.status}`;
    return new ApiError(msg, res.status, code);
  } catch (parseError) {
    console.error("====== API CLIENT PARSE ERROR ======");
    console.error("URL:", res.url);
    console.error("Status:", res.status);
    console.error("Raw Body:", rawBody);
    console.error("Parse Error:", parseError);
    console.error("====================================");
    return new ApiError(`Request failed: ${res.status}`, res.status);
  }
}

const AUTH_REFRESH_URL =
  (import.meta.env.VITE_AUTH_SERVICE_URL as string | undefined) ?? "http://localhost:4000";

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${AUTH_REFRESH_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        // Check if the server is telling us the refresh cookie is missing → logout.
        try {
          const payload = (await res.json()) as ApiEnvelope<unknown>;
          if (
            payload.error === "REFRESH_TOKEN_MISSING" ||
            payload.error === "REFRESH_TOKEN_REUSE_DETECTED"
          ) {
            onUnauthorized?.();
          }
        } catch {
          /* ignore */
        }
        return null;
      }
      const payload = (await res.json()) as ApiEnvelope<{ accessToken: string }>;
      if (payload.success && payload.data?.accessToken) {
        accessToken = payload.data.accessToken;
        return accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T = unknown>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { body, skipAuthRefresh, headers, ...rest } = init;

  const buildHeaders = (token: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  });

  const exec = (token: string | null) =>
    fetch(path, {
      ...rest,
      credentials: "include",
      headers: buildHeaders(token),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  const initialToken = accessToken;
  let res = await exec(initialToken);

  // ---- 401 handling: attempt silent token refresh -------------------------
  if (res.status === 401 && !skipAuthRefresh) {
    // Only retry if the server signals an invalid/expired access token.
    let shouldRefresh = false;
    try {
      const clone = (await res.clone().json()) as ApiEnvelope<unknown>;
      shouldRefresh =
        clone.error === "INVALID_OR_EXPIRED_ACCESS_TOKEN" ||
        clone.error === "MISSING_ACCESS_TOKEN" ||
        clone.error === "UNAUTHORIZED";
    } catch {
      shouldRefresh = true;
    }

    if (shouldRefresh) {
      let fresh = accessToken;

      // If the global token has changed since we sent this request,
      // someone else already refreshed it. Just use the new one.
      if (initialToken === accessToken && refreshPromise) {
        fresh = await refreshPromise;
      } else if (initialToken === accessToken) {
        fresh = await refreshToken();
      }

      if (fresh) {
        res = await exec(fresh);
      }
    }

    if (res.status === 401) {
      onUnauthorized?.();
      throw new ApiError("Session expired. Please log in again.", 401, "SESSION_EXPIRED");
    }
  }

  if (!res.ok) {
    throw await extractError(res);
  }

  if (res.status === 204) return undefined as T;

  // Unwrap the { success, data } envelope when present.
  const json = (await res.json()) as ApiEnvelope<T> | T;
  if (json !== null && typeof json === "object" && "success" in (json as object)) {
    const envelope = json as ApiEnvelope<T>;
    if (!envelope.success) {
      const code = envelope.error ?? "UNKNOWN_ERROR";
      throw new ApiError(code, 0, code);
    }
    // Return data if present, otherwise the whole envelope (some endpoints return {success, message}).
    return (envelope.data ?? json) as T;
  }

  return json as T;
}

export const apiClient = {
  get: <T>(path: string, init?: ApiRequestInit) => apiRequest<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "PATCH", body }),
  del: <T>(path: string, init?: ApiRequestInit) =>
    apiRequest<T>(path, { ...init, method: "DELETE" }),
};
