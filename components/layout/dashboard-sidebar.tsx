"use client";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "financials", label: "Financials" },
  { id: "charts", label: "Charts" },
  { id: "swot", label: "SWOT" },
  { id: "news", label: "News" },
  { id: "recommendation", label: "Recommendation" },
];

export function DashboardSidebar() {
  return (
    <aside
      className="hidden w-52 shrink-0 lg:block"
      aria-label="Report navigation sidebar"
    >
      <div className="sticky top-20 rounded-xl border bg-card p-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Jump to
        </p>
        <nav className="space-y-1">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
