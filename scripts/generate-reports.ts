import "./load-env";

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { isServerEnvConfigured } from "@/lib/env";
import { generateInvestmentReport } from "@/lib/agent/research-agent";
import { logger } from "@/lib/logger";

interface ReportCase {
  label: string;
  companyName: string;
  expectedSymbol?: string;
}

const CASES: ReportCase[] = [
  { label: "Apple", companyName: "Apple", expectedSymbol: "AAPL" },
  { label: "Microsoft", companyName: "Microsoft", expectedSymbol: "MSFT" },
  {
    label: "Reliance Industries",
    companyName: "Reliance Industries",
    expectedSymbol: "RELIANCE.NS",
  },
];

async function main() {
  if (!isServerEnvConfigured()) {
    console.error(
      "Missing API keys. Copy .env.example to .env.local and set OPENAI_API_KEY, FMP_API_KEY, and TAVILY_API_KEY.",
    );
    process.exit(1);
  }

  const outputDir = resolve(process.cwd(), "reports");
  mkdirSync(outputDir, { recursive: true });

  console.log("\nAI Investment Research Engine — Report Generation\n");

  let failures = 0;

  for (const testCase of CASES) {
    console.log(`\n${"=".repeat(72)}`);
    console.log(`Generating report: ${testCase.label}`);
    console.log("=".repeat(72));

    try {
      const startedAt = Date.now();
      const result = await generateInvestmentReport(testCase.companyName);
      const { report } = result;
      const elapsed = Date.now() - startedAt;

      if (
        testCase.expectedSymbol &&
        report.meta.ticker?.toUpperCase() !== testCase.expectedSymbol.toUpperCase()
      ) {
        console.warn(
          `Warning: expected ${testCase.expectedSymbol}, got ${report.meta.ticker}`,
        );
      }

      const filename = `${testCase.label.toLowerCase().replace(/\s+/g, "-")}-report.json`;
      const filepath = resolve(outputDir, filename);
      writeFileSync(filepath, JSON.stringify(report, null, 2), "utf8");

      console.log(`Ticker:          ${report.meta.ticker}`);
      console.log(`Recommendation:  ${report.finalRecommendation.verdict}`);
      console.log(`Confidence:      ${report.confidenceScore.score}/100`);
      console.log(`Horizon:         ${report.investmentHorizon.horizon}`);
      console.log(`Data quality:    ${report.meta.dataQuality}`);
      console.log(`Missing data:    ${report.meta.missingData.join(", ") || "none"}`);
      console.log(`Processing time: ${elapsed}ms`);
      console.log(`Tokens used:     ${report.meta.tokenUsage?.totalTokens ?? "n/a"}`);
      console.log(`Saved to:        ${filepath}`);
      console.log(`\nExecutive Summary:\n${report.executiveSummary.slice(0, 400)}...`);
      console.log(
        `\nRecommendation Reasoning:\n${report.finalRecommendation.reasoning.slice(0, 400)}...`,
      );
    } catch (error) {
      failures += 1;
      logger.error("generate-report", "Report generation failed", {
        company: testCase.companyName,
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`FAILED: ${testCase.label}`, error);
    }
  }

  console.log(`\n${"=".repeat(72)}`);
  if (failures > 0) {
    console.log(`Completed with ${failures} failure(s).`);
    process.exit(1);
  }

  console.log("All reports generated successfully.");
  console.log(`Output directory: ${outputDir}`);
}

main().catch((error) => {
  console.error("Script crashed:", error);
  process.exit(1);
});
