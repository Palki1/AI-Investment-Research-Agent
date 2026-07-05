import { FileSearch } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <FileSearch className="size-6 text-muted-foreground" />
        </div>
        <CardTitle>No research report yet</CardTitle>
        <CardDescription>
          Enter a company name above to generate a structured investment research
          report with financial analysis, SWOT, news sentiment, and a final
          recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Verified financial metrics from FMP",
            "Recent news and industry trends via Tavily",
            "INVEST · WATCH · PASS recommendation",
          ].map((item) => (
            <div
              key={item}
              className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
