"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { TrendingUp, FolderHeart, Settings, Home, BookmarkPlus, MessageSquareText, LogIn, Sparkles, Search, X } from "lucide-react";

import { APP_NAME } from "@/lib/config/constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

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
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/history", label: "Saved Reports", icon: FolderHeart },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const actionItems: ActionItem[] = [
    { href: "/history", label: "Watchlist", icon: BookmarkPlus, variant: "outline", action: "link" },
    { label: "Feedback", icon: MessageSquareText, variant: "ghost", action: "modal", modal: "feedback" },
    { label: "Sign in", icon: LogIn, variant: "ghost", action: "modal", modal: "signin" },
    { href: "/#company-search-input", label: "Analyze report", icon: Search, variant: "default", action: "link" },
    { label: "Sign up", icon: Sparkles, variant: "default", action: "modal", modal: "signup" },
  ];

  const modalConfig = {
    signin: {
      title: "Welcome back",
      subtitle: "Sign in to save reports and build your watchlist.",
      fields: [
        { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { key: "message", label: "Password", type: "password", placeholder: "••••••••" },
      ],
    },
    signup: {
      title: "Create your account",
      subtitle: "Get instant access to AI-powered company research.",
      fields: [
        { key: "name", label: "Full name", type: "text", placeholder: "Alex Morgan" },
        { key: "email", label: "Email", type: "email", placeholder: "alex@example.com" },
        { key: "message", label: "Why are you here?", type: "text", placeholder: "I want to track market opportunities" },
      ],
    },
    feedback: {
      title: "Share feedback",
      subtitle: "Help us improve the research experience.",
      fields: [
        { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
        { key: "message", label: "Your feedback", type: "textarea", placeholder: "Tell us what you want to see next" },
      ],
    },
  };

  const modalMeta = activeModal ? modalConfig[activeModal] : null;

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
                    onClick={() => setActiveModal(item.modal ?? null)}
                    className={cn(
                      "btn-animate inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]",
                      isPrimaryAction
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      {modalMeta ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{activeModal === "signup" ? "Join" : activeModal === "feedback" ? "Support" : "Account"}</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{modalMeta.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{modalMeta.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                setActiveModal(null);
                setFormData({ name: "", email: "", message: "" });
              }}
            >
              {modalMeta.fields.map((field) => (
                <label key={field.key} className="block text-sm font-medium text-foreground">
                  <span className="mb-1.5 block">{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      rows={4}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </label>
              ))}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  {activeModal === "signup" ? "Create account" : activeModal === "feedback" ? "Send feedback" : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
