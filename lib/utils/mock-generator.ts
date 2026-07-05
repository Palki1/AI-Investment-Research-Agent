import type { InvestmentReport } from "@/lib/types/investment-report";

export function generateMockReport(companyName: string): InvestmentReport {
  const normalized = companyName.toLowerCase();
  let ticker = "MOCK";
  let exchange = "NASDAQ";
  let sector = "Technology";
  let industry = "Software / Consumer Services";
  let marketCap = "$100.00B";
  let verdict: "INVEST" | "WATCH" | "PASS" = "WATCH";
  let confidence = 85;
  let horizon: "Short Term" | "Medium Term" | "Long Term" = "Long Term";
  let logoUrl: string | null = null;
  let country = "United States";
  let website = "https://example.com";

  if (normalized.includes("apple") || normalized.includes("aapl")) {
    ticker = "AAPL";
    exchange = "NASDAQ";
    sector = "Technology";
    industry = "Consumer Electronics";
    marketCap = "$3.35T";
    verdict = "INVEST";
    confidence = 94;
    horizon = "Long Term";
    logoUrl = "https://logo.clearbit.com/apple.com";
    country = "United States";
    website = "https://www.apple.com";
  } else if (normalized.includes("tesla") || normalized.includes("tsla")) {
    ticker = "TSLA";
    exchange = "NASDAQ";
    sector = "Automotive / Clean Energy";
    industry = "Electric Vehicles & Solar";
    marketCap = "$820.50B";
    verdict = "WATCH";
    confidence = 78;
    horizon = "Medium Term";
    logoUrl = "https://logo.clearbit.com/tesla.com";
    country = "United States";
    website = "https://www.tesla.com";
  } else if (normalized.includes("nvidia") || normalized.includes("nvda")) {
    ticker = "NVDA";
    exchange = "NASDAQ";
    sector = "Technology";
    industry = "Semiconductors & AI Hardware";
    marketCap = "$3.12T";
    verdict = "INVEST";
    confidence = 91;
    horizon = "Long Term";
    logoUrl = "https://logo.clearbit.com/nvidia.com";
    country = "United States";
    website = "https://www.nvidia.com";
  } else if (normalized.includes("microsoft") || normalized.includes("msft")) {
    ticker = "MSFT";
    exchange = "NASDAQ";
    sector = "Technology";
    industry = "Software & Cloud Services";
    marketCap = "$3.24T";
    verdict = "INVEST";
    confidence = 95;
    horizon = "Long Term";
    logoUrl = "https://logo.clearbit.com/microsoft.com";
    country = "United States";
    website = "https://www.microsoft.com";
  } else if (normalized.includes("reliance") || normalized.includes("reliance.ns")) {
    ticker = "RELIANCE.NS";
    exchange = "NSE";
    sector = "Conglomerate";
    industry = "Energy, Telecom, Retail";
    marketCap = "₹18.50T";
    verdict = "INVEST";
    confidence = 88;
    horizon = "Long Term";
    logoUrl = "https://logo.clearbit.com/ril.com";
    country = "India";
    website = "https://www.ril.com";
  }

  // Pre-generate chart trends
  const years = ["2020", "2021", "2022", "2023", "2024"];
  const revBase = ticker === "AAPL" ? 274000 : ticker === "TSLA" ? 31000 : ticker === "NVDA" ? 16000 : ticker === "MSFT" ? 143000 : 80000;
  const growthMultiplier = ticker === "NVDA" ? 1.8 : ticker === "TSLA" ? 1.4 : 1.12;

  const revenueGrowth = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    revenue: Math.round(revBase * Math.pow(growthMultiplier, idx) * 1000000),
  }));

  const netIncomeTrend = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    netIncome: Math.round(revBase * 0.22 * Math.pow(growthMultiplier, idx) * (ticker === "NVDA" ? 1.2 : 0.95) * 1000000),
  }));

  const freeCashFlow = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    freeCashFlow: Math.round(revBase * 0.25 * Math.pow(growthMultiplier, idx) * 1000000),
  }));

  const debtVsEquity = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    totalDebt: Math.round(revBase * 0.3 * Math.pow(1.05, idx) * 1000000),
    stockholdersEquity: Math.round(revBase * 0.8 * Math.pow(1.15, idx) * 1000000),
  }));

  const revenueVsProfit = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    revenue: Math.round(revBase * Math.pow(growthMultiplier, idx) * 1000000),
    grossProfit: Math.round(revBase * 0.44 * Math.pow(growthMultiplier, idx) * 1000000),
    netIncome: Math.round(revBase * 0.22 * Math.pow(growthMultiplier, idx) * 1000000),
  }));

  const epsTrend = years.map((yr, idx) => ({
    period: yr,
    label: yr,
    eps: 2.5 + idx * (ticker === "NVDA" ? 1.8 : 0.65),
  }));

  const profitMargins = years.map((yr) => ({
    period: yr,
    label: yr,
    profitMargin: ticker === "NVDA" ? 38.5 : ticker === "TSLA" ? 14.2 : 25.4,
  }));

  const stockPrice = Array.from({ length: 24 }).map((_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (24 - idx));
    const dateStr = d.toISOString().split("T")[0];
    return {
      period: dateStr,
      label: dateStr,
      stockPrice: (ticker === "AAPL" ? 120 : ticker === "TSLA" ? 150 : ticker === "NVDA" ? 40 : 200) + idx * (ticker === "NVDA" ? 8 : 3) + Math.sin(idx) * 8,
    };
  });

  const section = (label: string, value: string, text: string) => ({
    analysis: text,
    metrics: [
      { label: `${label} (Latest)`, value, period: "2024", source: "Financial Modeling Prep" },
      { label: `${label} (Previous)`, value: String(parseFloat(value.replace(/[^0-9.]/g, "")) * 0.9), period: "2023", source: "Financial Modeling Prep" },
    ],
    dataAvailable: true,
  });

  return {
    meta: {
      companyName,
      ticker,
      exchange,
      sector,
      industry,
      logoUrl,
      marketCap,
      currency: "USD",
      analyzedAt: new Date().toISOString(),
      dataQuality: "HIGH",
      missingData: [],
      processingTimeMs: 420,
      model: "Demo Mode (Mock data)",
      country,
      website,
    },
    executiveSummary: `This is a comprehensive, institutional-grade equity research report for ${companyName} (${ticker}). The company exhibits strong growth potential backed by a solid market position in ${industry}. Despite macro volatility, its underlying financials suggest high resilience, driving our recommendation.`,
    businessOverview: `${companyName} is a global leader in ${industry}, offering high-margin products and innovative solutions. It serves millions of consumers and enterprises worldwide, benefiting from a robust brand moat and extensive research and development.`,
    financialHealth: {
      summary: `The financial health of ${companyName} is robust, characterized by stable profit margins, consistent free cash flow generation, and manageable debt leverage.`,
      revenueGrowth: section("Revenue", marketCap, `Revenue growth remains consistent with industry trends, showing steady double-digit expansions.`),
      profitability: section("Gross Margin", "44.20%", `Profitability margins remain at high levels, reflecting robust brand pricing power.`),
      cashFlow: section("Free Cash Flow", "$25.00B", `Free cash flow conversion is highly efficient, funding continued R&D and capital distributions.`),
      debt: section("Debt to Equity", "0.45", `Debt levels are conservative and fully supported by strong cash positions.`),
      liquidity: section("Current Ratio", "1.65", `Liquidity ratios confirm that the company maintains more than sufficient short-term buffers.`),
      valuation: section("P/E Ratio", "28.50", `Valuation multiples are premium, reflecting the market's confidence in long-term AI-driven earnings growth.`),
      dataAvailable: true,
    },
    revenueGrowthAnalysis: section("Revenue", marketCap, `Revenue growth remains consistent with industry trends, showing steady double-digit expansions.`),
    profitabilityAnalysis: section("Gross Margin", "44.20%", `Profitability margins remain at high levels, reflecting robust brand pricing power.`),
    cashFlowAnalysis: section("Free Cash Flow", "$25.00B", `Free cash flow conversion is highly efficient, funding continued R&D and capital distributions.`),
    debtAnalysis: section("Debt to Equity", "0.45", `Debt levels are conservative and fully supported by strong cash positions.`),
    liquidityAnalysis: section("Current Ratio", "1.65", `Liquidity ratios confirm that the company maintains more than sufficient short-term buffers.`),
    valuationAnalysis: section("P/E Ratio", "28.50", `Valuation multiples are premium, reflecting the market's confidence in long-term AI-driven earnings growth.`),
    competitivePosition: `${companyName} occupies a dominant competitive position, protected by high switching costs, brand loyalty, and a powerful technological edge.`,
    industryAnalysis: `The ${sector} industry is experiencing significant secular tailwinds, including digitization, automation, and AI adoption.`,
    swot: {
      strengths: ["Strong global brand and marketing reach", "High margins and recurring revenue streams", "Exceptional balance sheet strength"],
      weaknesses: ["High premium pricing limits market share in emerging regions", "Reliance on global supply chains"],
      opportunities: ["Expansion of cloud computing and AI solutions", "Underpenetrated corporate software sectors"],
      threats: ["Growing antitrust scrutiny", "Intense competitors in semiconductors and EV"],
    },
    recentNewsSummary: {
      summary: `News headlines for ${companyName} are predominantly positive, centering on product announcements, technological breakthroughs, and solid quarterly reports.`,
      headlines: [
        { title: `${companyName} unveils new product lineup at annual developers conference`, url: "https://finance.yahoo.com/news/1", source: "Yahoo Finance", publishedAt: "2 days ago", snippet: "The announcement was well received by analysts, pointing to strong product cycles." },
        { title: `Analysts upgrade ${companyName} following impressive quarterly performance`, url: "https://bloomberg.com/news/2", source: "Bloomberg", publishedAt: "4 days ago", snippet: "Target prices were raised across Wall Street, citing robust margins." },
      ],
      dataAvailable: true,
    },
    newsSentiment: {
      score: 0.75,
      label: "Bullish",
      reasoning: "Media and analyst sentiment is highly supportive, driving positive price momentum.",
    },
    growthOpportunities: ["Expansion of advanced cloud and machine learning models", "Increasing average revenue per user (ARPU) through premium service additions", "Strategic acquisitions in emerging software verticals"],
    riskFactors: {
      summary: "Key risks center on supply chain, regulation, and currency headwinds.",
      risks: ["Supply chain bottlenecks affecting hardware component deliveries", "Increasing regulatory and antitrust interventions across key markets", "Fluctuations in foreign exchange rates reducing international revenues"],
    },
    investmentThesis: `We view ${companyName} as a core long-term compounder. Its unique position in ${industry}, robust profitability, and large cash generation capabilities provide significant downside protection while maintaining exposure to high-growth secular trends.`,
    finalRecommendation: {
      verdict,
      reasoning: `Based on verified financial metrics and news sentiment, we believe the company holds a highly favorable risk-reward profile.`,
      keyDrivers: ["Leading market share in high-growth industries", "Stellar capital returns via buybacks and dividends", "Expanding operating margins"],
    },
    confidenceScore: {
      score: confidence,
      explanation: "Analysis is based on highly complete financial records and consistent news flows.",
      positiveFactors: ["Consistency in cash distributions", "Strong margin defense during inflationary pressures"],
      negativeFactors: ["Regulatory risks and potential antitrust fines"],
    },
    investmentHorizon: {
      horizon,
      reasoning: "The investment thesis is built on long-term compound growth rather than short-term trades.",
    },
    sources: [
      { title: "Financial Modeling Prep — Statements", url: "https://financialmodelingprep.com", type: "financial" },
      { title: "Bloomberg Financial News", url: "https://bloomberg.com", type: "news" },
    ],
    chartData: {
      revenueGrowth,
      netIncomeTrend,
      freeCashFlow,
      debtVsEquity,
      revenueVsProfit,
      stockPrice,
      epsTrend,
      profitMargins,
      hasData: true,
      unavailable: [],
    },
  };
}
