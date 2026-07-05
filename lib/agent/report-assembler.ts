import { buildReportChartData } from "@/lib/utils/chart-data";
import { formatMarketCap } from "@/lib/utils/chart-data";
import type { NormalizedResearchContext } from "@/lib/agent/data-normalizer";
import type { AiAnalysisResult } from "@/lib/agent/ai-analysis-service";
import type { ValidatedResearchData } from "@/lib/agent/data-validator";
import type { LlmNarrativeReportInput } from "@/lib/schemas/report.schema";
import type {
  FinancialAnalysis,
  FinancialSection,
  InvestmentReport,
  NewsAnalysis,
} from "@/lib/types/investment-report";

function withAnalysis(
  section: FinancialSection,
  analysis: string,
): FinancialSection {
  return {
    ...section,
    analysis,
  };
}

function buildFinancialHealth(
  context: NormalizedResearchContext,
  narrative: LlmNarrativeReportInput,
): FinancialAnalysis {
  const sections = context.financialSections;
  const anyAvailable = Object.values(sections).some((section) => section.dataAvailable);

  return {
    summary: narrative.financialHealthSummary,
    revenueGrowth: withAnalysis(sections.revenueGrowth, narrative.revenueGrowthAnalysis),
    profitability: withAnalysis(sections.profitability, narrative.profitabilityAnalysis),
    cashFlow: withAnalysis(sections.cashFlow, narrative.cashFlowAnalysis),
    debt: withAnalysis(sections.debt, narrative.debtAnalysis),
    liquidity: withAnalysis(sections.liquidity, narrative.liquidityAnalysis),
    valuation: withAnalysis(sections.valuation, narrative.valuationAnalysis),
    dataAvailable: anyAvailable,
    dataNote: anyAvailable
      ? undefined
      : "Financial data unavailable — analysis based on limited or no verified metrics",
  };
}

function buildNewsAnalysis(
  context: NormalizedResearchContext,
  narrative: LlmNarrativeReportInput,
): NewsAnalysis {
  const hasNews = context.newsHeadlines.length > 0;

  return {
    summary: narrative.recentNewsSummary,
    headlines: context.newsHeadlines.slice(0, 10),
    dataAvailable: hasNews,
    dataNote: hasNews
      ? undefined
      : "News data unavailable — summary based on limited or no verified headlines",
  };
}

export interface AssembleReportOptions {
  stockPrices?: Array<{ date: string; close: number }>;
}

/**
 * Merges LLM narrative with verified metrics and metadata into the final report.
 */
export function assembleInvestmentReport(
  validated: ValidatedResearchData,
  context: NormalizedResearchContext,
  aiResult: AiAnalysisResult,
  options: AssembleReportOptions = {},
): InvestmentReport {
  const narrative = aiResult.narrative;
  const financialHealth = buildFinancialHealth(context, narrative);
  const profile = validated.data.financials?.profile ?? null;

  const chartData = buildReportChartData(
    validated.data.financials,
    options.stockPrices ?? [],
  );

  return {
    meta: {
      companyName: context.companyName,
      ticker: context.ticker,
      exchange: context.exchange,
      sector: context.sector,
      industry: context.industry,
      logoUrl: profile?.image ?? null,
      marketCap: formatMarketCap(profile?.mktCap, profile?.currency),
      currency: profile?.currency ?? context.currency,
      analyzedAt: new Date().toISOString(),
      dataQuality: validated.dataQuality,
      missingData: context.missingData,
      processingTimeMs: aiResult.processingTimeMs,
      model: aiResult.model,
      tokenUsage: aiResult.tokenUsage,
      country: profile?.country ?? context.country ?? null,
      website: profile?.website ?? null,
    },
    executiveSummary: narrative.executiveSummary,
    businessOverview: narrative.businessOverview,
    financialHealth,
    revenueGrowthAnalysis: financialHealth.revenueGrowth,
    profitabilityAnalysis: financialHealth.profitability,
    cashFlowAnalysis: financialHealth.cashFlow,
    debtAnalysis: financialHealth.debt,
    liquidityAnalysis: financialHealth.liquidity,
    valuationAnalysis: financialHealth.valuation,
    competitivePosition: narrative.competitivePosition,
    industryAnalysis: narrative.industryAnalysis,
    swot: narrative.swot,
    recentNewsSummary: buildNewsAnalysis(context, narrative),
    newsSentiment: narrative.newsSentiment,
    growthOpportunities: narrative.growthOpportunities,
    riskFactors: narrative.riskFactors,
    investmentThesis: narrative.investmentThesis,
    finalRecommendation: narrative.finalRecommendation,
    confidenceScore: narrative.confidenceScore,
    investmentHorizon: narrative.investmentHorizon,
    sources: context.sources,
    chartData,
  };
}
