"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, FolderHeart, Settings, Home, BookmarkPlus, MessageSquareText, LogIn, Sparkles, Search } from "lucide-react";

import { APP_NAME } from "@/lib/config/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";

type ModalType = "signin" | "signup" | "feedback";

type ActionItem = {
  href?: string;
  label: string;
  icon: typeof BookmarkPlus;
  variant: "outline" | "ghost" | "default";
  action: "link" | "modal";
  modal?: ModalType;
};

export function AppHeader() {
  const pathname = usePathname();
  const { openModal, currentUser, signOut } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/history", label: "Saved Reports", icon: FolderHeart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const actionItems: ActionItem[] = [
    { href: "/history", label: "Watchlist", icon: BookmarkPlus, variant: "outline", action: "link" },
    { label: "Feedback", icon: MessageSquareText, variant: "ghost", action: "modal", modal: "feedback" },
  ];

  

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <TrendingUp className="size-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-semibold tracking-tight sm:text-xl">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <nav className="flex flex-1 items-center justify-end gap-1 sm:gap-2" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.95rem] font-semibold transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:-translate-y-0.5 hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isPrimaryAction = item.variant === "default";

              if (item.action === "modal") {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openModal(item.modal ?? null)}
                    className={cn(
                      "btn-animate inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]",
                      isPrimaryAction
                        ? "btn-primary-sm"
                        : item.variant === "outline"
                          ? "border border-border bg-background text-foreground hover:bg-muted"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href ?? "/"}
                  className={cn(
                    "btn-animate inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]",
                    isPrimaryAction
                      ? "btn-primary-sm"
                      : item.variant === "outline"
                        ? "border border-border bg-background text-foreground hover:bg-muted"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' ? (
                  <Link href="/admin" className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold">Admin</Link>
                ) : null}
                <div className="text-sm">{currentUser.name || currentUser.email}</div>
                <button onClick={() => signOut()} className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold">Sign out</button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => openModal("signin")} className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold">Sign in</button>
                <button type="button" onClick={() => openModal("signup")} className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground">Sign up</button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      
    </>
  );
}
