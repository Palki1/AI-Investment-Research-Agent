"use client";

import { BarChart3, Brain, ShieldCheck, Zap, Search } from "lucide-react";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/config/constants";

export function HeroSection() {
  const handleScrollToSearch = () => {
    const input = document.getElementById("company-search-input");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      // do not autofocus here in case user is on mobile
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl p-8" aria-labelledby="hero-heading">
      <div className="relative z-10 max-w-5xl mx-auto">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          AI-Powered · Free Data Sources
        </p>

        <h1 id="hero-heading" className="hero-title mb-4 text-4xl font-black leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl">
          Research any company <span className="text-primary">in seconds</span>
        </h1>

        <p className="mb-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Enter any public or private company name. The AI agent resolves,
          scrapes, and analyzes corporate data to produce an Invest or Pass
          recommendation.
        </p>

        <div className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
              <Search className="size-5" />
            </div>
            <input
              id="company-search-input"
              type="search"
              placeholder="Enter company name (e.g. Nvidia, Tesla, Stripe...)"
              className="w-full rounded-full border py-4 pl-14 pr-6 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleScrollToSearch}
              className="btn-animate rounded-full bg-gradient-to-r from-primary to-[#ff8a4b] px-6 py-3 text-sm font-semibold text-white shadow-md hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl"
            >
              Analyze report
            </button>
            <button
              type="button"
              onClick={handleScrollToSearch}
              className="btn-animate rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:-translate-y-1 hover:bg-muted"
            >
              Open analysis
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Ticker & Financials",
              desc: "Identifies stock tickers via Yahoo Finance and pulls income statements, margins, FCF, and 1-year price charts.",
            },
            {
              num: "02",
              title: "Web Due Diligence",
              desc: "Scrapes DuckDuckGo news with cheerio to evaluate competitor strategies, market share, and regulatory headwinds.",
            },
            {
              num: "03",
              title: "CIO Recommendation",
              desc: "Synthesizes quantitative metrics and sentiment via LLM JSON schemas to produce a detailed Invest/Pass thesis.",
            },
          ].map((c) => (
            <div key={c.num} className="rounded-xl border bg-card p-6">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">{c.num}</span>
                <h3 className="text-base font-semibold">{c.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
    </section>
  );
}
