"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, BarChart2, ShieldAlert, Newspaper, Users, Zap, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/LoadingScreen";
import { InvestmentDecision } from "@/components/dashboard/InvestmentDecision";
import { ReportContent } from "@/types";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = decodeURIComponent(params.ticker as string);
  
  const [data, setData] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Artificial step progression for demo purposes if it finishes too fast
    const interval = setInterval(() => {
      setStep((s) => (s < 5 ? s + 1 : s));
    }, 1500);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker })
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch research data');
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
        clearInterval(interval);
      }
    };

    fetchData();
    return () => clearInterval(interval);
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] pt-20">
        <LoadingScreen currentStepIndex={step} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-xl font-bold">Error analyzing {ticker}</div>
        <div className="text-[var(--color-muted-foreground)]">{error}</div>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="text-[var(--color-muted-foreground)] hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-xl font-bold">{data.companyOverview.industry} Analysis: <span className="text-[var(--color-primary)]">{ticker}</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* Top Decision Section */}
        <InvestmentDecision data={data} />

        {/* Executive Summary & Company Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center"><Zap className="w-5 h-5 mr-2 text-[var(--color-accent)]" /> Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-wrap">
                {data.summary}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'CEO', value: data.companyOverview.ceo },
                { label: 'Market Cap', value: data.companyOverview.marketCap },
                { label: 'Stock Price', value: data.companyOverview.stockPrice },
                { label: 'P/E Ratio', value: data.companyOverview.peRatio },
                { label: 'Revenue', value: data.companyOverview.revenue },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                  <span className="text-[var(--color-muted-foreground)] text-sm">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* SWOT Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[var(--color-success)]/5 border-[var(--color-success)]/20">
            <CardHeader className="pb-2"><CardTitle className="text-[var(--color-success)] text-lg">Strengths</CardTitle></CardHeader>
            <CardContent><ul className="list-disc pl-4 space-y-1 text-sm text-[var(--color-muted-foreground)]">{data.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
          </Card>
          <Card className="bg-[var(--color-danger)]/5 border-[var(--color-danger)]/20">
            <CardHeader className="pb-2"><CardTitle className="text-[var(--color-danger)] text-lg">Weaknesses</CardTitle></CardHeader>
            <CardContent><ul className="list-disc pl-4 space-y-1 text-sm text-[var(--color-muted-foreground)]">{data.weaknesses.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
          </Card>
          <Card className="bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20">
            <CardHeader className="pb-2"><CardTitle className="text-[var(--color-primary)] text-lg">Opportunities</CardTitle></CardHeader>
            <CardContent><ul className="list-disc pl-4 space-y-1 text-sm text-[var(--color-muted-foreground)]">{data.opportunities.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
          </Card>
          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardHeader className="pb-2"><CardTitle className="text-yellow-500 text-lg">Threats</CardTitle></CardHeader>
            <CardContent><ul className="list-disc pl-4 space-y-1 text-sm text-[var(--color-muted-foreground)]">{data.threats.map((s,i)=><li key={i}>{s}</li>)}</ul></CardContent>
          </Card>
        </div>

        {/* Financials & Risks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> Key Financials</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Revenue Growth', value: data.financial_analysis.revenueGrowth },
                    { label: 'Profit Margin', value: data.financial_analysis.profitMargin },
                    { label: 'Operating Margin', value: data.financial_analysis.operatingMargin },
                    { label: 'ROE', value: data.financial_analysis.roe },
                    { label: 'Debt to Equity', value: data.financial_analysis.debtToEquity },
                    { label: 'Free Cash Flow', value: data.financial_analysis.cashFlow },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <div className="text-xs text-[var(--color-muted-foreground)] mb-1 uppercase tracking-wider">{item.label}</div>
                      <div className="text-xl font-bold">{item.value}</div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldAlert className="w-5 h-5 mr-2 text-[var(--color-danger)]" /> Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {Object.entries(data.risk_analysis).map(([key, risk], i) => (
                 <div key={i} className="flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant={risk.level === 'Low' ? 'success' : risk.level === 'Medium' ? 'outline' : 'danger'}>{risk.level}</Badge>
                    </div>
                    <span className="text-sm text-[var(--color-muted-foreground)]">{risk.description}</span>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Reasoning */}
        <Card className="border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5">
          <CardHeader>
            <CardTitle className="flex items-center"><Zap className="w-5 h-5 mr-2 text-[var(--color-primary)]" /> AI Analyst Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none text-[var(--color-muted-foreground)] leading-relaxed">
              {data.reasoning}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
