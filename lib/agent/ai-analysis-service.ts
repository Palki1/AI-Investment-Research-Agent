import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import type { NormalizedResearchContext } from "@/lib/agent/data-normalizer";
import { buildFactualContextBlock } from "@/lib/agent/data-normalizer";
import { ApiError } from "@/lib/errors/api-error";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  buildInvestmentAnalysisUserPrompt,
  INVESTMENT_ANALYSIS_SYSTEM_PROMPT,
} from "@/lib/prompts/investment-analysis";
import {
  llmNarrativeReportSchema,
  type LlmNarrativeReportInput,
} from "@/lib/schemas/report.schema";

const SOURCE = "ai-analysis-service";
const DEFAULT_TIMEOUT_MS = 90_000;
const MAX_RETRIES = 2;

export interface AiAnalysisResult {
  narrative: LlmNarrativeReportInput;
  model: string;
  processingTimeMs: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

function createOpenAiClient(): OpenAI {
  const { OPENAI_API_KEY } = getServerEnv();

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    timeout: DEFAULT_TIMEOUT_MS,
    maxRetries: 0,
  });
}

function mapOpenAiError(error: unknown): ApiError {
  if (error instanceof OpenAI.APIError) {
    const retryable =
      error.status === 429 || error.status === 500 || error.status === 503;

    if (error.status === 429) {
      return new ApiError({
        code: "RATE_LIMIT",
        message: "OpenAI rate limit exceeded",
        source: SOURCE,
        retryable: true,
        cause: error.message,
      });
    }

    if (error.status === 401) {
      return new ApiError({
        code: "MISSING_API_KEY",
        message: "OpenAI API key is invalid or unauthorized",
        source: SOURCE,
        retryable: false,
        cause: error.message,
      });
    }

    return new ApiError({
      code: "UPSTREAM_ERROR",
      message: `OpenAI API error: ${error.message}`,
      source: SOURCE,
      retryable,
      metadata: { status: error.status },
      cause: error.message,
    });
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new ApiError({
      code: "TIMEOUT",
      message: "OpenAI request timed out",
      source: SOURCE,
      retryable: true,
      cause: error.message,
    });
  }

  return new ApiError({
    code: "UNKNOWN",
    message: "OpenAI analysis failed unexpectedly",
    source: SOURCE,
    retryable: false,
    cause: error instanceof Error ? error.message : String(error),
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reusable AI analysis service using the official OpenAI SDK.
 * Step 4: Generate professional investment research narrative from verified facts.
 */
export class AiAnalysisService {
  async generateNarrativeReport(
    context: NormalizedResearchContext,
  ): Promise<AiAnalysisResult> {
    const { OPENAI_MODEL } = getServerEnv();
    const client = createOpenAiClient();
    const factualContext = buildFactualContextBlock(context);
    const startedAt = Date.now();

    logger.info(SOURCE, "Starting LLM analysis", {
      company: context.companyName,
      ticker: context.ticker,
      model: OPENAI_MODEL,
    });

    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const completion = await client.chat.completions.parse({
          model: OPENAI_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: INVESTMENT_ANALYSIS_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: buildInvestmentAnalysisUserPrompt(factualContext),
            },
          ],
          response_format: zodResponseFormat(
            llmNarrativeReportSchema,
            "investment_narrative_report",
          ),
        });

        const processingTimeMs = Date.now() - startedAt;
        const choice = completion.choices[0];

        if (choice?.finish_reason === "length") {
          throw new ApiError({
            code: "UPSTREAM_ERROR",
            message: "OpenAI response truncated due to token limit",
            source: SOURCE,
            retryable: false,
          });
        }

        const parsed = choice?.message?.parsed;

        if (!parsed) {
          throw new ApiError({
            code: "PARSE_ERROR",
            message: "OpenAI returned an empty or invalid structured response",
            source: SOURCE,
            retryable: attempt < MAX_RETRIES,
            metadata: {
              finishReason: choice?.finish_reason,
              refusal: choice?.message?.refusal,
            },
          });
        }

        const validated = llmNarrativeReportSchema.safeParse(parsed);

        if (!validated.success) {
          throw new ApiError({
            code: "PARSE_ERROR",
            message: "LLM response failed schema validation",
            source: SOURCE,
            retryable: attempt < MAX_RETRIES,
            metadata: {
              issues: validated.error.issues.map((issue) => issue.message),
            },
          });
        }

        const tokenUsage = completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined;

        logger.info(SOURCE, "LLM analysis completed", {
          company: context.companyName,
          model: OPENAI_MODEL,
          processingTimeMs,
          tokenUsage,
          status: "success",
        });

        return {
          narrative: validated.data,
          model: OPENAI_MODEL,
          processingTimeMs,
          tokenUsage,
        };
      } catch (error) {
        const apiError = mapOpenAiError(error);
        lastError = apiError;

        logger.error(SOURCE, "LLM analysis attempt failed", {
          attempt,
          code: apiError.code,
          message: apiError.message,
        });

        if (apiError.retryable && attempt < MAX_RETRIES) {
          await sleep(1000 * attempt);
          continue;
        }

        throw apiError;
      }
    }

    throw (
      lastError ??
      new ApiError({
        code: "UNKNOWN",
        message: "OpenAI analysis failed after retries",
        source: SOURCE,
        retryable: false,
      })
    );
  }
}

export const aiAnalysisService = new AiAnalysisService();
