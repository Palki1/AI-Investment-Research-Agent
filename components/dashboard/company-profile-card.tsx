"use client";

import Image from "next/image";

import type { InvestmentReport } from "@/lib/types/investment-report";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyProfileCardProps {
  report: InvestmentReport;
}

export function CompanyProfileCard({ report }: CompanyProfileCardProps) {
  const { meta } = report;

  return (
    <Card id="overview">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {meta.logoUrl ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-background">
            <Image
              src={meta.logoUrl}
              alt={`${meta.companyName} logo`}
              fill
              className="object-contain p-1.5"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted text-lg font-bold"
            aria-hidden="true"
          >
            {meta.companyName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-xl sm:text-2xl">{meta.companyName}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            {meta.ticker ? (
              <Badge variant="outline">{meta.ticker}</Badge>
            ) : null}
            {meta.exchange ? (
              <Badge variant="secondary">{meta.exchange}</Badge>
            ) : null}
            <Badge variant="secondary">Data: {meta.dataQuality}</Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Sector", value: meta.sector },
            { label: "Industry", value: meta.industry },
            { label: "Market Cap", value: meta.marketCap },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/20 px-3 py-2">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium">
                {item.value ?? "Data unavailable"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
