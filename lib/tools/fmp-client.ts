import {
  ApiError,
  errorResult,
  successResult,
  type DataResult,
} from "@/lib/errors/api-error";
import { getFmpApiKey } from "@/lib/env/data-layer";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { logger } from "@/lib/logger";
import type {
  CompanyFinancialBundle,
  FmpBalanceSheet,
  FmpCashFlowStatement,
  FmpCompanyProfile,
  FmpEnterpriseValue,
  FmpFinancialRatio,
  FmpHistoricalRevenue,
  FmpIncomeStatement,
  FmpKeyMetrics,
  FmpSearchResult,
  FmpStockPeers,
} from "@/lib/types/data-layer";

const SOURCE = "fmp-client";
const BASE_URL = "https://financialmodelingprep.com";

interface FmpRequestOptions {
  path: string;
  params?: Record<string, string | number | undefined>;
}

function buildUrl({ path, params = {} }: FmpRequestOptions): string {
  let apiKey: string;

  try {
    apiKey = getFmpApiKey();
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError({
          code: "MISSING_API_KEY",
          message: "FMP_API_KEY is not configured",
          source: SOURCE,
          retryable: false,
        });
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apikey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function fmpRequest<T>(options: FmpRequestOptions): Promise<T> {
  const url = buildUrl(options);

  logger.debug(SOURCE, "FMP request", {
    path: options.path,
    params: options.params,
  });

  const payload = await fetchWithRetry<unknown>({
    url,
    source: SOURCE,
  });

  return payload as T;
}

function isEmptyPayload<T>(payload: T): boolean {
  if (payload == null) {
    return true;
  }

  if (Array.isArray(payload)) {
    return payload.length === 0;
  }

  if (typeof payload === "object") {
    return Object.keys(payload as object).length === 0;
  }

  return false;
}

async function safeFmpRequest<T>(
  label: string,
  request: () => Promise<T>,
): Promise<DataResult<T>> {
  try {
    const data = await request();

    if (isEmptyPayload(data)) {
      return errorResult(
        new ApiError({
          code: "NOT_FOUND",
          message: `${label} returned no data`,
          source: SOURCE,
          retryable: false,
          metadata: { label },
        }),
      );
    }

    return successResult(data);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.warn(SOURCE, `${label} failed`, error.toJSON());
      return errorResult(error);
    }

    const wrapped = new ApiError({
      code: "UNKNOWN",
      message: `${label} failed unexpectedly`,
      source: SOURCE,
      retryable: false,
      cause: error instanceof Error ? error.message : String(error),
      metadata: { label },
    });

    logger.error(SOURCE, wrapped.message, wrapped.toJSON());
    return errorResult(wrapped);
  }
}

function computeHistoricalRevenue(
  incomeStatements: FmpIncomeStatement[],
): FmpHistoricalRevenue[] {
  const sorted = [...incomeStatements].sort((a, b) =>
    `${a.calendarYear}${a.period}`.localeCompare(`${b.calendarYear}${b.period}`),
  );

  return sorted.map((statement, index) => {
    const previous = sorted[index - 1];
    const revenueGrowth =
      previous && previous.revenue
        ? ((statement.revenue - previous.revenue) / previous.revenue) * 100
        : null;

    return {
      date: statement.date,
      calendarYear: statement.calendarYear,
      period: statement.period,
      revenue: statement.revenue,
      revenueGrowth,
    };
  });
}

export class FmpClient {
  async searchCompanies(query: string, limit = 8): Promise<DataResult<FmpSearchResult[]>> {
    if (!query.trim()) {
      return errorResult(
        new ApiError({
          code: "INVALID_INPUT",
          message: "Search query cannot be empty",
          source: SOURCE,
          retryable: false,
        }),
      );
    }

    return safeFmpRequest("Company search", () =>
      fmpRequest<FmpSearchResult[]>({
        path: "/api/v3/search",
        params: { query: query.trim(), limit },
      }),
    );
  }

  async getCompanyProfile(symbol: string): Promise<DataResult<FmpCompanyProfile>> {
    return safeFmpRequest("Company profile", async () => {
      const payload = await fmpRequest<FmpCompanyProfile[]>({
        path: `/api/v3/profile/${encodeURIComponent(symbol)}`,
      });

      const profile = payload[0];

      if (!profile) {
        throw new ApiError({
          code: "NOT_FOUND",
          message: `Company profile not found for ${symbol}`,
          source: SOURCE,
          retryable: false,
        });
      }

      return profile;
    });
  }

  async getIncomeStatements(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpIncomeStatement[]>> {
    return safeFmpRequest("Income statements", () =>
      fmpRequest<FmpIncomeStatement[]>({
        path: `/api/v3/income-statement/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getBalanceSheets(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpBalanceSheet[]>> {
    return safeFmpRequest("Balance sheets", () =>
      fmpRequest<FmpBalanceSheet[]>({
        path: `/api/v3/balance-sheet-statement/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getCashFlowStatements(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpCashFlowStatement[]>> {
    return safeFmpRequest("Cash flow statements", () =>
      fmpRequest<FmpCashFlowStatement[]>({
        path: `/api/v3/cash-flow-statement/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getKeyMetrics(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpKeyMetrics[]>> {
    return safeFmpRequest("Key metrics", () =>
      fmpRequest<FmpKeyMetrics[]>({
        path: `/api/v3/key-metrics/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getFinancialRatios(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpFinancialRatio[]>> {
    return safeFmpRequest("Financial ratios", () =>
      fmpRequest<FmpFinancialRatio[]>({
        path: `/api/v3/ratios/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getEnterpriseValues(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpEnterpriseValue[]>> {
    return safeFmpRequest("Enterprise values", () =>
      fmpRequest<FmpEnterpriseValue[]>({
        path: `/api/v3/enterprise-values/${encodeURIComponent(symbol)}`,
        params: { period: "annual", limit },
      }),
    );
  }

  async getHistoricalRevenue(
    symbol: string,
    limit = 5,
  ): Promise<DataResult<FmpHistoricalRevenue[]>> {
    const incomeResult = await this.getIncomeStatements(symbol, limit);

    if (!incomeResult.success) {
      return incomeResult;
    }

    return successResult(computeHistoricalRevenue(incomeResult.data));
  }

  async getHistoricalStockPrices(
    symbol: string,
    timeseries = 24,
  ): Promise<DataResult<Array<{ date: string; close: number }>>> {
    return safeFmpRequest("Historical stock prices", async () => {
      const payload = await fmpRequest<{
        symbol: string;
        historical: Array<{ date: string; close: number }>;
      }>({
        path: `/api/v3/historical-price-full/${encodeURIComponent(symbol)}`,
        params: { serietype: "line", timeseries },
      });

      return payload.historical ?? [];
    });
  }

  async getStockPeers(symbol: string): Promise<DataResult<FmpStockPeers>> {
    return safeFmpRequest("Stock peers", async () => {
      const payload = await fmpRequest<FmpStockPeers[]>({
        path: "/api/v4/stock_peers",
        params: { symbol },
      });

      const peers = payload[0];

      if (!peers) {
        throw new ApiError({
          code: "NOT_FOUND",
          message: `Peer data not found for ${symbol}`,
          source: SOURCE,
          retryable: false,
        });
      }

      return peers;
    });
  }

  async getCompanyFinancialBundle(
    symbol: string,
  ): Promise<CompanyFinancialBundle> {
    logger.info(SOURCE, "Fetching financial bundle", { symbol });

    const [
      profileResult,
      incomeResult,
      balanceResult,
      cashFlowResult,
      metricsResult,
      ratiosResult,
      enterpriseResult,
      peersResult,
    ] = await Promise.all([
      this.getCompanyProfile(symbol),
      this.getIncomeStatements(symbol),
      this.getBalanceSheets(symbol),
      this.getCashFlowStatements(symbol),
      this.getKeyMetrics(symbol),
      this.getFinancialRatios(symbol),
      this.getEnterpriseValues(symbol),
      this.getStockPeers(symbol),
    ]);

    const incomeStatements = incomeResult.success ? incomeResult.data : [];
    const historicalRevenue = incomeResult.success
      ? computeHistoricalRevenue(incomeStatements)
      : [];

    const results = [
      { label: "profile", result: profileResult },
      { label: "incomeStatements", result: incomeResult },
      { label: "balanceSheets", result: balanceResult },
      { label: "cashFlowStatements", result: cashFlowResult },
      { label: "keyMetrics", result: metricsResult },
      { label: "financialRatios", result: ratiosResult },
      { label: "enterpriseValues", result: enterpriseResult },
      { label: "historicalRevenue", result: incomeResult },
      { label: "peers", result: peersResult },
    ];

    const unavailable: string[] = [];
    const errors: ApiError[] = [];

    for (const { label, result } of results) {
      if (!result.success) {
        unavailable.push(label);
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      logger.warn(SOURCE, "Financial bundle completed with gaps", {
        symbol,
        unavailable,
      });
    } else {
      logger.info(SOURCE, "Financial bundle fetched successfully", { symbol });
    }

    return {
      profile: profileResult.success ? profileResult.data : null,
      incomeStatements,
      balanceSheets: balanceResult.success ? balanceResult.data : [],
      cashFlowStatements: cashFlowResult.success ? cashFlowResult.data : [],
      keyMetrics: metricsResult.success ? metricsResult.data : [],
      financialRatios: ratiosResult.success ? ratiosResult.data : [],
      enterpriseValues: enterpriseResult.success ? enterpriseResult.data : [],
      historicalRevenue,
      peers: peersResult.success ? peersResult.data : null,
      unavailable,
      errors,
    };
  }
}

export const fmpClient = new FmpClient();
