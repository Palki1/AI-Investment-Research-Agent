"use client";

import { useEffect, useState } from "react";
import { useResearch } from "@/hooks/use-research";
import { CompanySearch } from "@/components/search/company-search";
import { EmptyDashboard, ErrorPanel } from "@/components/dashboard/error-panel";
import { AnalysisLoading } from "@/components/dashboard/analysis-loading";
import { ReportDashboard } from "@/components/report/report-dashboard";
import { HeroSection } from "@/components/dashboard/hero-section";
import type { InvestmentReport } from "@/lib/types/investment-report";

export function ResearchWorkspace() {
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [activeReport, setActiveReport] = useState<InvestmentReport | null>(null);

  const {
    runResearch,
    isLoading,
    progress,
    activeStepIndex,
    report,
    error,
    status,
    reset,
  } = useResearch();

  // Load active report from local storage (triggered when clicking a saved report in history)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ai-agent-active-report");
      if (stored) {
        setActiveReport(JSON.parse(stored));
        localStorage.removeItem("ai-agent-active-report");
      }
    } catch (e) {
      console.error("Failed to load active report", e);
    }
  }, []);

  const handleSearchSubmit = () => {
    const query = companyNameInput.trim();
    if (query) {
      setActiveReport(null); // Clear any currently viewed history report
      runResearch(query);
    }
  };

  const handleBackToSearch = () => {
    setActiveReport(null);
    reset();
  };

  // If a report is currently loaded (either generated or loaded from history)
  const currentReport = activeReport || report;

  return (
    <div className="space-y-6">
      {status !== "loading" && !currentReport ? (
        <>
          <HeroSection />
          <div className="max-w-xl">
            <CompanySearch
              value={companyNameInput}
              onChange={setCompanyNameInput}
              onSubmit={handleSearchSubmit}
              disabled={isLoading}
            />
          </div>
          {status === "error" && error ? (
            <ErrorPanel error={error} onRetry={handleSearchSubmit} />
          ) : (
            <EmptyDashboard />
          )}
        </>
      ) : null}

      {status === "loading" ? (
        <AnalysisLoading
          companyName={companyNameInput}
          progress={progress}
          activeStepIndex={activeStepIndex}
        />
      ) : null}

      {currentReport && status !== "loading" ? (
        <ReportDashboard report={currentReport} onBack={handleBackToSearch} />
      ) : null}
    </div>
  );
}
