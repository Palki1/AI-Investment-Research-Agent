import type { ReactNode } from "react";

import { DashboardFooter } from "@/components/layout/dashboard-footer";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

interface DashboardShellProps {
  children: ReactNode;
  sidebar?: boolean;
}

export function DashboardShell({ children, sidebar = true }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6">
        {sidebar ? <DashboardSidebar /> : null}
        <main className="min-w-0 flex-1" id="main-content">
          {children}
        </main>
      </div>
      <DashboardFooter />
    </div>
  );
}
