import { NextResponse } from "next/server";

import { researchAgent } from "@/lib/agent/research-agent";
import { ApiError } from "@/lib/errors/api-error";
import { isServerEnvConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";
import { researchRequestSchema } from "@/lib/schemas/report.schema";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ai-investment-research-agent",
    phase: "4-ai-engine",
    envConfigured: isServerEnvConfigured(),
    message: "Research agent is ready. POST a company name to generate a report.",
  });
}

import { requestKeysStorage } from "@/lib/env/data-layer";

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = await request.json();
    const { companyName, openaiApiKey, fmpApiKey, tavilyApiKey, openaiModel } = body;
    const parsed = researchRequestSchema.safeParse({ companyName });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          code: "INVALID_INPUT",
          details: parsed.error.issues.map((issue) => issue.message).join("; "),
        },
        { status: 400 },
      );
    }

    const headerOpenAiKey = request.headers.get("x-openai-api-key");
    const headerFmpKey = request.headers.get("x-fmp-api-key");
    const headerTavilyKey = request.headers.get("x-tavily-api-key");
    const headerModel = request.headers.get("x-openai-model");

    const openaiKey = headerOpenAiKey || openaiApiKey || undefined;
    const fmpKey = headerFmpKey || fmpApiKey || undefined;
    const tavilyKey = headerTavilyKey || tavilyApiKey || undefined;
    const model = headerModel || openaiModel || undefined;

    return await requestKeysStorage.run({
      OPENAI_API_KEY: openaiKey,
      FMP_API_KEY: fmpKey,
      TAVILY_API_KEY: tavilyKey,
      OPENAI_MODEL: model,
    }, async () => {
      if (!isServerEnvConfigured()) {
        const { generateMockReport } = await import("@/lib/utils/mock-generator");
        logger.info("api/research", "Using fallback mock report (Demo Mode)", {
          companyName: parsed.data.companyName,
        });
        const report = generateMockReport(parsed.data.companyName);
        return NextResponse.json({ report });
      }

      logger.info("api/research", "Research request received", {
        companyName: parsed.data.companyName,
      });

      const result = await researchAgent.generateReport({
        companyName: parsed.data.companyName,
      });

      logger.info("api/research", "Research request completed", {
        companyName: parsed.data.companyName,
        recommendation: result.report.finalRecommendation.verdict,
        processingTimeMs: Date.now() - startedAt,
      });

      return NextResponse.json({
        report: result.report,
      });
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const status =
        error.code === "INVALID_INPUT" || error.code === "NOT_FOUND"
          ? 400
          : error.code === "MISSING_API_KEY"
            ? 503
            : error.code === "RATE_LIMIT"
              ? 429
              : 500;

      logger.error("api/research", "Research request failed", {
        ...error.toJSON(),
        processingTimeMs: Date.now() - startedAt,
      });

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.metadata,
        },
        { status },
      );
    }

    logger.error("api/research", "Unexpected research failure", {
      error: error instanceof Error ? error.message : String(error),
      processingTimeMs: Date.now() - startedAt,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "UNKNOWN",
      },
      { status: 500 },
    );
  }
}
