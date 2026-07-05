export interface FinancialAnalysis {
  revenueGrowth: string;
  profitMargin: string;
  operatingMargin: string;
  debtToEquity: string;
  currentRatio: string;
  quickRatio: string;
  roe: string;
  roa: string;
  cashFlow: string;
  debt: string;
}

export interface RiskAnalysis {
  politicalRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
  economicRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
  marketRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
  competitionRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
  technologyRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
  legalRisk: { level: 'Low' | 'Medium' | 'High'; description: string };
}

export interface NewsArticle {
  headline: string;
  source: string;
  date: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  summary: string;
}

export interface Competitor {
  name: string;
  marketCap: string;
  peRatio: string;
  revenue: string;
  growth: string;
  margins: string;
  competitiveAdvantage: string;
}

export interface ReportContent {
  decision: 'INVEST' | 'PASS';
  confidence: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  companyOverview: {
    industry: string;
    ceo: string;
    marketCap: string;
    revenue: string;
    employees: string;
    headquarters: string;
    website: string;
    stockPrice: string;
    peRatio: string;
    eps: string;
    dividendYield: string;
    beta: string;
  };
  financial_analysis: FinancialAnalysis;
  news: NewsArticle[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitors: Competitor[];
  risk_analysis: RiskAnalysis;
  reasoning: string;
  pros: string[];
  cons: string[];
  recommendation: {
    horizon: 'Short Term' | 'Medium Term' | 'Long Term';
    investorType: 'Conservative' | 'Balanced' | 'Aggressive';
  };
  sources: string[];
}
