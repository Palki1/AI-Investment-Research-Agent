import { z } from "zod";

import { ApiError } from "@/lib/errors/api-error";

const dataLayerEnvSchema = z.object({
  FMP_API_KEY: z.string().min(1, "FMP_API_KEY is required"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
});

export type DataLayerEnv = z.infer<typeof dataLayerEnvSchema>;

let cachedDataLayerEnv: DataLayerEnv | null = null;

import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestKeys {
  OPENAI_API_KEY?: string;
  FMP_API_KEY?: string;
  TAVILY_API_KEY?: string;
  OPENAI_MODEL?: string;
}

export const requestKeysStorage = new AsyncLocalStorage<RequestKeys>();

export function getDataLayerEnv(): DataLayerEnv {
  const store = requestKeysStorage.getStore();
  const hasStoreKeys = Boolean(store?.FMP_API_KEY || store?.TAVILY_API_KEY);

  if (cachedDataLayerEnv && !hasStoreKeys) {
    return cachedDataLayerEnv;
  }

  const parsed = dataLayerEnvSchema.safeParse({
    FMP_API_KEY: store?.FMP_API_KEY || process.env.FMP_API_KEY,
    TAVILY_API_KEY: store?.TAVILY_API_KEY || process.env.TAVILY_API_KEY,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new ApiError({
      code: "MISSING_API_KEY",
      message: `Data layer environment is not configured: ${details}`,
      source: "env",
      retryable: false,
      metadata: {
        hint: "Copy .env.example to .env.local and add FMP_API_KEY and TAVILY_API_KEY.",
      },
    });
  }

  if (!hasStoreKeys) {
    cachedDataLayerEnv = parsed.data;
  }
  return parsed.data;
}

export function getFmpApiKey(): string {
  const store = requestKeysStorage.getStore();
  if (store?.FMP_API_KEY) {
    return store.FMP_API_KEY;
  }
  return getDataLayerEnv().FMP_API_KEY;
}

export function getTavilyApiKey(): string {
  const store = requestKeysStorage.getStore();
  if (store?.TAVILY_API_KEY) {
    return store.TAVILY_API_KEY;
  }
  return getDataLayerEnv().TAVILY_API_KEY;
}

export function isDataLayerEnvConfigured(): boolean {
  const store = requestKeysStorage.getStore();
  const fmpKey = store?.FMP_API_KEY || process.env.FMP_API_KEY;
  const tavilyKey = store?.TAVILY_API_KEY || process.env.TAVILY_API_KEY;
  return Boolean(fmpKey && tavilyKey);
}
