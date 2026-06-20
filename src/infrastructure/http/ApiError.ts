export class ApiError extends Error {
  readonly status: number;

  readonly code: string;

  constructor(message: string, status: number = 0, code: string = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
