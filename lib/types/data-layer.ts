import type { ApiError } from "@/lib/errors/api-error";

export interface FmpCompanyProfile {
  symbol: string;
  companyName: string;
  currency: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  sector: string;
  country: string;
  description: string;
  ceo: string;
  website: string;
  image: string;
  ipoDate: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
  mktCap: number;
  price: number;
  beta: number;
  volAvg: number;
  lastDiv: number;
  fullTimeEmployees: number;
}

export interface FmpIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  calendarYear: string;
  period: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  ebitda: number;
}

export interface FmpBalanceSheet {
  date: string;
  symbol: string;
  calendarYear: string;
  period: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  netDebt: number;
  cashAndCashEquivalents: number;
  shortTermDebt: number;
  longTermDebt: number;
}

export interface FmpCashFlowStatement {
  date: string;
  symbol: string;
  calendarYear: string;
  period: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  netCashProvidedByOperatingActivities: number;
  netCashUsedForInvestingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
}

export interface FmpKeyMetrics {
  date: string;
  symbol: string;
  calendarYear: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  peRatio: number;
  priceToSalesRatio: number;
  pbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  debtToEquity: number;
  currentRatio: number;
  returnOnEquity: number;
  returnOnAssets: number;
}

export interface FmpFinancialRatio {
  date: string;
  symbol: string;
  calendarYear: string;
  period: string;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  debtEquityRatio: number;
  currentRatio: number;
  priceEarningsRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
}

export interface FmpEnterpriseValue {
  date: string;
  symbol: string;
  stockPrice: number;
  numberOfShares: number;
  marketCapitalization: number;
  minusCashAndCashEquivalents: number;
  addTotalDebt: number;
  enterpriseValue: number;
}

export interface FmpHistoricalRevenue {
  date: string;
  calendarYear: string;
  period: string;
  revenue: number;
  revenueGrowth: number | null;
}

export interface FmpStockPeers {
  symbol: string;
  peersList: string[];
}

export interface FmpSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export interface CompanyFinancialBundle {
  profile: FmpCompanyProfile | null;
  incomeStatements: FmpIncomeStatement[];
  balanceSheets: FmpBalanceSheet[];
  cashFlowStatements: FmpCashFlowStatement[];
  keyMetrics: FmpKeyMetrics[];
  financialRatios: FmpFinancialRatio[];
  enterpriseValues: FmpEnterpriseValue[];
  historicalRevenue: FmpHistoricalRevenue[];
  peers: FmpStockPeers | null;
  unavailable: string[];
  errors: ApiError[];
}

export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResultItem[];
  responseTime?: number;
}

export type TavilySearchTopic =
  | "company_news"
  | "industry_trends"
  | "market_developments"
  | "macroeconomic_news";

export interface TavilyNewsBundle {
  companyNews: TavilySearchResponse | null;
  industryTrends: TavilySearchResponse | null;
  marketDevelopments: TavilySearchResponse | null;
  macroeconomicNews: TavilySearchResponse | null;
  unavailable: string[];
  errors: ApiError[];
}

export type ResolverConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface ResolvedCompany {
  input: string;
  symbol: string;
  name: string;
  exchange: string;
  exchangeShortName: string;
  currency: string;
  confidence: ResolverConfidence;
  candidates: FmpSearchResult[];
  note?: string;
}

export interface CompanyResolverResult {
  resolved: ResolvedCompany | null;
  error: ApiError | null;
}

export interface CompanyResearchData {
  companyInput: string;
  resolved: ResolvedCompany | null;
  financials: CompanyFinancialBundle | null;
  news: TavilyNewsBundle | null;
  resolverError: ApiError | null;
  collectedAt: string;
}
