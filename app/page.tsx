import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { ResearchWorkspace } from "@/components/research/research-workspace";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <ResearchWorkspace />
      </main>
      <AppFooter />
    </div>
  );
}
