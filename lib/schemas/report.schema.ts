import { z } from "zod";

export const recommendationVerdictSchema = z.enum(["INVEST", "WATCH", "PASS"]);

export const investmentHorizonSchema = z.enum([
  "Short Term",
  "Medium Term",
  "Long Term",
]);

export const dataQualitySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const verifiedMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  period: z.string().optional(),
  source: z.string(),
});

export const financialSectionSchema = z.object({
  analysis: z.string(),
  metrics: z.array(verifiedMetricSchema),
  dataAvailable: z.boolean(),
  dataNote: z.string().optional(),
});

export const newsHeadlineSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  source: z.string().optional(),
  publishedAt: z.string().optional(),
  snippet: z.string().optional(),
});

export const newsAnalysisSchema = z.object({
  summary: z.string(),
  headlines: z.array(newsHeadlineSchema),
  dataAvailable: z.boolean(),
  dataNote: z.string().optional(),
});

export const newsSentimentSchema = z.object({
  score: z.number().min(-1).max(1),
  label: z.string(),
  reasoning: z.string(),
});

export const swotSchema = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

export const recommendationSchema = z.object({
  verdict: recommendationVerdictSchema,
  reasoning: z.string(),
  keyDrivers: z.array(z.string()),
});

export const confidenceAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  explanation: z.string(),
  positiveFactors: z.array(z.string()),
  negativeFactors: z.array(z.string()),
});

export const investmentHorizonAssessmentSchema = z.object({
  horizon: investmentHorizonSchema,
  reasoning: z.string(),
});

export const riskAssessmentSchema = z.object({
  summary: z.string(),
  risks: z.array(z.string()),
});

export const financialAnalysisSchema = z.object({
  summary: z.string(),
  revenueGrowth: financialSectionSchema,
  profitability: financialSectionSchema,
  cashFlow: financialSectionSchema,
  debt: financialSectionSchema,
  liquidity: financialSectionSchema,
  valuation: financialSectionSchema,
  dataAvailable: z.boolean(),
  dataNote: z.string().optional(),
});

export const reportSourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  type: z.enum(["financial", "news", "web"]),
});

export const investmentReportMetaSchema = z.object({
  companyName: z.string(),
  ticker: z.string().nullable(),
  exchange: z.string().nullable(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  logoUrl: z.string().nullable(),
  marketCap: z.string().nullable(),
  currency: z.string().nullable(),
  analyzedAt: z.string(),
  dataQuality: dataQualitySchema,
  missingData: z.array(z.string()),
  processingTimeMs: z.number(),
  model: z.string(),
  tokenUsage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
});

export const chartDataPointSchema = z.object({
  period: z.string(),
  label: z.string(),
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  grossProfit: z.number().optional(),
  freeCashFlow: z.number().optional(),
  totalDebt: z.number().optional(),
  stockholdersEquity: z.number().optional(),
  stockPrice: z.number().optional(),
});

export const reportChartDataSchema = z.object({
  revenueGrowth: z.array(chartDataPointSchema),
  netIncomeTrend: z.array(chartDataPointSchema),
  freeCashFlow: z.array(chartDataPointSchema),
  debtVsEquity: z.array(chartDataPointSchema),
  revenueVsProfit: z.array(chartDataPointSchema),
  stockPrice: z.array(chartDataPointSchema),
  hasData: z.boolean(),
  unavailable: z.array(z.string()),
});

export const investmentReportSchema = z.object({
  meta: investmentReportMetaSchema,
  executiveSummary: z.string(),
  businessOverview: z.string(),
  financialHealth: financialAnalysisSchema,
  revenueGrowthAnalysis: financialSectionSchema,
  profitabilityAnalysis: financialSectionSchema,
  cashFlowAnalysis: financialSectionSchema,
  debtAnalysis: financialSectionSchema,
  liquidityAnalysis: financialSectionSchema,
  valuationAnalysis: financialSectionSchema,
  competitivePosition: z.string(),
  industryAnalysis: z.string(),
  swot: swotSchema,
  recentNewsSummary: newsAnalysisSchema,
  newsSentiment: newsSentimentSchema,
  growthOpportunities: z.array(z.string()),
  riskFactors: riskAssessmentSchema,
  investmentThesis: z.string(),
  finalRecommendation: recommendationSchema,
  confidenceScore: confidenceAssessmentSchema,
  investmentHorizon: investmentHorizonAssessmentSchema,
  sources: z.array(reportSourceSchema),
  chartData: reportChartDataSchema,
});

/** Schema for LLM narrative output — metrics are merged from verified data post-generation. */
export const llmNarrativeReportSchema = z.object({
  executiveSummary: z.string(),
  businessOverview: z.string(),
  financialHealthSummary: z.string(),
  revenueGrowthAnalysis: z.string(),
  profitabilityAnalysis: z.string(),
  cashFlowAnalysis: z.string(),
  debtAnalysis: z.string(),
  liquidityAnalysis: z.string(),
  valuationAnalysis: z.string(),
  competitivePosition: z.string(),
  industryAnalysis: z.string(),
  swot: swotSchema,
  recentNewsSummary: z.string(),
  newsSentiment: newsSentimentSchema,
  growthOpportunities: z.array(z.string()),
  riskFactors: riskAssessmentSchema,
  investmentThesis: z.string(),
  finalRecommendation: recommendationSchema,
  confidenceScore: confidenceAssessmentSchema,
  investmentHorizon: investmentHorizonAssessmentSchema,
});

export const researchRequestSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(120, "Company name is too long"),
});

export type InvestmentReportInput = z.infer<typeof investmentReportSchema>;
export type LlmNarrativeReportInput = z.infer<typeof llmNarrativeReportSchema>;
export type ResearchRequestInput = z.infer<typeof researchRequestSchema>;

// Legacy exports for backward compatibility during migration
export const recommendationSchemaLegacy = recommendationVerdictSchema;
export const metricSchema = verifiedMetricSchema;
export const sectionWithDataSchema = financialSectionSchema;
export const newsItemSchema = newsHeadlineSchema;
export const sourceSchema = reportSourceSchema;
export const sentimentAnalysisSchema = newsSentimentSchema;
