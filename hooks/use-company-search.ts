"use client";

import { useEffect, useState } from "react";

export interface CompanySearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export function useCompanySearch(query: string) {
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        let headers: Record<string, string> = {};
        try {
          const stored = localStorage.getItem("ai-agent-settings");
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.fmpApiKey) {
              headers["x-fmp-api-key"] = settings.fmpApiKey;
            }
          }
        } catch {}

        const response = await fetch(
          `/api/company/search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            headers,
          },
        );

        const payload = await response.json();

        if (!response.ok) {
          setResults([]);
          setError(payload.error ?? "Search failed");
          return;
        }

        setResults(payload.results ?? []);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }
        setResults([]);
        setError("Unable to fetch suggestions");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return { results, isSearching, error };
}
