import { ApiError } from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";
import type { CompanyResearchData } from "@/lib/types/data-layer";
import { companyResolver } from "@/lib/tools/company-resolver";
import { fmpClient } from "@/lib/tools/fmp-client";
import { tavilySearchClient } from "@/lib/tools/tavily-search";

const SOURCE = "research-data-collector";

/**
 * Collects verified financial and news data for a company.
 * Does not perform AI analysis — data layer only.
 */
export async function collectCompanyResearchData(
  companyInput: string,
): Promise<CompanyResearchData> {
  logger.info(SOURCE, "Starting data collection", { companyInput });

  const resolverResult = await companyResolver.resolveCompanyName(companyInput);

  if (!resolverResult.resolved) {
    logger.warn(SOURCE, "Company resolution failed", {
      companyInput,
      error: resolverResult.error?.toJSON(),
    });

    return {
      companyInput,
      resolved: null,
      financials: null,
      news: null,
      resolverError: resolverResult.error,
      collectedAt: new Date().toISOString(),
    };
  }

  const { resolved } = resolverResult;

  const financials = await fmpClient.getCompanyFinancialBundle(resolved.symbol);
  const news = await tavilySearchClient.getCompanyNewsBundle(
    resolved.name,
    financials.profile?.sector,
  );

  logger.info(SOURCE, "Data collection completed", {
    companyInput,
    symbol: resolved.symbol,
    financialUnavailable: financials.unavailable,
    newsUnavailable: news.unavailable,
  });

  return {
    companyInput,
    resolved,
    financials,
    news,
    resolverError: null,
    collectedAt: new Date().toISOString(),
  };
}

export async function collectCompanyResearchDataOrThrow(
  companyInput: string,
): Promise<CompanyResearchData> {
  const data = await collectCompanyResearchData(companyInput);

  if (data.resolverError) {
    throw data.resolverError;
  }

  if (!data.resolved) {
    throw new ApiError({
      code: "NOT_FOUND",
      message: `Unable to resolve company "${companyInput}"`,
      source: SOURCE,
      retryable: false,
    });
  }

  return data;
}
