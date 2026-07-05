import { BarChart3, Brain, ShieldCheck, Zap } from "lucide-react";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/config/constants";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-6 sm:p-8"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 max-w-3xl space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          AI-Powered Equity Research
        </p>
        <h1 id="hero-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          {APP_NAME}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {APP_DESCRIPTION} Get institutional-style reports with verified financials,
          news sentiment, and INVEST / WATCH / PASS recommendations.
        </p>

        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, label: "Verified financial data" },
            { icon: Brain, label: "GPT-4o analysis" },
            { icon: BarChart3, label: "Interactive charts" },
            { icon: Zap, label: "Full report in minutes" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-lg border bg-background/70 px-3 py-2 text-sm"
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
    </section>
  );
}
