export class ApiError extends Error {
  readonly status: number;

  readonly code: string;
  readonly data?: any;

  constructor(message: string, status: number = 0, code: string = "UNKNOWN_ERROR", data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
