export type Recommendation = "INVEST" | "WATCH" | "PASS";

export type DataQuality = "HIGH" | "MEDIUM" | "LOW";

export type ResearchStatus = "idle" | "loading" | "success" | "error";

export interface Metric {
  label: string;
  value: string;
  period?: string;
  source?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
  snippet?: string;
}

export interface Source {
  title: string;
  url: string;
  type: "financial" | "news" | "web";
}

export interface SectionWithData {
  analysis: string;
  metrics: Metric[];
  dataAvailable: boolean;
  dataNote?: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface SentimentAnalysis {
  score: number;
  label: string;
  reasoning: string;
}

export interface InvestmentReport {
  meta: {
    companyName: string;
    ticker: string | null;
    exchange: string | null;
    sector: string | null;
    analyzedAt: string;
    dataQuality: DataQuality;
    unavailableSections: string[];
  };
  executiveSummary: string;
  companyOverview: string;
  financialAnalysis: {
    revenueGrowth: SectionWithData;
    profitability: SectionWithData;
    cashFlow: SectionWithData;
    debtAnalysis: SectionWithData;
  };
  valuation: SectionWithData;
  competitiveLandscape: string;
  swot: SwotAnalysis;
  newsSummary: {
    headlines: NewsItem[];
    summary: string;
  };
  sentimentAnalysis: SentimentAnalysis;
  opportunities: string[];
  risks: string[];
  investmentThesis: string;
  finalRecommendation: Recommendation;
  confidenceScore: number;
  reasoning: string;
  sources: Source[];
}

export interface ResearchRequest {
  companyName: string;
}

export interface ResearchErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export interface ResearchSuccessResponse {
  report: InvestmentReport;
}
