"use client";

import { AlertTriangle, Clock, Target, TrendingUp } from "lucide-react";

import type { InvestmentReport } from "@/lib/types/investment-report";
import { getRecommendationStyles } from "@/lib/utils/recommendation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RecommendationCardProps {
  report: InvestmentReport;
}

export function RecommendationCard({ report }: RecommendationCardProps) {
  const { finalRecommendation, confidenceScore, investmentHorizon, riskFactors } =
    report;
  const styles = getRecommendationStyles(finalRecommendation.verdict);

  return (
    <Card
      id="recommendation"
      className={`ring-2 ${styles.ring} border-2`}
    >
      <CardHeader>
        <CardDescription>Final Recommendation</CardDescription>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle
            className={`text-3xl font-bold tracking-tight sm:text-4xl ${styles.accent}`}
          >
            {finalRecommendation.verdict}
          </CardTitle>
          <Badge className={`border text-base ${styles.badge}`}>
            {confidenceScore.score}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="size-4" aria-hidden="true" />
              Confidence Score
            </span>
            <span className="font-medium tabular-nums">{confidenceScore.score}/100</span>
          </div>
          <Progress value={confidenceScore.score} aria-label="Confidence score" />
          <p className="text-sm text-muted-foreground">{confidenceScore.explanation}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="size-4" aria-hidden="true" />
              Investment Horizon: {investmentHorizon.horizon}
            </p>
            <p className="text-sm text-muted-foreground">{investmentHorizon.reasoning}</p>
          </div>
          <div className="space-y-2 rounded-lg border p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <TrendingUp className="size-4" aria-hidden="true" />
              Key Reasons
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {finalRecommendation.keyDrivers.map((driver) => (
                <li key={driver}>{driver}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{finalRecommendation.reasoning}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Confidence Boosters
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {confidenceScore.positiveFactors.map((factor) => (
                <li key={factor}>+ {factor}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-3" aria-hidden="true" />
              Major Risks
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {riskFactors.risks.slice(0, 4).map((risk) => (
                <li key={risk}>− {risk}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
