import "./load-env";

import { isDataLayerEnvConfigured } from "@/lib/env/data-layer";
import { collectCompanyResearchData } from "@/lib/tools/research-data-collector";
import { companyResolver } from "@/lib/tools/company-resolver";
import { fmpClient } from "@/lib/tools/fmp-client";
import { tavilySearchClient } from "@/lib/tools/tavily-search";

interface VerificationCase {
  label: string;
  companyName: string;
  expectedSymbol?: string;
}

const CASES: VerificationCase[] = [
  {
    label: "Apple",
    companyName: "Apple",
    expectedSymbol: "AAPL",
  },
  {
    label: "Reliance Industries",
    companyName: "Reliance Industries",
    expectedSymbol: "RELIANCE.NS",
  },
];

function printDivider(title: string) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(title);
  console.log("=".repeat(72));
}

function printResult(label: string, value: unknown) {
  console.log(`${label}: ${value}`);
}

async function verifyResolver(testCase: VerificationCase) {
  printDivider(`Resolver · ${testCase.label}`);

  const result = await companyResolver.resolveCompanyName(testCase.companyName);

  if (result.error) {
    printResult("Status", "FAILED");
    console.log(JSON.stringify(result.error.toJSON(), null, 2));
    return false;
  }

  printResult("Status", "OK");
  printResult("Input", result.resolved?.input);
  printResult("Symbol", result.resolved?.symbol);
  printResult("Name", result.resolved?.name);
  printResult("Exchange", result.resolved?.exchangeShortName);
  printResult("Confidence", result.resolved?.confidence);

  if (
    testCase.expectedSymbol &&
    result.resolved?.symbol.toUpperCase() !== testCase.expectedSymbol.toUpperCase()
  ) {
    printResult(
      "Warning",
      `Expected symbol ${testCase.expectedSymbol}, got ${result.resolved?.symbol}`,
    );
  }

  return true;
}

async function verifyFinancials(symbol: string, label: string) {
  printDivider(`Financials · ${label} (${symbol})`);

  const bundle = await fmpClient.getCompanyFinancialBundle(symbol);

  printResult("Profile", bundle.profile ? "available" : "unavailable");
  printResult("Income statements", bundle.incomeStatements.length);
  printResult("Balance sheets", bundle.balanceSheets.length);
  printResult("Cash flow statements", bundle.cashFlowStatements.length);
  printResult("Key metrics", bundle.keyMetrics.length);
  printResult("Financial ratios", bundle.financialRatios.length);
  printResult("Enterprise values", bundle.enterpriseValues.length);
  printResult("Historical revenue rows", bundle.historicalRevenue.length);
  printResult("Peers", bundle.peers?.peersList?.length ?? 0);

  if (bundle.unavailable.length > 0) {
    printResult("Unavailable sections", bundle.unavailable.join(", "));
  }

  if (bundle.errors.length > 0) {
    console.log("Errors:");
    for (const error of bundle.errors) {
      console.log(`- ${error.code}: ${error.message}`);
    }
  }

  if (bundle.profile) {
    printResult("Company", bundle.profile.companyName);
    printResult("Sector", bundle.profile.sector);
    printResult("Market cap", bundle.profile.mktCap);
  }

  if (bundle.historicalRevenue.length > 0) {
    const latest = bundle.historicalRevenue[bundle.historicalRevenue.length - 1];
    printResult(
      "Latest revenue",
      `${latest.calendarYear}: ${latest.revenue}${latest.revenueGrowth != null ? ` (${latest.revenueGrowth.toFixed(2)}% YoY)` : ""}`,
    );
  }

  return bundle.profile !== null;
}

async function verifyNews(companyName: string, sector: string | undefined, label: string) {
  printDivider(`News · ${label}`);

  const bundle = await tavilySearchClient.getCompanyNewsBundle(companyName, sector);

  printResult("Company news", bundle.companyNews?.results.length ?? 0);
  printResult("Industry trends", bundle.industryTrends?.results.length ?? 0);
  printResult("Market developments", bundle.marketDevelopments?.results.length ?? 0);
  printResult("Macroeconomic news", bundle.macroeconomicNews?.results.length ?? 0);

  if (bundle.unavailable.length > 0) {
    printResult("Unavailable topics", bundle.unavailable.join(", "));
  }

  if (bundle.errors.length > 0) {
    console.log("Errors:");
    for (const error of bundle.errors) {
      console.log(`- ${error.code}: ${error.message}`);
    }
  }

  const firstHeadline = bundle.companyNews?.results[0]?.title;
  if (firstHeadline) {
    printResult("Sample headline", firstHeadline);
  }

  return bundle.unavailable.length < 4;
}

async function verifyEndToEnd(testCase: VerificationCase) {
  printDivider(`End-to-end · ${testCase.label}`);

  const data = await collectCompanyResearchData(testCase.companyName);

  if (data.resolverError || !data.resolved) {
    printResult("Status", "FAILED");
    console.log(JSON.stringify(data.resolverError?.toJSON(), null, 2));
    return false;
  }

  printResult("Status", "OK");
  printResult("Resolved symbol", data.resolved.symbol);
  printResult("Financial gaps", data.financials?.unavailable.join(", ") || "none");
  printResult("News gaps", data.news?.unavailable.join(", ") || "none");
  printResult("Collected at", data.collectedAt);

  return true;
}

async function main() {
  printDivider("AI Investment Agent · Phase 3 Data Layer Verification");

  if (!isDataLayerEnvConfigured()) {
    console.error(
      "Missing API keys. Copy .env.example to .env.local and set FMP_API_KEY and TAVILY_API_KEY.",
    );
    process.exit(1);
  }

  let failures = 0;

  for (const testCase of CASES) {
    const resolverOk = await verifyResolver(testCase);
    if (!resolverOk) {
      failures += 1;
      continue;
    }

    const resolved = await companyResolver.resolveCompanyName(testCase.companyName);
    const symbol = resolved.resolved?.symbol ?? testCase.expectedSymbol;

    if (!symbol) {
      failures += 1;
      continue;
    }

    const financialsOk = await verifyFinancials(symbol, testCase.label);
    if (!financialsOk) {
      failures += 1;
    }

    const profile = (await fmpClient.getCompanyFinancialBundle(symbol)).profile;
    const newsOk = await verifyNews(
      resolved.resolved?.name ?? testCase.companyName,
      profile?.sector,
      testCase.label,
    );

    if (!newsOk) {
      failures += 1;
    }

    const endToEndOk = await verifyEndToEnd(testCase);
    if (!endToEndOk) {
      failures += 1;
    }
  }

  printDivider("Summary");

  if (failures > 0) {
    printResult("Result", `Completed with ${failures} failed check(s)`);
    process.exit(1);
  }

  printResult("Result", "All verification checks passed");
}

main().catch((error) => {
  console.error("Verification script crashed:", error);
  process.exit(1);
});
