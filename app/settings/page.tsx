import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Configuration Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal credentials, preferences, and models.
          </p>
        </div>
        <SettingsForm />
      </main>
      <AppFooter />
    </div>
  );
}
