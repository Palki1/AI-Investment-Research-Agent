"use client";

import { Search, Sparkles } from "lucide-react";
import { useCallback, useId, useState } from "react";

import { useCompanySearch, type CompanySearchResult } from "@/hooks/use-company-search";
import { EXAMPLE_COMPANIES } from "@/lib/config/constants";
import { SearchSuggestions } from "@/components/search/search-suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      onChange(result.name);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Company name or ticker
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="company-search-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          placeholder="Search by company name or ticker (e.g. AAPL, Microsoft)"
          className="h-11 pl-9"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={disabled || !value.trim()} className="h-11 gap-2">
          <Sparkles className="size-4" aria-hidden="true" />
          Analyze Company
        </Button>
        <div className="flex flex-wrap gap-2" aria-label="Example companies">
          {EXAMPLE_COMPANIES.slice(0, 4).map((company) => (
            <Button
              key={company}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => {
                onChange(company);
                setTimeout(() => onSubmit(), 50);
              }}
            >
              {company}
            </Button>
          ))}
        </div>
      </div>
    </form>
  );
}
