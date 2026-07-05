import { ExternalLink } from "lucide-react";

import type { InvestmentReport } from "@/lib/types/investment-report";
import { getSentimentStyles } from "@/lib/utils/recommendation";
import { Badge } from "@/components/ui/badge";
import { ReportSectionCard } from "@/components/report/report-section-card";

interface NewsSectionProps {
  report: InvestmentReport;
}

export function NewsSection({ report }: NewsSectionProps) {
  const { recentNewsSummary, newsSentiment } = report;
  const sentimentClass = getSentimentStyles(newsSentiment.score);

  return (
    <div id="news" className="space-y-6">
      <ReportSectionCard
        title="Recent News Summary"
        dataAvailable={recentNewsSummary.dataAvailable}
        dataNote={recentNewsSummary.dataNote}
      >
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {recentNewsSummary.summary}
        </p>

        {!recentNewsSummary.dataAvailable || recentNewsSummary.headlines.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No news articles found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentNewsSummary.headlines.map((headline) => (
              <article
                key={headline.url}
                className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-muted/20"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className={sentimentClass}>{newsSentiment.label}</Badge>
                  {headline.publishedAt ? (
                    <span className="text-xs text-muted-foreground">
                      {headline.publishedAt}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-sm font-medium leading-snug">{headline.title}</h3>
                {headline.snippet ? (
                  <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                    {headline.snippet}
                  </p>
                ) : null}
                <a
                  href={headline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Read article
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        )}
      </ReportSectionCard>

      <ReportSectionCard title="News Sentiment">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={sentimentClass}>{newsSentiment.label}</Badge>
          <span className="text-sm tabular-nums text-muted-foreground">
            Score: {newsSentiment.score.toFixed(2)} (-1 to +1)
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {newsSentiment.reasoning}
        </p>
      </ReportSectionCard>
    </div>
  );
}
