import type { SWOT } from "@/lib/types/investment-report";
import { ReportSectionCard } from "@/components/report/report-section-card";

interface SwotSectionProps {
  swot: SWOT;
}

const QUADRANTS = [
  { key: "strengths" as const, title: "Strengths", color: "text-emerald-600 dark:text-emerald-400" },
  { key: "weaknesses" as const, title: "Weaknesses", color: "text-rose-600 dark:text-rose-400" },
  { key: "opportunities" as const, title: "Opportunities", color: "text-sky-600 dark:text-sky-400" },
  { key: "threats" as const, title: "Threats", color: "text-amber-600 dark:text-amber-400" },
];

export function SwotSection({ swot }: SwotSectionProps) {
  return (
    <ReportSectionCard id="swot" title="SWOT Analysis">
      <div className="grid gap-4 sm:grid-cols-2">
        {QUADRANTS.map(({ key, title, color }) => (
          <div key={key} className="rounded-lg border bg-muted/10 p-4">
            <h3 className={`mb-2 text-sm font-semibold ${color}`}>{title}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {swot[key].length > 0 ? (
                swot[key].map((item) => <li key={item}>• {item}</li>)
              ) : (
                <li className="italic">Data unavailable</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </ReportSectionCard>
  );
}
