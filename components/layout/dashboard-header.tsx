"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { APP_NAME } from "@/lib/config/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { href: "#overview", label: "Overview" },
  { href: "#financials", label: "Financials" },
  { href: "#news", label: "News" },
  { href: "#recommendation", label: "Recommendation" },
];

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-sm font-semibold tracking-tight sm:text-base">
                {APP_NAME}
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Research Dashboard
              </Badge>
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Report sections">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
