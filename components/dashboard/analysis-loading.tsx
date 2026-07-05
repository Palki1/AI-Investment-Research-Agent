"use client";

import { Loader2 } from "lucide-react";

import { LOADING_STEPS } from "@/lib/config/constants";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalysisLoadingProps {
  companyName: string;
  progress: number;
  activeStepIndex: number;
}

export function AnalysisLoading({
  companyName,
  progress,
  activeStepIndex,
}: AnalysisLoadingProps) {
  return (
    <Card aria-live="polite" aria-busy="true">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          Analyzing {companyName}
        </CardTitle>
        <CardDescription>
          Our AI agent is gathering verified data and preparing your investment report.
          This typically takes 30–90 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} aria-label="Analysis progress" />
        </div>

        <ol className="space-y-2" aria-label="Analysis steps">
          {LOADING_STEPS.map((step, index) => {
            const isComplete = index < activeStepIndex;
            const isActive = index === activeStepIndex;

            return (
              <li
                key={step}
                className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${
                    isComplete
                      ? "bg-emerald-500"
                      : isActive
                        ? "animate-pulse bg-primary"
                        : "bg-muted-foreground/30"
                  }`}
                  aria-hidden="true"
                />
                <span className={isActive ? "font-medium" : "text-muted-foreground"}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
