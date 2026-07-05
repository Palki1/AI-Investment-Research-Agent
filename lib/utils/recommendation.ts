import type { RecommendationVerdict } from "@/lib/types/investment-report";

export function getRecommendationStyles(verdict: RecommendationVerdict) {
  switch (verdict) {
    case "INVEST":
      return {
        badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        ring: "ring-emerald-500/30",
        accent: "text-emerald-600 dark:text-emerald-400",
      };
    case "WATCH":
      return {
        badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
        ring: "ring-amber-500/30",
        accent: "text-amber-600 dark:text-amber-400",
      };
    case "PASS":
      return {
        badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
        ring: "ring-rose-500/30",
        accent: "text-rose-600 dark:text-rose-400",
      };
  }
}

export function getSentimentStyles(score: number) {
  if (score >= 0.25) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  if (score <= -0.25) {
    return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }

  return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
}

export function formatApiError(
  error: unknown,
  fallback = "Something went wrong",
): { title: string; message: string; code?: string } {
  if (error && typeof error === "object" && "error" in error) {
    const payload = error as { error: string; code?: string; details?: unknown };
    return {
      title: payload.code === "NOT_FOUND" ? "Company not found" : "Analysis failed",
      message: payload.error,
      code: payload.code,
    };
  }

  if (error instanceof Error) {
    return { title: "Analysis failed", message: error.message };
  }

  return { title: "Analysis failed", message: fallback };
}
