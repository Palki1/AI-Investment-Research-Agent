import { DISCLAIMER } from "@/lib/config/constants";

export function DashboardFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
