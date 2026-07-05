import { PageShell } from "@/components/layout/page-shell";
import { SavedReportsManager } from "@/components/history/saved-reports";

export default function HistoryPage() {
  return (
    <PageShell
      title="Saved Research Reports"
      description="Browse, search, and manage your local cache of verified equity research."
    >
      <SavedReportsManager />
    </PageShell>
  );
}
