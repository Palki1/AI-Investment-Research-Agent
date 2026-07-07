"use client";

import { EXAMPLE_COMPANIES } from "@/lib/config/constants";
import { Search } from "lucide-react";

interface HeroSectionProps {
  value: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  onExampleClick: (companyName: string) => void;
}

export function HeroSection({
  value,
  onInputChange,
  onSubmit,
  disabled = false,
  onExampleClick,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/10" aria-labelledby="hero-heading">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Powered by LangGraph & GPT-4
        </div>

        <h1 id="hero-heading" className="hero-title mb-4 text-4xl font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
          AI Investment Research for <span className="text-primary">leading companies</span>
        </h1>

        <p className="mb-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Research any public company using verified financial data, news, and AI analysis to generate a detailed investment recommendation.
        </p>

        <form onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }} className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
              <Search className="size-5" aria-hidden="true" />
            </div>
            <input
              type="search"
              value={value}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Enter company name (e.g. Apple, Tesla, Reliance...)"
              className="w-full rounded-full border border-border bg-background px-14 py-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={disabled}
              autoComplete="off"
              aria-label="Company name or ticker"
            />
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Trending searches:</span>
            {EXAMPLE_COMPANIES.map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => onExampleClick(company)}
                className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/70 hover:bg-primary/10"
              >
                {company}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Ticker + Financials",
              desc: "Identifies public tickers and extracts income statements, cash flow, and valuation metrics.",
            },
            {
              num: "02",
              title: "News & Industry",
              desc: "Scans the latest headlines, competitor activity, and macro trends to assess momentum and risk.",
            },
            {
              num: "03",
              title: "Investment Thesis",
              desc: "Synthesizes quantitative data and narrative reasoning into an Invest, Watch, or Pass decision.",
            },
          ].map((card) => (
            <div key={card.num} className="rounded-3xl border border-border bg-background/80 p-6 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl font-bold text-primary">{card.num}</span>
                <h3 className="text-base font-semibold">{card.title}</h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
    </section>
  );
}
