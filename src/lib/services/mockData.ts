import { ReportContent } from "@/types";

export const MOCK_REPORT: ReportContent = {
  decision: "INVEST",
  confidence: 85,
  riskLevel: "Medium",
  summary: "The company exhibits strong fundamentals with robust revenue growth driven by its core product lines. Despite short-term macroeconomic headwinds and supply chain challenges, the long-term outlook remains highly positive due to strategic investments in AI and cloud infrastructure. The valuation is slightly premium but justified by superior margins and market dominance.",
  companyOverview: {
    industry: "Consumer Electronics / Tech",
    ceo: "Tim Cook",
    marketCap: "$3.1T",
    revenue: "$383.2B",
    employees: "161,000",
    headquarters: "Cupertino, CA",
    website: "https://apple.com",
    stockPrice: "$189.30",
    peRatio: "29.5",
    eps: "6.42",
    dividendYield: "0.53%",
    beta: "1.28"
  },
  financial_analysis: {
    revenueGrowth: "2.1%",
    profitMargin: "25.3%",
    operatingMargin: "30.1%",
    debtToEquity: "1.45",
    currentRatio: "1.08",
    quickRatio: "1.02",
    roe: "156%",
    roa: "28.4%",
    cashFlow: "$99.5B",
    debt: "$109B"
  },
  news: [
    {
      headline: "Company announces groundbreaking new AI chip architecture",
      source: "TechCrunch",
      date: "2026-07-01",
      sentiment: "Positive",
      summary: "A new line of processors promises to double AI inference speed."
    },
    {
      headline: "Regulatory scrutiny increases in EU market",
      source: "Financial Times",
      date: "2026-06-28",
      sentiment: "Negative",
      summary: "Antitrust regulators are probing recent app store policy changes."
    }
  ],
  strengths: [
    "Unmatched brand loyalty and pricing power",
    "Deep ecosystem lock-in across hardware and software",
    "Massive cash reserves and strong free cash flow generation"
  ],
  weaknesses: [
    "Heavy reliance on a single product category for majority of revenue",
    "Supply chain concentration risks in Asia",
    "Perceived lag in generative AI consumer applications"
  ],
  opportunities: [
    "Expansion into healthcare and wearables",
    "Growth in emerging markets like India and Southeast Asia",
    "Monetization of new spatial computing platform"
  ],
  threats: [
    "Intensifying competition from Asian hardware manufacturers",
    "Increasing regulatory pressure in US and EU",
    "Macroeconomic slowdown affecting premium consumer spending"
  ],
  competitors: [
    {
      name: "Microsoft",
      marketCap: "$3.2T",
      peRatio: "35.2",
      revenue: "$211B",
      growth: "11%",
      margins: "34%",
      competitiveAdvantage: "Enterprise software dominance and early AI integration"
    }
  ],
  risk_analysis: {
    politicalRisk: { level: "Medium", description: "Exposure to US-China trade tensions." },
    economicRisk: { level: "Medium", description: "Sensitive to consumer spending downturns." },
    marketRisk: { level: "Low", description: "Highly liquid, blue-chip stock with low volatility." },
    competitionRisk: { level: "High", description: "Fierce competition in AI and mobile spaces." },
    technologyRisk: { level: "Medium", description: "Rapid pace of AI innovation requires massive R&D." },
    legalRisk: { level: "Medium", description: "Ongoing antitrust investigations globally." }
  },
  reasoning: "The recommendation to INVEST is based on the company's exceptional free cash flow generation, unmatched ecosystem stickiness, and aggressive entry into the AI space. While valuation multiples are stretched compared to historical averages, the premium is warranted given the high return on equity and defensive characteristics of its services segment. The primary risk lies in regulatory actions, but the core business remains deeply resilient. Investors should accumulate on pullbacks.",
  pros: [
    "Highly predictable recurring revenue from Services",
    "Industry-leading profit margins",
    "Aggressive share buyback program"
  ],
  cons: [
    "Stretched valuation limits near-term upside",
    "Hardware upgrade cycles are lengthening",
    "Regulatory headwinds could impact margins"
  ],
  recommendation: {
    horizon: "Long Term",
    investorType: "Balanced"
  },
  sources: [
    "Yahoo Finance API",
    "Tavily Web Search",
    "SEC EDGAR Filings (Simulated)"
  ]
};
