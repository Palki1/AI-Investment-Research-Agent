"use client";

import { Search } from "lucide-react";
import { useCallback, useId, useState } from "react";

import { useCompanySearch, type CompanySearchResult } from "@/hooks/use-company-search";
import { SearchSuggestions } from "@/components/search/search-suggestions";

interface CompanySearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CompanySearch({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: CompanySearchProps) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);
  const { results, isSearching } = useCompanySearch(value);

  const handleSelect = useCallback(
    (result: CompanySearchResult) => {
      const normalizedName = result.name?.trim() || result.symbol;
      onChange(normalizedName);
      setFocused(false);
    },
    [onChange],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFocused(false);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor={inputId} className="sr-only">
            Company name or ticker
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
            <Search className="size-5" />
          </div>
          <input
            id="company-search-input"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder="Enter company name (e.g. Nvidia, Tesla, Stripe...)"
            className="w-full rounded-full border py-4 pl-14 pr-6 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={disabled}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="company-suggestions"
          />
          <SearchSuggestions
            results={results}
            isSearching={isSearching}
            query={value}
            onSelect={handleSelect}
            visible={focused}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="btn-animate btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze
        </button>
      </div>
    </form>
  );
}
