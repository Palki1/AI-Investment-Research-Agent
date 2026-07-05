import type { ReportChartData } from "@/lib/types/chart-data";

export type RecommendationVerdict = "INVEST" | "WATCH" | "PASS";

export type InvestmentHorizonLabel = "Short Term" | "Medium Term" | "Long Term";

export type DataQuality = "HIGH" | "MEDIUM" | "LOW";

export interface VerifiedMetric {
  label: string;
  value: string;
  period?: string;
  source: string;
}

export interface ReportSource {
  title: string;
  url: string;
  type: "financial" | "news" | "web";
}

export interface NewsHeadline {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
  snippet?: string;
}

export interface FinancialSection {
  analysis: string;
  metrics: VerifiedMetric[];
  dataAvailable: boolean;
  dataNote?: string;
}

export interface FinancialAnalysis {
  summary: string;
  revenueGrowth: FinancialSection;
  profitability: FinancialSection;
  cashFlow: FinancialSection;
  debt: FinancialSection;
  liquidity: FinancialSection;
  valuation: FinancialSection;
  dataAvailable: boolean;
  dataNote?: string;
}

export interface NewsAnalysis {
  summary: string;
  headlines: NewsHeadline[];
  dataAvailable: boolean;
  dataNote?: string;
}

export interface NewsSentiment {
  score: number;
  label: string;
  reasoning: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Recommendation {
  verdict: RecommendationVerdict;
  reasoning: string;
  keyDrivers: string[];
}

export interface ConfidenceAssessment {
  score: number;
  explanation: string;
  positiveFactors: string[];
  negativeFactors: string[];
}

export interface InvestmentHorizon {
  horizon: InvestmentHorizonLabel;
  reasoning: string;
}

export interface RiskAssessment {
  summary: string;
  risks: string[];
}

export interface InvestmentReportMeta {
  companyName: string;
  ticker: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  logoUrl: string | null;
  marketCap: string | null;
  currency: string | null;
  analyzedAt: string;
  dataQuality: DataQuality;
  missingData: string[];
  processingTimeMs: number;
  model: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  country?: string | null;
  website?: string | null;
}

export interface InvestmentReport {
  meta: InvestmentReportMeta;
  executiveSummary: string;
  businessOverview: string;
  financialHealth: FinancialAnalysis;
  revenueGrowthAnalysis: FinancialSection;
  profitabilityAnalysis: FinancialSection;
  cashFlowAnalysis: FinancialSection;
  debtAnalysis: FinancialSection;
  liquidityAnalysis: FinancialSection;
  valuationAnalysis: FinancialSection;
  competitivePosition: string;
  industryAnalysis: string;
  swot: SWOT;
  recentNewsSummary: NewsAnalysis;
  newsSentiment: NewsSentiment;
  growthOpportunities: string[];
  riskFactors: RiskAssessment;
  investmentThesis: string;
  finalRecommendation: Recommendation;
  confidenceScore: ConfidenceAssessment;
  investmentHorizon: InvestmentHorizon;
  sources: ReportSource[];
  chartData: ReportChartData;
}

export interface ResearchPipelineResult {
  report: InvestmentReport;
  companyInput: string;
}

export interface ResearchPipelineError {
  error: string;
  code: string;
  details?: string;
}
