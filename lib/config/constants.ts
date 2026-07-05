export const APP_NAME = "AI Investment Research Agent";

export const APP_DESCRIPTION =
  "Autonomous investment research powered by verified financial data, news, and AI analysis.";

export const EXAMPLE_COMPANIES = [
  "Apple",
  "Microsoft",
  "NVIDIA",
  "Tesla",
  "Infosys",
  "Reliance Industries",
] as const;

export const RECOMMENDATION_LABELS = {
  INVEST: "Invest",
  WATCH: "Watch",
  PASS: "Pass",
} as const;

export const LOADING_STEPS = [
  "Resolving company identity...",
  "Fetching financial data...",
  "Fetching latest news...",
  "Analyzing industry trends...",
  "Running AI analysis...",
  "Preparing investment report...",
] as const;

export const DISCLAIMER =
  "This tool provides AI-generated research for educational purposes only. It is not financial advice. Always verify data independently before making investment decisions.";
