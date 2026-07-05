import { ApiError } from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";

export interface FetchWithRetryOptions {
  url: string;
  init?: RequestInit;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  source: string;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 750;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Performs a fetch request with timeout, retry, and structured errors.
 */
export async function fetchWithRetry<T = unknown>(
  options: FetchWithRetryOptions,
): Promise<T> {
  const {
    url,
    init,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    source,
  } = options;

  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      logger.debug(source, "Sending request", {
        attempt,
        retries,
        method: init?.method ?? "GET",
        url,
      });

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        const retryable = isRetryableStatus(response.status);

        lastError = new ApiError({
          code: response.status === 429 ? "RATE_LIMIT" : "UPSTREAM_ERROR",
          message: `Request failed with status ${response.status}`,
          source,
          retryable,
          metadata: {
            status: response.status,
            statusText: response.statusText,
            bodyPreview: bodyText.slice(0, 300),
            attempt,
          },
        });

        if (retryable && attempt < retries) {
          logger.warn(source, "Retrying after HTTP error", {
            attempt,
            status: response.status,
          });
          await sleep(retryDelayMs * attempt);
          continue;
        }

        throw lastError;
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }

      const isAbort = error instanceof Error && error.name === "AbortError";

      lastError = new ApiError({
        code: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
        message: isAbort
          ? `Request timed out after ${timeoutMs}ms`
          : "Network request failed",
        source,
        retryable: true,
        cause: error instanceof Error ? error.message : String(error),
        metadata: { attempt, url },
      });

      if (attempt < retries) {
        logger.warn(source, "Retrying after transport error", {
          attempt,
          code: lastError.code,
        });
        await sleep(retryDelayMs * attempt);
        continue;
      }

      throw lastError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw (
    lastError ??
    new ApiError({
      code: "UNKNOWN",
      message: "Request failed for an unknown reason",
      source,
      retryable: false,
    })
  );
}

function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
