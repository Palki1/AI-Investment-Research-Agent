import { PageShell } from "@/components/layout/page-shell";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <PageShell
      title="Configuration Settings"
      description="Manage your personal credentials, preferences, and models."
      maxWidth="max-w-3xl"
    >
      <SettingsForm />
    </PageShell>
  );
}
