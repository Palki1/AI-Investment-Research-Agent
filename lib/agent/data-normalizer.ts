import type { CompanyResearchData } from "@/lib/types/data-layer";
import type {
  FinancialSection,
  NewsHeadline,
  ReportSource,
  VerifiedMetric,
} from "@/lib/types/investment-report";

const FMP_SOURCE = "Financial Modeling Prep";

export interface NormalizedNewsFact {
  topic: string;
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface NormalizedResearchContext {
  companyInput: string;
  companyName: string;
  ticker: string;
  exchange: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  currency: string | null;
  country: string | null;
  missingData: string[];
  verifiedMetrics: {
    revenueGrowth: VerifiedMetric[];
    profitability: VerifiedMetric[];
    cashFlow: VerifiedMetric[];
    debt: VerifiedMetric[];
    liquidity: VerifiedMetric[];
    valuation: VerifiedMetric[];
  };
  financialSections: {
    revenueGrowth: FinancialSection;
    profitability: FinancialSection;
    cashFlow: FinancialSection;
    debt: FinancialSection;
    liquidity: FinancialSection;
    valuation: FinancialSection;
  };
  peers: string[];
  newsFacts: NormalizedNewsFact[];
  newsHeadlines: NewsHeadline[];
  industryTrendsSummary: string | null;
  marketDevelopmentsSummary: string | null;
  macroeconomicSummary: string | null;
  sources: ReportSource[];
}

function formatNumber(value: number | null | undefined, suffix = ""): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B${suffix}`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M${suffix}`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K${suffix}`;
  }

  return `${value.toFixed(2)}${suffix}`;
}

function formatPercent(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  return `${(value * (Math.abs(value) <= 1 ? 100 : 1)).toFixed(2)}%`;
}

function metric(
  label: string,
  value: string | null,
  period?: string,
): VerifiedMetric | null {
  if (!value) {
    return null;
  }

  return { label, value, period, source: FMP_SOURCE };
}

function buildSection(
  metrics: VerifiedMetric[],
  dataNote?: string,
): FinancialSection {
  return {
    analysis: "",
    metrics,
    dataAvailable: metrics.length > 0,
    dataNote:
      metrics.length === 0
        ? dataNote ?? "Data unavailable — no verified metrics returned by FMP"
        : dataNote,
  };
}

function latestByDate<T extends { date: string }>(rows: T[]): T | null {
  if (rows.length === 0) {
    return null;
  }

  return [...rows].sort((a, b) => b.date.localeCompare(a.date))[0];
}

/**
 * Step 2: Normalize raw API data into a structured factual context for the LLM.
 * All numeric values are extracted here — the LLM never generates metrics.
 */
export function normalizeResearchData(
  data: CompanyResearchData,
  missingData: string[] = [],
): NormalizedResearchContext {
  if (!data.resolved) {
    throw new Error("Cannot normalize research data without a resolved company");
  }

  const financials = data.financials;
  const profile = financials?.profile ?? null;
  const latestIncome = latestByDate(
    (financials?.incomeStatements ?? []).map((row) => ({
      ...row,
      date: row.date || `${row.calendarYear}-12-31`,
    })),
  );
  const previousIncome = financials?.incomeStatements?.[1] ?? null;
  const latestBalance = latestByDate(
    (financials?.balanceSheets ?? []).map((row) => ({
      ...row,
      date: row.date || `${row.calendarYear}-12-31`,
    })),
  );
  const latestCashFlow = latestByDate(
    (financials?.cashFlowStatements ?? []).map((row) => ({
      ...row,
      date: row.date || `${row.calendarYear}-12-31`,
    })),
  );
  const latestMetrics = latestByDate(
    (financials?.keyMetrics ?? []).map((row) => ({
      ...row,
      date: row.date || `${row.calendarYear}-12-31`,
    })),
  );
  const latestRatios = latestByDate(
    (financials?.financialRatios ?? []).map((row) => ({
      ...row,
      date: row.date || `${row.calendarYear}-12-31`,
    })),
  );
  const latestEv = latestByDate(financials?.enterpriseValues ?? []);
  const latestRevenue = financials?.historicalRevenue?.at(-1) ?? null;

  const revenueGrowthMetrics = [
    metric(
      "Latest Revenue",
      latestIncome ? formatNumber(latestIncome.revenue, ` ${latestIncome.reportedCurrency}`) : null,
      latestIncome ? `${latestIncome.calendarYear} ${latestIncome.period}` : undefined,
    ),
    metric(
      "Revenue Growth (YoY)",
      latestRevenue?.revenueGrowth != null
        ? `${latestRevenue.revenueGrowth.toFixed(2)}%`
        : previousIncome && latestIncome
          ? formatPercent(
              (latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue,
            )
          : null,
      latestIncome ? `${latestIncome.calendarYear}` : undefined,
    ),
    metric(
      "Net Income",
      latestIncome ? formatNumber(latestIncome.netIncome, ` ${latestIncome.reportedCurrency}`) : null,
      latestIncome ? `${latestIncome.calendarYear}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const profitabilityMetrics = [
    metric(
      "Gross Profit",
      latestIncome ? formatNumber(latestIncome.grossProfit, ` ${latestIncome.reportedCurrency}`) : null,
      latestIncome ? `${latestIncome.calendarYear}` : undefined,
    ),
    metric(
      "Operating Income",
      latestIncome ? formatNumber(latestIncome.operatingIncome, ` ${latestIncome.reportedCurrency}`) : null,
      latestIncome ? `${latestIncome.calendarYear}` : undefined,
    ),
    metric(
      "EBITDA",
      latestIncome ? formatNumber(latestIncome.ebitda, ` ${latestIncome.reportedCurrency}`) : null,
      latestIncome ? `${latestIncome.calendarYear}` : undefined,
    ),
    metric(
      "Gross Profit Margin",
      latestRatios ? formatPercent(latestRatios.grossProfitMargin) : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
    metric(
      "Operating Profit Margin",
      latestRatios ? formatPercent(latestRatios.operatingProfitMargin) : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
    metric(
      "Net Profit Margin",
      latestRatios ? formatPercent(latestRatios.netProfitMargin) : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
    metric(
      "Return on Equity",
      latestRatios ? formatPercent(latestRatios.returnOnEquity) : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const cashFlowMetrics = [
    metric(
      "Operating Cash Flow",
      latestCashFlow
        ? formatNumber(latestCashFlow.operatingCashFlow, ` ${profile?.currency ?? ""}`)
        : null,
      latestCashFlow ? `${latestCashFlow.calendarYear}` : undefined,
    ),
    metric(
      "Free Cash Flow",
      latestCashFlow
        ? formatNumber(latestCashFlow.freeCashFlow, ` ${profile?.currency ?? ""}`)
        : null,
      latestCashFlow ? `${latestCashFlow.calendarYear}` : undefined,
    ),
    metric(
      "Capital Expenditure",
      latestCashFlow
        ? formatNumber(latestCashFlow.capitalExpenditure, ` ${profile?.currency ?? ""}`)
        : null,
      latestCashFlow ? `${latestCashFlow.calendarYear}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const debtMetrics = [
    metric(
      "Total Debt",
      latestBalance
        ? formatNumber(latestBalance.totalDebt, ` ${profile?.currency ?? ""}`)
        : null,
      latestBalance ? `${latestBalance.calendarYear}` : undefined,
    ),
    metric(
      "Net Debt",
      latestBalance
        ? formatNumber(latestBalance.netDebt, ` ${profile?.currency ?? ""}`)
        : null,
      latestBalance ? `${latestBalance.calendarYear}` : undefined,
    ),
    metric(
      "Debt-to-Equity Ratio",
      latestRatios ? String(latestRatios.debtEquityRatio?.toFixed(2) ?? "") : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
    metric(
      "Long-Term Debt",
      latestBalance
        ? formatNumber(latestBalance.longTermDebt, ` ${profile?.currency ?? ""}`)
        : null,
      latestBalance ? `${latestBalance.calendarYear}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const liquidityMetrics = [
    metric(
      "Cash and Cash Equivalents",
      latestBalance
        ? formatNumber(latestBalance.cashAndCashEquivalents, ` ${profile?.currency ?? ""}`)
        : null,
      latestBalance ? `${latestBalance.calendarYear}` : undefined,
    ),
    metric(
      "Current Ratio",
      latestRatios ? String(latestRatios.currentRatio?.toFixed(2) ?? "") : null,
      latestRatios ? `${latestRatios.calendarYear}` : undefined,
    ),
    metric(
      "Total Assets",
      latestBalance
        ? formatNumber(latestBalance.totalAssets, ` ${profile?.currency ?? ""}`)
        : null,
      latestBalance ? `${latestBalance.calendarYear}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const valuationMetrics = [
    metric(
      "Market Capitalization",
      profile ? formatNumber(profile.mktCap, ` ${profile.currency}`) : null,
      "Latest",
    ),
    metric(
      "Stock Price",
      profile ? formatNumber(profile.price, ` ${profile.currency}`) : null,
      "Latest",
    ),
    metric(
      "P/E Ratio",
      latestMetrics ? String(latestMetrics.peRatio?.toFixed(2) ?? "") : null,
      latestMetrics ? `${latestMetrics.calendarYear}` : undefined,
    ),
    metric(
      "Price-to-Sales",
      latestMetrics ? String(latestMetrics.priceToSalesRatio?.toFixed(2) ?? "") : null,
      latestMetrics ? `${latestMetrics.calendarYear}` : undefined,
    ),
    metric(
      "EV/EBITDA",
      latestMetrics
        ? String(latestMetrics.enterpriseValueOverEBITDA?.toFixed(2) ?? "")
        : null,
      latestMetrics ? `${latestMetrics.calendarYear}` : undefined,
    ),
    metric(
      "Enterprise Value",
      latestEv ? formatNumber(latestEv.enterpriseValue, ` ${profile?.currency ?? ""}`) : null,
      latestEv ? `${latestEv.date}` : undefined,
    ),
  ].filter((item): item is VerifiedMetric => item !== null);

  const verifiedMetrics = {
    revenueGrowth: revenueGrowthMetrics,
    profitability: profitabilityMetrics,
    cashFlow: cashFlowMetrics,
    debt: debtMetrics,
    liquidity: liquidityMetrics,
    valuation: valuationMetrics,
  };

  const financialSections = {
    revenueGrowth: buildSection(revenueGrowthMetrics),
    profitability: buildSection(profitabilityMetrics),
    cashFlow: buildSection(cashFlowMetrics),
    debt: buildSection(debtMetrics),
    liquidity: buildSection(liquidityMetrics),
    valuation: buildSection(valuationMetrics),
  };

  const newsFacts: NormalizedNewsFact[] = [];
  const newsHeadlines: NewsHeadline[] = [];

  const addNews = (
    topic: string,
    results: Array<{ title: string; url: string; content: string; publishedDate?: string }> | undefined,
  ) => {
    for (const item of results ?? []) {
      newsFacts.push({
        topic,
        title: item.title,
        url: item.url,
        snippet: item.content,
        publishedDate: item.publishedDate,
      });
      newsHeadlines.push({
        title: item.title,
        url: item.url,
        snippet: item.content,
        publishedAt: item.publishedDate,
      });
    }
  };

  addNews("company_news", data.news?.companyNews?.results);
  addNews("industry_trends", data.news?.industryTrends?.results);
  addNews("market_developments", data.news?.marketDevelopments?.results);
  addNews("macroeconomic_news", data.news?.macroeconomicNews?.results);

  const sources: ReportSource[] = [
    {
      title: "Financial Modeling Prep — Company Data",
      url: "https://financialmodelingprep.com",
      type: "financial",
    },
    ...newsHeadlines.slice(0, 12).map((headline) => ({
      title: headline.title,
      url: headline.url,
      type: "news" as const,
    })),
  ];

  return {
    companyInput: data.companyInput,
    companyName: profile?.companyName ?? data.resolved.name,
    ticker: data.resolved.symbol,
    exchange: data.resolved.exchangeShortName,
    sector: profile?.sector ?? null,
    industry: profile?.industry ?? null,
    description: profile?.description ?? null,
    currency: profile?.currency ?? data.resolved.currency ?? null,
    country: profile?.country ?? null,
    missingData,
    verifiedMetrics,
    financialSections,
    peers: financials?.peers?.peersList ?? [],
    newsFacts,
    newsHeadlines,
    industryTrendsSummary: data.news?.industryTrends?.answer ?? null,
    marketDevelopmentsSummary: data.news?.marketDevelopments?.answer ?? null,
    macroeconomicSummary: data.news?.macroeconomicNews?.answer ?? null,
    sources,
  };
}

/**
 * Step 3: Serialize only factual information for the LLM context block.
 */
export function buildFactualContextBlock(context: NormalizedResearchContext): string {
  return JSON.stringify(
    {
      instructions:
        "The following JSON contains VERIFIED FACTS from external APIs. Do not invent, estimate, or alter any numeric values. Reference only what is present. Explicitly note missing data.",
      company: {
        input: context.companyInput,
        name: context.companyName,
        ticker: context.ticker,
        exchange: context.exchange,
        sector: context.sector,
        industry: context.industry,
        country: context.country,
        currency: context.currency,
        description: context.description,
      },
      missingData: context.missingData,
      verifiedMetrics: context.verifiedMetrics,
      peers: context.peers,
      newsFacts: context.newsFacts,
      industryTrendsSummary: context.industryTrendsSummary,
      marketDevelopmentsSummary: context.marketDevelopmentsSummary,
      macroeconomicSummary: context.macroeconomicSummary,
    },
    null,
    2,
  );
}
