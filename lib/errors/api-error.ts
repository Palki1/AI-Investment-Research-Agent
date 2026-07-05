export type ApiErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "AMBIGUOUS_MATCH"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "RATE_LIMIT"
  | "UPSTREAM_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN";

export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  source: string;
  retryable: boolean;
  cause?: string;
  metadata?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly source: string;
  readonly retryable: boolean;
  readonly metadata?: Record<string, unknown>;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "ApiError";
    this.code = details.code;
    this.source = details.source;
    this.retryable = details.retryable;
    this.metadata = details.metadata;
  }

  toJSON(): ApiErrorDetails & { name: string } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      source: this.source,
      retryable: this.retryable,
      cause: this.cause instanceof Error ? this.cause.message : undefined,
      metadata: this.metadata,
    };
  }
}

export type DataResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export function successResult<T>(data: T): DataResult<T> {
  return { success: true, data };
}

export function errorResult<T>(error: ApiError): DataResult<T> {
  return { success: false, error };
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
