"use client";

import { useCallback, useRef, useState } from "react";

import { LOADING_STEPS } from "@/lib/config/constants";
import type { InvestmentReport } from "@/lib/types/investment-report";

export type ResearchUiStatus = "idle" | "loading" | "success" | "error";

export interface ResearchError {
  title: string;
  message: string;
  code?: string;
  details?: string;
}

interface ResearchState {
  status: ResearchUiStatus;
  companyName: string;
  progress: number;
  activeStepIndex: number;
  report: InvestmentReport | null;
  error: ResearchError | null;
}

const initialState: ResearchState = {
  status: "idle",
  companyName: "",
  progress: 0,
  activeStepIndex: 0,
  report: null,
  error: null,
};

export function useResearch() {
  const [state, setState] = useState<ResearchState>(initialState);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState(initialState);
  }, [clearTimer]);

  const runResearch = useCallback(
    async (companyName: string) => {
      const query = companyName.trim();
      if (!query) return;

      clearTimer();
      setState({
        status: "loading",
        companyName: query,
        progress: 8,
        activeStepIndex: 0,
        report: null,
        error: null,
      });

      let stepIndex = 0;
      timerRef.current = window.setInterval(() => {
        stepIndex = Math.min(stepIndex + 1, LOADING_STEPS.length - 1);
        setState((current) =>
          current.status === "loading"
            ? {
                ...current,
                activeStepIndex: stepIndex,
                progress: Math.min(
                  92,
                  Math.round(((stepIndex + 1) / LOADING_STEPS.length) * 100),
                ),
              }
            : current,
        );
      }, 2800);

      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        try {
          const stored = localStorage.getItem("ai-agent-settings");
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.openaiApiKey) headers["x-openai-api-key"] = settings.openaiApiKey;
            if (settings.fmpApiKey) headers["x-fmp-api-key"] = settings.fmpApiKey;
            if (settings.tavilyApiKey) headers["x-tavily-api-key"] = settings.tavilyApiKey;
            if (settings.openaiModel) headers["x-openai-model"] = settings.openaiModel;
          }
        } catch {}

        const response = await fetch("/api/research", {
          method: "POST",
          headers,
          body: JSON.stringify({ companyName: query }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setState({
            status: "error",
            companyName: query,
            progress: 100,
            activeStepIndex: LOADING_STEPS.length - 1,
            report: null,
            error: {
              title:
                payload.code === "NOT_FOUND" || payload.code === "AMBIGUOUS_MATCH"
                  ? "Invalid or ambiguous company"
                  : payload.code === "ENV_NOT_CONFIGURED"
                    ? "Server not configured"
                    : payload.code === "RATE_LIMIT"
                      ? "Rate limit exceeded"
                      : "AI analysis failed",
              message: payload.error ?? "Unable to generate report",
              code: payload.code,
              details:
                typeof payload.details === "string"
                  ? payload.details
                  : payload.details
                    ? JSON.stringify(payload.details)
                    : undefined,
            },
          });
          return;
        }

        setState({
          status: "success",
          companyName: query,
          progress: 100,
          activeStepIndex: LOADING_STEPS.length - 1,
          report: payload.report as InvestmentReport,
          error: null,
        });
      } catch {
        setState({
          status: "error",
          companyName: query,
          progress: 100,
          activeStepIndex: LOADING_STEPS.length - 1,
          report: null,
          error: {
            title: "Network error",
            message: "Unable to reach the research API. Check your connection and try again.",
          },
        });
      } finally {
        clearTimer();
      }
    },
    [clearTimer],
  );

  return {
    ...state,
    runResearch,
    reset,
    isLoading: state.status === "loading",
  };
}
