"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { useAuth } from "@/components/layout/auth-provider";
import ProfilePanel from "@/components/settings/profile-panel";

export default function SettingsPage() {
  const auth = useAuth();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const otpParam = params.get("otp");
      if (otpParam === "1" || otpParam === "true") {
        // force open OTP modal when ?otp=1 is present
        auth.openModal("otp");
        return;
      }
    } catch {}

    if (!auth.isAuthenticated) {
      // open OTP modal when opening settings so user can enter their email
      auth.openModal("otp");
    }
  }, [auth]);

  return (
    <PageShell
      title="Configuration Settings"
      description="Manage your personal credentials, preferences, and models."
      maxWidth="max-w-3xl"
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <SettingsForm />
        </div>
        <div className="sm:col-span-1">
          <ProfilePanel />
        </div>
      </div>
    </PageShell>
  );
}
