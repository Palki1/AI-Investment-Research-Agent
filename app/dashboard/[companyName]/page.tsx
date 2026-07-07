"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { ResearchWorkspace } from "@/components/research/research-workspace";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  params: {
    companyName: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const companyName = useMemo(
    () => decodeURIComponent(params.companyName),
    [params.companyName],
  );

  return (
    <PageShell
      title={`Technology Analysis: ${companyName}`}
      description={`Detailed AI-driven company research for ${companyName}.`}
      maxWidth="max-w-6xl"
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:border-primary/60 hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
          <p className="text-sm text-muted-foreground">
            Research reports are generated using verified financial data, latest news, and AI analysis.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </div>
      <ResearchWorkspace initialCompanyName={companyName} hideHero />
    </PageShell>
  );
}
