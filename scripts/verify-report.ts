import "./load-env";

import { buildReportChartData } from "../lib/utils/chart-data";
import { assembleInvestmentReport } from "../lib/agent/report-assembler";
import type { CompanyFinancialBundle, ResolvedCompany } from "../lib/types/data-layer";
import type { NormalizedResearchContext } from "../lib/agent/data-normalizer";
import type { AiAnalysisResult } from "../lib/agent/ai-analysis-service";
import type { ValidatedResearchData } from "../lib/agent/data-validator";

function createMockFinancialBundle(symbol: string, name: string): CompanyFinancialBundle {
  return {
    profile: {
      symbol,
      companyName: name,
      currency: "USD",
      exchange: "NASDAQ",
      exchangeShortName: "NASDAQ",
      industry: "Consumer Electronics",
      sector: "Technology",
      country: "US",
      description: "Mock description",
      ceo: "Mock CEO",
      website: "https://mockcompany.com",
      image: "https://mockcompany.com/logo.png",
      ipoDate: "1980-12-12",
      isEtf: false,
      isActivelyTrading: true,
      mktCap: 3000000000000,
      price: 180.5,
      beta: 1.2,
      volAvg: 50000000,
      lastDiv: 0.96,
      fullTimeEmployees: 150000,
    },
    incomeStatements: [
      {
        date: "2024-09-30",
        symbol,
        reportedCurrency: "USD",
        calendarYear: "2024",
        period: "FY",
        revenue: 391000000000,
        grossProfit: 180000000000,
        operatingIncome: 115000000000,
        netIncome: 97000000000,
        eps: 6.16,
        ebitda: 125000000000,
      },
      {
        date: "2023-09-30",
        symbol,
        reportedCurrency: "USD",
        calendarYear: "2023",
        period: "FY",
        revenue: 383000000000,
        grossProfit: 170000000000,
        operatingIncome: 110000000000,
        netIncome: 93000000000,
        eps: 5.67,
        ebitda: 120000000000,
      },
    ],
    balanceSheets: [
      {
        date: "2024-09-30",
        symbol,
        calendarYear: "2024",
        period: "FY",
        totalAssets: 350000000000,
        totalLiabilities: 270000000000,
        totalStockholdersEquity: 80000000000,
        totalDebt: 100000000000,
        netDebt: 75000000000,
        cashAndCashEquivalents: 25000000000,
        shortTermDebt: 15000000000,
        longTermDebt: 85000000000,
      },
    ],
    cashFlowStatements: [
      {
        date: "2024-09-30",
        symbol,
        calendarYear: "2024",
        period: "FY",
        operatingCashFlow: 110000000000,
        capitalExpenditure: -10000000000,
        freeCashFlow: 100000000000,
        netCashProvidedByOperatingActivities: 110000000000,
        netCashUsedForInvestingActivites: -15000000000,
        netCashUsedProvidedByFinancingActivities: -95000000000,
      },
    ],
    keyMetrics: [],
    financialRatios: [],
    enterpriseValues: [],
    historicalRevenue: [],
    peers: {
      symbol,
      peersList: ["MSFT", "GOOGL"],
    },
    unavailable: [],
    errors: [],
  };
}

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING REPORT GENERATION & DATA INTEGRITY TESTS");
  console.log("=================================================");

  const cases = [
    { name: "Apple Inc.", symbol: "AAPL" },
    { name: "Microsoft Corporation", symbol: "MSFT" },
    { name: "NVIDIA Corporation", symbol: "NVDA" },
    { name: "Reliance Industries Limited", symbol: "RELIANCE.NS" },
  ];

  for (const c of cases) {
    console.log(`\nTesting calculations & structures for: ${c.name} (${c.symbol})`);

    const bundle = createMockFinancialBundle(c.symbol, c.name);

    // Verify chart data building
    const chartData = buildReportChartData(bundle, [{ date: "2026-07-01", close: 185.2 }]);

    if (!chartData.hasData) {
      throw new Error(`Test failed: chart data says 'hasData=false' for ${c.symbol}`);
    }

    console.log("✓ Chart data built successfully");

    // Check EPS
    const hasEps = chartData.epsTrend.length > 1 && chartData.epsTrend[1].eps === 6.16;
    if (!hasEps) {
      throw new Error(`Test failed: epsTrend values incorrect for ${c.symbol}`);
    }
    console.log("✓ EPS trend data correct");

    // Check Margins
    const hasMargins = chartData.profitMargins.length > 1 && Math.abs((chartData.profitMargins[1].profitMargin || 0) - 24.81) < 0.1;
    if (!hasMargins) {
      throw new Error(`Test failed: profit margins calculation incorrect for ${c.symbol}`);
    }
    console.log("✓ Net profit margins correctly calculated");

    // Mock narrative details
    const resolved: ResolvedCompany = {
      input: c.name,
      symbol: c.symbol,
      name: c.name,
      exchange: bundle.profile!.exchange,
      exchangeShortName: bundle.profile!.exchangeShortName,
      currency: "USD",
      confidence: "HIGH",
      candidates: [],
    };

    const validated: ValidatedResearchData = {
      isValid: true,
      canProceed: true,
      issues: [],
      missingData: [],
      dataQuality: "HIGH",
      data: {
        companyInput: c.name,
        resolved,
        financials: bundle,
        news: {
          companyNews: null,
          industryTrends: null,
          marketDevelopments: null,
          macroeconomicNews: null,
          unavailable: [],
          errors: [],
        },
        resolverError: null,
        collectedAt: new Date().toISOString(),
      },
    };

    const context: NormalizedResearchContext = {
      companyInput: c.name,
      companyName: c.name,
      ticker: c.symbol,
      exchange: bundle.profile!.exchangeShortName,
      sector: bundle.profile!.sector,
      industry: bundle.profile!.industry,
      description: bundle.profile!.description,
      currency: bundle.profile!.currency,
      country: bundle.profile!.country,
      missingData: [],
      verifiedMetrics: {
        revenueGrowth: [],
        profitability: [],
        cashFlow: [],
        debt: [],
        liquidity: [],
        valuation: [],
      },
      financialSections: {
        revenueGrowth: { analysis: "", metrics: [], dataAvailable: true },
        profitability: { analysis: "", metrics: [], dataAvailable: true },
        cashFlow: { analysis: "", metrics: [], dataAvailable: true },
        debt: { analysis: "", metrics: [], dataAvailable: true },
        liquidity: { analysis: "", metrics: [], dataAvailable: true },
        valuation: { analysis: "", metrics: [], dataAvailable: true },
      },
      peers: [],
      newsFacts: [],
      newsHeadlines: [],
      industryTrendsSummary: null,
      marketDevelopmentsSummary: null,
      macroeconomicSummary: null,
      sources: [],
    };

    const aiResult: AiAnalysisResult = {
      narrative: {
        executiveSummary: "Mock executive summary narrative.",
        businessOverview: "Mock business overview narrative.",
        financialHealthSummary: "Mock financial summary.",
        revenueGrowthAnalysis: "Mock revenue growth analysis.",
        profitabilityAnalysis: "Mock profitability analysis.",
        cashFlowAnalysis: "Mock cash flow analysis.",
        debtAnalysis: "Mock debt analysis.",
        liquidityAnalysis: "Mock liquidity analysis.",
        valuationAnalysis: "Mock valuation analysis.",
        competitivePosition: "Mock competitive position narrative.",
        industryAnalysis: "Mock industry analysis narrative.",
        swot: {
          strengths: ["Strength 1"],
          weaknesses: ["Weakness 1"],
          opportunities: ["Opportunity 1"],
          threats: ["Threat 1"],
        },
        recentNewsSummary: "Mock news summary.",
        newsSentiment: { score: 0.8, label: "Bullish", reasoning: "Strong positive news" },
        growthOpportunities: ["Growth Opportunity 1"],
        riskFactors: { summary: "Risk summary.", risks: ["Risk 1"] },
        investmentThesis: "Mock investment thesis.",
        finalRecommendation: { verdict: "INVEST", reasoning: "Mock reasoning", keyDrivers: ["Driver 1"] },
        confidenceScore: { score: 90, explanation: "High verification rate", positiveFactors: ["Factor 1"], negativeFactors: ["Factor 2"] },
        investmentHorizon: { horizon: "Long Term", reasoning: "Mock horizon reasoning" },
      },
      model: "gpt-4o",
      processingTimeMs: 120,
    };

    // Verify Assembler
    const report = assembleInvestmentReport(validated, context, aiResult);

    if (report.meta.country !== "US" || report.meta.website !== "https://mockcompany.com") {
      throw new Error(`Test failed: assembler meta country/website incorrect for ${c.symbol}`);
    }
    console.log("✓ Assembler successfully resolved country and website metadata");
    console.log(`✓ VERIFIED: ${c.symbol} structure matches specifications perfectly`);
  }

  console.log("\n=================================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
}

runTests().catch((error) => {
  console.error("Test execution crashed:", error);
  process.exit(1);
});
