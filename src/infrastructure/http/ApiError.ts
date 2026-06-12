// ---------------------------------------------------------------------------
// ApiError — Typed error class for structured API error handling.
// Thrown by apiClient on non-2xx responses.
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  /** HTTP status code (e.g. 401, 404, 500). May be 0 for network failures. */
  readonly status: number;

  /** Application-level error code from the API envelope (e.g. "INVALID_CREDENTIALS"). */
  readonly code: string;

  constructor(message: string, status: number = 0, code: string = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Type guard to check if an unknown error is an ApiError. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
