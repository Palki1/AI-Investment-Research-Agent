"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import type { ResearchError } from "@/hooks/use-research";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorPanelProps {
  error: ResearchError;
  onRetry?: () => void;
}

export function ErrorPanel({ error, onRetry }: ErrorPanelProps) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle className="size-4" />
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.message}</p>
        {error.details ? (
          <p className="text-sm opacity-90">{error.details}</p>
        ) : null}
        {error.code === "AMBIGUOUS_MATCH" ? (
          <p className="text-sm">
            Try using the exact ticker symbol (e.g. AAPL) or a more specific company name.
          </p>
        ) : null}
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

export function EmptyDashboard() {
  return (
    <div className="rounded-xl border border-dashed bg-muted/10 p-8 text-center">
      <h2 className="text-lg font-semibold">Ready to analyze</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Search for a public company above to generate a full AI investment research report
        with financial charts, SWOT analysis, news sentiment, and a recommendation.
      </p>
    </div>
  );
}

export function MissingDataBanner({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <Alert>
      <AlertCircle className="size-4" />
      <AlertTitle>Partial data available</AlertTitle>
      <AlertDescription>
        Some data sources were unavailable: {items.join(", ")}. The report uses only verified
        available facts and clearly notes gaps.
      </AlertDescription>
    </Alert>
  );
}
