import type { FinancialSection } from "@/lib/types/investment-report";
import { ReportSectionCard } from "@/components/report/report-section-card";

interface FinancialSectionViewProps {
  id?: string;
  title: string;
  section: FinancialSection;
}

export function FinancialSectionView({ id, title, section }: FinancialSectionViewProps) {
  return (
    <ReportSectionCard
      id={id}
      title={title}
      dataAvailable={section.dataAvailable}
      dataNote={section.dataNote}
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{section.analysis}</p>
        {section.metrics.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-3 py-2 font-medium">Metric</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">Period</th>
                  <th className="hidden px-3 py-2 font-medium md:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {section.metrics.map((metric) => (
                  <tr key={`${metric.label}-${metric.period}`} className="border-b last:border-0">
                    <td className="px-3 py-2">{metric.label}</td>
                    <td className="px-3 py-2 font-medium tabular-nums">{metric.value}</td>
                    <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                      {metric.period ?? "—"}
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                      {metric.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No verified metrics available for this section.
          </p>
        )}
      </div>
    </ReportSectionCard>
  );
}
