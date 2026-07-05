import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { SavedReportsManager } from "@/components/history/saved-reports";

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Saved Research Reports</h1>
          <p className="text-sm text-muted-foreground">
            Browse, search, and manage your local cache of verified equity research.
          </p>
        </div>
        <SavedReportsManager />
      </main>
      <AppFooter />
    </div>
  );
}
