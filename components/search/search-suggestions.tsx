"use client";

import type { CompanySearchResult } from "@/hooks/use-company-search";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  results: CompanySearchResult[];
  isSearching: boolean;
  query: string;
  onSelect: (result: CompanySearchResult) => void;
  visible: boolean;
}

export function SearchSuggestions({
  results,
  isSearching,
  query,
  onSelect,
  visible,
}: SearchSuggestionsProps) {
  if (!visible || query.trim().length < 2) {
    return null;
  }

  return (
    <div
      className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-lg"
      role="listbox"
      aria-label="Company search suggestions"
    >
      {isSearching ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>
      ) : results.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">
          No companies found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <ul className="max-h-64 overflow-y-auto py-1">
          {results.map((result) => (
            <li key={result.symbol}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                aria-label={`Select ${result.name} (${result.symbol})`}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm",
                  "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                )}
                onClick={() => onSelect(result)}
              >
                <span className="font-medium">{result.name}</span>
                <span className="text-xs text-muted-foreground">
                  {result.symbol} · {result.exchangeShortName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
