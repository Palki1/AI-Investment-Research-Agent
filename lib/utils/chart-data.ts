import type { CompanyFinancialBundle } from "@/lib/types/data-layer";
import type { ChartDataPoint, ReportChartData } from "@/lib/types/chart-data";

function sortByPeriod<T extends { calendarYear: string; period?: string }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) =>
    `${a.calendarYear}${a.period ?? ""}`.localeCompare(
      `${b.calendarYear}${b.period ?? ""}`,
    ),
  );
}

function periodLabel(calendarYear: string, period?: string): string {
  return period && period !== "FY" ? `${calendarYear} ${period}` : calendarYear;
}

/**
 * Builds chart-ready time series from verified FMP financial bundles.
 * Never fabricates values — only uses API-returned numbers.
 */
export function buildReportChartData(
  financials: CompanyFinancialBundle | null,
  stockPrices: Array<{ date: string; close: number }> = [],
): ReportChartData {
  const unavailable: string[] = [];

  if (!financials) {
    return {
      revenueGrowth: [],
      netIncomeTrend: [],
      freeCashFlow: [],
      debtVsEquity: [],
      revenueVsProfit: [],
      stockPrice: [],
      epsTrend: [],
      profitMargins: [],
      hasData: false,
      unavailable: ["financials"],
    };
  }

  const income = sortByPeriod(financials.incomeStatements);
  const balance = sortByPeriod(financials.balanceSheets);
  const cashFlow = sortByPeriod(financials.cashFlowStatements);

  const revenueGrowth: ChartDataPoint[] = income.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    revenue: row.revenue,
  }));

  const netIncomeTrend: ChartDataPoint[] = income.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    netIncome: row.netIncome,
  }));

  const freeCashFlowSeries: ChartDataPoint[] = cashFlow.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    freeCashFlow: row.freeCashFlow,
  }));

  const debtVsEquity: ChartDataPoint[] = balance.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    totalDebt: row.totalDebt,
    stockholdersEquity: row.totalStockholdersEquity,
  }));

  const revenueVsProfit: ChartDataPoint[] = income.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    revenue: row.revenue,
    grossProfit: row.grossProfit,
    netIncome: row.netIncome,
  }));

  const stockPrice: ChartDataPoint[] = [...stockPrices]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-24)
    .map((row) => ({
      period: row.date,
      label: row.date,
      stockPrice: row.close,
    }));

  const epsTrend: ChartDataPoint[] = income.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    eps: row.eps,
  }));

  const profitMargins: ChartDataPoint[] = income.map((row) => ({
    period: row.calendarYear,
    label: periodLabel(row.calendarYear, row.period),
    profitMargin: row.revenue ? (row.netIncome / row.revenue) * 100 : 0,
  }));

  if (revenueGrowth.length === 0) unavailable.push("revenueGrowth");
  if (netIncomeTrend.length === 0) unavailable.push("netIncomeTrend");
  if (freeCashFlowSeries.length === 0) unavailable.push("freeCashFlow");
  if (debtVsEquity.length === 0) unavailable.push("debtVsEquity");
  if (revenueVsProfit.length === 0) unavailable.push("revenueVsProfit");
  if (stockPrice.length === 0) unavailable.push("stockPrice");
  if (epsTrend.length === 0) unavailable.push("epsTrend");
  if (profitMargins.length === 0) unavailable.push("profitMargins");

  const hasData =
    revenueGrowth.length > 0 ||
    netIncomeTrend.length > 0 ||
    freeCashFlowSeries.length > 0 ||
    debtVsEquity.length > 0;

  return {
    revenueGrowth,
    netIncomeTrend,
    freeCashFlow: freeCashFlowSeries,
    debtVsEquity,
    revenueVsProfit,
    stockPrice,
    epsTrend,
    profitMargins,
    hasData,
    unavailable,
  };
}

export function formatCompactNumber(value: number, currency = "USD"): string {
  const prefix = currency === "USD" ? "$" : "";

  if (Math.abs(value) >= 1_000_000_000_000) {
    return `${prefix}${(value / 1_000_000_000_000).toFixed(1)}T`;
  }

  if (Math.abs(value) >= 1_000_000_000) {
    return `${prefix}${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `${prefix}${(value / 1_000).toFixed(1)}K`;
  }

  return `${prefix}${value.toFixed(2)}`;
}

export function formatMarketCap(value: number | null | undefined, currency?: string | null): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  return formatCompactNumber(value, currency ?? "USD");
}
