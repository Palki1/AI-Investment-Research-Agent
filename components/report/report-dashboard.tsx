"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Printer, Star, Bookmark, Link as LinkIcon, Globe, MapPin, ArrowLeft } from "lucide-react";

import type { InvestmentReport } from "@/lib/types/investment-report";
import { CompanyProfileCard } from "@/components/dashboard/company-profile-card";
import { RecommendationCard } from "@/components/dashboard/recommendation-card";
import { FinancialSectionView } from "@/components/report/financial-section-view";
import { NewsSection } from "@/components/report/news-section";
import { SwotSection } from "@/components/report/swot-section";
import { ReportSectionCard } from "@/components/report/report-section-card";
import { FinancialCharts } from "@/components/charts/financial-charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportDashboardProps {
  report: InvestmentReport;
  onBack?: () => void;
}

export function ReportDashboard({ report, onBack }: ReportDashboardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check save/bookmark status on mount
    try {
      const savedReports = localStorage.getItem("ai-agent-reports");
      if (savedReports) {
        const parsed = JSON.parse(savedReports) as InvestmentReport[];
        const exists = parsed.some((r) => r.meta.analyzedAt === report.meta.analyzedAt);
        setIsSaved(exists);
      }

      const bookmarks = localStorage.getItem("ai-agent-bookmarks");
      if (bookmarks) {
        const parsed = JSON.parse(bookmarks) as string[];
        setIsBookmarked(parsed.includes(report.meta.analyzedAt));
      }
    } catch (e) {
      console.error(e);
    }
  }, [report.meta.analyzedAt]);

  const handleSaveReport = () => {
    try {
      const savedReports = localStorage.getItem("ai-agent-reports");
      let parsed: InvestmentReport[] = [];
      if (savedReports) {
        parsed = JSON.parse(savedReports);
      }

      const exists = parsed.some((r) => r.meta.analyzedAt === report.meta.analyzedAt);
      if (!exists) {
        parsed.unshift(report);
        localStorage.setItem("ai-agent-reports", JSON.stringify(parsed));
        setIsSaved(true);
      } else {
        // Remove it (toggle off)
        const updated = parsed.filter((r) => r.meta.analyzedAt !== report.meta.analyzedAt);
        localStorage.setItem("ai-agent-reports", JSON.stringify(updated));
        setIsSaved(false);

        // Also remove bookmark if saved is deleted
        if (isBookmarked) {
          const bookmarks = localStorage.getItem("ai-agent-bookmarks");
          if (bookmarks) {
            const parsedBook = JSON.parse(bookmarks) as string[];
            const updatedBook = parsedBook.filter((b) => b !== report.meta.analyzedAt);
            localStorage.setItem("ai-agent-bookmarks", JSON.stringify(updatedBook));
            setIsBookmarked(false);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = () => {
    try {
      // Must be saved first
      if (!isSaved) {
        handleSaveReport();
      }

      const bookmarks = localStorage.getItem("ai-agent-bookmarks");
      let parsed: string[] = [];
      if (bookmarks) {
        parsed = JSON.parse(bookmarks);
      }

      if (parsed.includes(report.meta.analyzedAt)) {
        parsed = parsed.filter((b) => b !== report.meta.analyzedAt);
        setIsBookmarked(false);
      } else {
        parsed.push(report.meta.analyzedAt);
        setIsBookmarked(true);
      }
      localStorage.setItem("ai-agent-bookmarks", JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    let md = `# Equity Research Report: ${report.meta.companyName} (${report.meta.ticker || "N/A"})\n\n`;
    md += `**Date:** ${new Date(report.meta.analyzedAt).toLocaleDateString()}\n`;
    md += `**Recommendation:** ${report.finalRecommendation.verdict}\n`;
    md += `**Confidence Score:** ${report.confidenceScore.score}/100\n`;
    md += `**Investment Horizon:** ${report.investmentHorizon.horizon}\n\n`;
    md += `## Executive Summary\n${report.executiveSummary}\n\n`;
    md += `## Business Overview\n${report.businessOverview}\n\n`;
    md += `## Investment Thesis\n${report.investmentThesis}\n\n`;
    md += `## SWOT Analysis\n`;
    md += `### Strengths\n${report.swot.strengths.map((s) => `- ${s}`).join("\n")}\n\n`;
    md += `### Weaknesses\n${report.swot.weaknesses.map((w) => `- ${w}`).join("\n")}\n\n`;
    md += `### Opportunities\n${report.swot.opportunities.map((o) => `- ${o}`).join("\n")}\n\n`;
    md += `### Threats\n${report.swot.threats.map((t) => `- ${t}`).join("\n")}\n\n`;
    md += `## Financial Health Analysis\n${report.financialHealth.summary}\n\n`;
    md += `### Revenue Growth\n${report.revenueGrowthAnalysis.analysis}\n`;
    md += report.revenueGrowthAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `### Profitability\n${report.profitabilityAnalysis.analysis}\n`;
    md += report.profitabilityAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `### Cash Flow Analysis\n${report.cashFlowAnalysis.analysis}\n`;
    md += report.cashFlowAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `### Debt Analysis\n${report.debtAnalysis.analysis}\n`;
    md += report.debtAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `### Liquidity Analysis\n${report.liquidityAnalysis.analysis}\n`;
    md += report.liquidityAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `### Valuation Analysis\n${report.valuationAnalysis.analysis}\n`;
    md += report.valuationAnalysis.metrics.map((m) => `- **${m.label}:** ${m.value} (${m.period || "N/A"})`).join("\n") + "\n\n";
    md += `## Competitive Position\n${report.competitivePosition}\n\n`;
    md += `## Industry Analysis\n${report.industryAnalysis}\n\n`;
    md += `## Growth Opportunities\n${report.growthOpportunities.map((g) => `- ${g}`).join("\n")}\n\n`;
    md += `## Risk Factors\n${report.riskFactors.summary}\n`;
    md += report.riskFactors.risks.map((r) => `- ${r}`).join("\n") + "\n\n";
    md += `## Sources\n`;
    md += report.sources.map((s) => `- [${s.title}](${s.url}) (${s.type})`).join("\n") + "\n";

    downloadFile(md, `${report.meta.companyName.toLowerCase().replace(/\s+/g, "-")}-report.md`, "text/markdown");
  };

  const exportAsPlainText = () => {
    let txt = `EQUITY RESEARCH REPORT: ${report.meta.companyName} (${report.meta.ticker || "N/A"})\n`;
    txt += `========================================================================\n`;
    txt += `Date: ${new Date(report.meta.analyzedAt).toLocaleDateString()}\n`;
    txt += `Recommendation: ${report.finalRecommendation.verdict}\n`;
    txt += `Confidence Score: ${report.confidenceScore.score}/100\n`;
    txt += `Investment Horizon: ${report.investmentHorizon.horizon}\n`;
    txt += `========================================================================\n\n`;
    txt += `1. EXECUTIVE SUMMARY\n------------------------------------------------------------------------\n${report.executiveSummary}\n\n`;
    txt += `2. BUSINESS OVERVIEW\n------------------------------------------------------------------------\n${report.businessOverview}\n\n`;
    txt += `3. INVESTMENT THESIS\n------------------------------------------------------------------------\n${report.investmentThesis}\n\n`;
    txt += `4. SWOT ANALYSIS\n------------------------------------------------------------------------\n`;
    txt += `STRENGTHS:\n${report.swot.strengths.map((s) => `  * ${s}`).join("\n")}\n`;
    txt += `WEAKNESSES:\n${report.swot.weaknesses.map((w) => `  * ${w}`).join("\n")}\n`;
    txt += `OPPORTUNITIES:\n${report.swot.opportunities.map((o) => `  * ${o}`).join("\n")}\n`;
    txt += `THREATS:\n${report.swot.threats.map((t) => `  * ${t}`).join("\n")}\n\n`;
    txt += `5. FINANCIAL HEALTH ANALYSIS\n------------------------------------------------------------------------\n${report.financialHealth.summary}\n\n`;
    txt += `REVENUE GROWTH:\n${report.revenueGrowthAnalysis.analysis}\n`;
    txt += report.revenueGrowthAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `PROFITABILITY:\n${report.profitabilityAnalysis.analysis}\n`;
    txt += report.profitabilityAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `CASH FLOW ANALYSIS:\n${report.cashFlowAnalysis.analysis}\n`;
    txt += report.cashFlowAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `DEBT ANALYSIS:\n${report.debtAnalysis.analysis}\n`;
    txt += report.debtAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `LIQUIDITY ANALYSIS:\n${report.liquidityAnalysis.analysis}\n`;
    txt += report.liquidityAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `VALUATION ANALYSIS:\n${report.valuationAnalysis.analysis}\n`;
    txt += report.valuationAnalysis.metrics.map((m) => `  * ${m.label}: ${m.value}`).join("\n") + "\n\n";
    txt += `6. COMPETITIVE POSITION\n------------------------------------------------------------------------\n${report.competitivePosition}\n\n`;
    txt += `7. INDUSTRY ANALYSIS\n------------------------------------------------------------------------\n${report.industryAnalysis}\n\n`;
    txt += `8. GROWTH OPPORTUNITIES\n------------------------------------------------------------------------\n${report.growthOpportunities.map((g) => `  * ${g}`).join("\n")}\n\n`;
    txt += `9. RISK FACTORS\n------------------------------------------------------------------------\n${report.riskFactors.summary}\n`;
    txt += report.riskFactors.risks.map((r) => `  * ${r}`).join("\n") + "\n\n";
    txt += `10. SOURCES\n------------------------------------------------------------------------\n`;
    txt += report.sources.map((s) => `  * ${s.title}: ${s.url}`).join("\n") + "\n";

    downloadFile(txt, `${report.meta.companyName.toLowerCase().replace(/\s+/g, "-")}-report.txt`, "text/plain");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hidden on Print */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 print:hidden">
        {onBack ? (
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="size-4" /> Back
          </Button>
        ) : (
          <div />
        )}

        {/* Exporters / Saves */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={isSaved ? "default" : "outline"} size="sm" onClick={handleSaveReport} className="gap-1.5">
            <Bookmark className={`size-4 ${isSaved ? "fill-primary-foreground" : ""}`} />
            {isSaved ? "Saved to History" : "Save Report"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleToggleBookmark} className="gap-1.5">
            <Star className={`size-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>

          <Button variant="outline" size="sm" onClick={exportAsMarkdown} className="gap-1.5">
            <Download className="size-4" /> MD
          </Button>

          <Button variant="outline" size="sm" onClick={exportAsPlainText} className="gap-1.5">
            <FileText className="size-4" /> Text
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="size-4" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid gap-6 lg:grid-cols-3 print:block print:space-y-6">
        {/* Left Side: Detailed Narrative cards */}
        <div className="lg:col-span-2 space-y-6 print:block print:w-full print:space-y-6">
          
          {/* Executive Summary Card */}
          <ReportSectionCard id="executive-summary" title="Executive Summary">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.executiveSummary}
            </p>
          </ReportSectionCard>

          {/* Business Overview Card */}
          <ReportSectionCard id="business-overview" title="Business Overview">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.businessOverview}
            </p>
          </ReportSectionCard>

          {/* Recharts Charts Layout */}
          <div className="print:hidden">
            <FinancialCharts chartData={report.chartData} currency={report.meta.currency} />
          </div>

          {/* Detailed Financial Health Section */}
          <Card id="financials">
            <CardHeader>
              <CardTitle className="text-lg">Financial Health Analysis</CardTitle>
              <p className="text-xs text-muted-foreground">{report.financialHealth.summary}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FinancialSectionView title="Revenue Growth" section={report.revenueGrowthAnalysis} />
              <FinancialSectionView title="Profitability Analysis" section={report.profitabilityAnalysis} />
              <FinancialSectionView title="Cash Flow Analysis" section={report.cashFlowAnalysis} />
              <FinancialSectionView title="Debt Analysis" section={report.debtAnalysis} />
              <FinancialSectionView title="Liquidity Analysis" section={report.liquidityAnalysis} />
              <FinancialSectionView title="Valuation Analysis" section={report.valuationAnalysis} />
            </CardContent>
          </Card>

          {/* SWOT Analysis quadrant view */}
          <SwotSection swot={report.swot} />

          {/* Competitive Position Card */}
          <ReportSectionCard id="competitive-position" title="Competitive Position">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.competitivePosition}
            </p>
          </ReportSectionCard>

          {/* Industry Analysis Card */}
          <ReportSectionCard id="industry-analysis" title="Industry Analysis">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.industryAnalysis}
            </p>
          </ReportSectionCard>

          {/* Growth Opportunities */}
          <ReportSectionCard id="growth-opportunities" title="Growth Opportunities">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {report.growthOpportunities.map((g) => (
                <li key={g} className="flex gap-2 items-start">
                  <span className="text-primary font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </ReportSectionCard>

          {/* Risk Factors */}
          <ReportSectionCard id="risk-factors" title="Risk Factors">
            <p className="mb-3 text-sm font-semibold leading-relaxed">
              {report.riskFactors.summary}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {report.riskFactors.risks.map((r) => (
                <li key={r} className="flex gap-2 items-start">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </ReportSectionCard>

          {/* Investment Thesis */}
          <ReportSectionCard id="investment-thesis" title="Investment Thesis">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {report.investmentThesis}
            </p>
          </ReportSectionCard>

          {/* News Feed */}
          <NewsSection report={report} />

          {/* Sources / References List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1.5">
                <LinkIcon className="size-4" /> Reference Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs">
                {report.sources.map((s) => (
                  <li key={s.url} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0 last:pb-0">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium line-clamp-1 flex-1"
                    >
                      {s.title}
                    </a>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {s.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Sticky Overview & Verdict panel */}
        <div className="space-y-6 print:block print:w-full print:space-y-6">
          <div className="lg:sticky lg:top-20 space-y-6 print:relative print:top-0">
            {/* Overview */}
            <CompanyProfileCard report={report} />

            {/* Extra details on company profile for country/website */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Corporate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {report.meta.country ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="font-medium">Country:</span>
                    <span className="text-muted-foreground">{report.meta.country}</span>
                  </div>
                ) : null}
                {report.meta.website ? (
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="font-medium">Website:</span>
                    <a
                      href={report.meta.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline line-clamp-1"
                    >
                      {report.meta.website.replace(/^https?:\/\//i, "")}
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Verdict */}
            <RecommendationCard report={report} />
          </div>
        </div>
      </div>
    </div>
  );
}
