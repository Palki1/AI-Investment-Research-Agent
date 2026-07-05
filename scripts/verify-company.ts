import "./load-env";

import { isDataLayerEnvConfigured } from "@/lib/env/data-layer";
import { collectCompanyResearchData } from "@/lib/tools/research-data-collector";

async function main() {
  const companyName = process.argv[2];
  const expectedSymbol = process.argv[3];

  if (!companyName) {
    console.error("Usage: tsx scripts/verify-company.ts <company-name> [expected-symbol]");
    process.exit(1);
  }

  if (!isDataLayerEnvConfigured()) {
    console.error(
      "Missing API keys. Copy .env.example to .env.local and set FMP_API_KEY and TAVILY_API_KEY.",
    );
    process.exit(1);
  }

  console.log(`\nVerifying data layer for: ${companyName}\n`);

  const data = await collectCompanyResearchData(companyName);

  if (data.resolverError || !data.resolved) {
    console.error("Resolver failed:");
    console.error(JSON.stringify(data.resolverError?.toJSON(), null, 2));
    process.exit(1);
  }

  console.log("Resolved company:");
  console.log(JSON.stringify(data.resolved, null, 2));

  if (
    expectedSymbol &&
    data.resolved.symbol.toUpperCase() !== expectedSymbol.toUpperCase()
  ) {
    console.warn(
      `Warning: expected symbol ${expectedSymbol}, got ${data.resolved.symbol}`,
    );
  }

  console.log("\nFinancial data summary:");
  console.log(
    JSON.stringify(
      {
        profileAvailable: Boolean(data.financials?.profile),
        incomeStatements: data.financials?.incomeStatements.length ?? 0,
        balanceSheets: data.financials?.balanceSheets.length ?? 0,
        cashFlowStatements: data.financials?.cashFlowStatements.length ?? 0,
        keyMetrics: data.financials?.keyMetrics.length ?? 0,
        financialRatios: data.financials?.financialRatios.length ?? 0,
        enterpriseValues: data.financials?.enterpriseValues.length ?? 0,
        historicalRevenue: data.financials?.historicalRevenue.length ?? 0,
        peers: data.financials?.peers?.peersList?.length ?? 0,
        unavailable: data.financials?.unavailable ?? [],
      },
      null,
      2,
    ),
  );

  console.log("\nNews data summary:");
  console.log(
    JSON.stringify(
      {
        companyNews: data.news?.companyNews?.results.length ?? 0,
        industryTrends: data.news?.industryTrends?.results.length ?? 0,
        marketDevelopments: data.news?.marketDevelopments?.results.length ?? 0,
        macroeconomicNews: data.news?.macroeconomicNews?.results.length ?? 0,
        unavailable: data.news?.unavailable ?? [],
      },
      null,
      2,
    ),
  );

  console.log("\nVerification completed successfully.\n");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
