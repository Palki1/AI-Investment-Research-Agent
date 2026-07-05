"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, FolderHeart, Settings, Home } from "lucide-react";

import { APP_NAME } from "@/lib/config/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/history", label: "Saved Reports", icon: FolderHeart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrendingUp className="size-5" aria-hidden="true" />
            </div>
            <span className="text-base font-bold tracking-tight sm:text-lg">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
