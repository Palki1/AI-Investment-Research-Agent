import { z } from "zod";

const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  FMP_API_KEY: z.string().min(1, "FMP_API_KEY is required"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
  OPENAI_MODEL: z.string().default("gpt-4o"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

/**
 * Validates and returns server-side environment variables.
 * Call only from server code (API routes, agent, tools).
 */
import { requestKeysStorage } from "@/lib/env/data-layer";

export function getServerEnv(): ServerEnv {
  const store = requestKeysStorage.getStore();
  const hasStoreKeys = Boolean(store?.OPENAI_API_KEY || store?.FMP_API_KEY || store?.TAVILY_API_KEY);

  if (cachedEnv && !hasStoreKeys) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    OPENAI_API_KEY: store?.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    FMP_API_KEY: store?.FMP_API_KEY || process.env.FMP_API_KEY,
    TAVILY_API_KEY: store?.TAVILY_API_KEY || process.env.TAVILY_API_KEY,
    OPENAI_MODEL: store?.OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o",
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  if (!hasStoreKeys) {
    cachedEnv = parsed.data;
  }
  return parsed.data;
}

/**
 * Returns true when all required API keys are present.
 */
export function isServerEnvConfigured(): boolean {
  const store = requestKeysStorage.getStore();
  const openaiKey = store?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  const fmpKey = store?.FMP_API_KEY || process.env.FMP_API_KEY;
  const tavilyKey = store?.TAVILY_API_KEY || process.env.TAVILY_API_KEY;
  return Boolean(openaiKey && fmpKey && tavilyKey);
}

export {
  getDataLayerEnv,
  getFmpApiKey,
  getTavilyApiKey,
  isDataLayerEnvConfigured,
} from "@/lib/env/data-layer";
