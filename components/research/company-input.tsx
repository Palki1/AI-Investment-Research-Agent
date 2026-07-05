import { Search } from "lucide-react";

import { EXAMPLE_COMPANIES } from "@/lib/config/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CompanyInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: CompanyInputProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start research</CardTitle>
        <CardDescription>
          Enter a public company name. The agent will gather verified financial
          data and news before producing an INVEST, WATCH, or PASS recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="e.g. Apple, Tesla, Infosys"
              className="pl-9"
              disabled={disabled}
              aria-label="Company name"
            />
          </div>
          <Button type="submit" disabled={disabled || !value.trim()}>
            Analyze Company
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_COMPANIES.map((company) => (
            <Button
              key={company}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(company)}
            >
              {company}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
