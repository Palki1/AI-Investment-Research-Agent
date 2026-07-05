import type { CompanyResearchData } from "@/lib/types/data-layer";
import type { DataQuality } from "@/lib/types/investment-report";

export interface ValidationIssue {
  field: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidatedResearchData {
  data: CompanyResearchData;
  isValid: boolean;
  canProceed: boolean;
  issues: ValidationIssue[];
  missingData: string[];
  dataQuality: DataQuality;
}

function hasMinimumFinancialData(data: CompanyResearchData): boolean {
  const financials = data.financials;
  if (!financials?.profile) {
    return false;
  }

  const hasAnyStatements =
    financials.incomeStatements.length > 0 ||
    financials.balanceSheets.length > 0 ||
    financials.cashFlowStatements.length > 0;

  return hasAnyStatements;
}

function hasMinimumNewsData(data: CompanyResearchData): boolean {
  if (!data.news) {
    return false;
  }

  return Boolean(
    data.news.companyNews?.results.length ||
      data.news.industryTrends?.results.length ||
      data.news.marketDevelopments?.results.length,
  );
}

/**
 * Step 1: Validate collected financial and news data before AI analysis.
 */
export function validateResearchData(
  data: CompanyResearchData,
): ValidatedResearchData {
  const issues: ValidationIssue[] = [];
  const missingData: string[] = [];

  if (data.resolverError || !data.resolved) {
    issues.push({
      field: "resolver",
      severity: "error",
      message:
        data.resolverError?.message ??
        "Company could not be resolved to a ticker symbol",
    });

    return {
      data,
      isValid: false,
      canProceed: false,
      issues,
      missingData: ["company_resolution"],
      dataQuality: "LOW",
    };
  }

  if (!data.financials) {
    missingData.push("financials");
    issues.push({
      field: "financials",
      severity: "error",
      message: "Financial data bundle is unavailable",
    });
  } else {
    if (!data.financials.profile) {
      missingData.push("company_profile");
      issues.push({
        field: "profile",
        severity: "warning",
        message: "Company profile unavailable from FMP",
      });
    }

    for (const section of data.financials.unavailable) {
      missingData.push(`financial_${section}`);
      issues.push({
        field: section,
        severity: "warning",
        message: `Financial section "${section}" unavailable from FMP`,
      });
    }

    if (!hasMinimumFinancialData(data)) {
      issues.push({
        field: "financials",
        severity: "warning",
        message:
          "Insufficient financial statements for comprehensive analysis — proceeding with available facts only",
      });
    }
  }

  if (!data.news) {
    missingData.push("news");
    issues.push({
      field: "news",
      severity: "warning",
      message: "News bundle is unavailable",
    });
  } else {
    for (const topic of data.news.unavailable) {
      missingData.push(`news_${topic}`);
      issues.push({
        field: topic,
        severity: "warning",
        message: `News topic "${topic}" unavailable from Tavily`,
      });
    }

    if (!hasMinimumNewsData(data)) {
      issues.push({
        field: "news",
        severity: "warning",
        message: "No news results available — sentiment analysis will be limited",
      });
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  let dataQuality: DataQuality = "HIGH";
  if (errorCount > 0 || missingData.length >= 5) {
    dataQuality = "LOW";
  } else if (warningCount >= 2 || missingData.length >= 2) {
    dataQuality = "MEDIUM";
  }

  const canProceed = Boolean(data.resolved && (data.financials || data.news));

  return {
    data,
    isValid: errorCount === 0,
    canProceed,
    issues,
    missingData,
    dataQuality,
  };
}
