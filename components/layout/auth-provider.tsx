"use client";

import React, { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth/user-store";
import { createUser, getUserByEmail, getUserById, addActivity } from "@/lib/auth/user-store";

type ModalType = "signin" | "signup" | "feedback" | "otp";

type AuthContextType = {
  isAuthenticated: boolean;
  currentUser?: User | null;
  openModal: (m: ModalType | null) => void;
  requestOtp: (email?: string) => void;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, name?: string, password?: string) => Promise<User | void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("ai:isAuthenticated");
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const id = localStorage.getItem("ai:current_user");
      if (id) return getUserById(id) || null;
    } catch {}
    return null;
  });

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({ email: "", code: "", name: "", password: "" });

  // attempt to restore server session on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (res.ok && json?.ok && json.user) {
          setIsAuthenticated(true);
          persistAuth(true);
          setCurrentUser(json.user);
          try { localStorage.setItem('ai:current_user', json.user.id); } catch {}
        }
      } catch (err) {}
    })();
  }, []);

  const openModal = (m: ModalType | null) => setActiveModal(m);

  const persistAuth = (val: boolean) => {
    try {
      if (val) localStorage.setItem("ai:isAuthenticated", "1");
      else localStorage.removeItem("ai:isAuthenticated");
    } catch {}
  };

  const signIn = async (email: string, password?: string) => {
    // Prefer server-side signin when available
    try {
      const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
      const json = await res.json();
      if (res.ok && json?.ok) {
        const user = json.user;
        setIsAuthenticated(true);
        persistAuth(true);
        setCurrentUser(user);
        try {
          localStorage.setItem("ai:current_user", user.id);
        } catch {}
        // log activity server-side if available
        try {
          await fetch("/api/users/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, type: "signin" }) });
        } catch {}
        setActiveModal(null);
        return;
      }
    } catch (err) {
      // fall through to local fallback
    }

    // Local fallback
    try {
      const user = getUserByEmail(email);
      if (!user) throw new Error("User not found");
      if (user.password && password !== user.password) throw new Error("Invalid credentials");
      setIsAuthenticated(true);
      persistAuth(true);
      setCurrentUser(user);
      try {
        localStorage.setItem("ai:current_user", user.id);
      } catch {}
      addActivity(user.id, "signin");
      setActiveModal(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("signIn failed", err);
      throw err;
    }
  };

  const signOut = () => {
    // call server to clear session
    (async () => {
      try {
        await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
      } catch {}
    })();

    setIsAuthenticated(false);
    persistAuth(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("ai:current_user");
    } catch {}
  };

  const signUp = async (email: string, name?: string, password?: string) => {
    // Try server-side register first
    try {
      const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
          credentials: "include",
        });
      const json = await res.json();
      if (res.ok && json?.ok) {
        const user = json.user;
        setIsAuthenticated(true);
        persistAuth(true);
        setCurrentUser(user);
        try {
          localStorage.setItem("ai:current_user", user.id);
        } catch {}
        try {
          await fetch("/api/users/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, type: "signup" }) });
        } catch {}
        setActiveModal(null);
        return user;
      }
    } catch (err) {
      // fall back to local store
    }

    try {
      const user = createUser({ email, name, password });
      setIsAuthenticated(true);
      persistAuth(true);
      setCurrentUser(user);
      try {
        localStorage.setItem("ai:current_user", user.id);
      } catch {}
      addActivity(user.id, "signup");
      setActiveModal(null);
      return user;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("signUp failed", err);
      throw err;
    }
  };

  const requestOtp = async (email?: string) => {
    // If no email is provided yet, just open the OTP modal so the user can enter it
    if (!email && !formData.email) {
      setActiveModal("otp");
      return;
    }

    try {
      const payload = { email: email || formData.email };
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.warn("Failed to request OTP", json);
      }
      if (email) setFormData((c) => ({ ...c, email }));
      if (json?.devCode) {
        // eslint-disable-next-line no-console
        console.info("[DEV] OTP from server:", json.devCode);
      }
      setActiveModal("otp");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const verifyOtp = async (code?: string) => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });
      const json = await res.json();
      if (res.ok && json?.ok) {
        setIsAuthenticated(true);
        persistAuth(true);
        // mark current user by email if exists
        try {
          const user = getUserByEmail(formData.email);
          if (user) {
            setCurrentUser(user);
            localStorage.setItem("ai:current_user", user.id);
            addActivity(user.id, "otp_verify");
          }
        } catch {}
        setActiveModal(null);
        return true;
      }
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, openModal, requestOtp, signIn, signUp, signOut }}>
      {children}

      {activeModal ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">{activeModal === "signup" ? "Join" : activeModal === "feedback" ? "Support" : activeModal === "otp" ? "OTP Sign-in" : "Account"}</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{activeModal === "signup" ? "Create your account" : activeModal === "feedback" ? "Share feedback" : activeModal === "otp" ? "Enter the code we sent" : "Welcome back"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{activeModal === "signup" ? "Get instant access to AI-powered company research." : activeModal === "feedback" ? "Help us improve the research experience." : activeModal === "otp" ? "We sent a one-time code. Check the console in development." : "Sign in to save reports and build your watchlist."}</p>
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
              onSubmit={async (event) => {
                  event.preventDefault();
                  if (activeModal === "otp") {
                    const ok = await verifyOtp(formData.code);
                    if (!ok) {
                      // keep modal open
                    }
                  } else if (activeModal === "signup") {
                    setIsAuthenticated(true);
                    persistAuth(true);
                    setActiveModal(null);
                  } else {
                    setIsAuthenticated(true);
                    persistAuth(true);
                    setActiveModal(null);
                  }
                  setFormData({ email: "", code: "", name: "", password: "" });
                }}
            >
              {activeModal === "otp" ? (
                <>
                  <label className="block text-sm font-medium text-foreground">
                    <span className="mb-1.5 block">Email</span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>

                  <label className="block text-sm font-medium text-foreground">
                    <span className="mb-1.5 block">One-time code</span>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData((c) => ({ ...c, code: e.target.value }))}
                      placeholder="123456"
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-foreground">
                    <span className="mb-1.5 block">Email</span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((c) => ({ ...c, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>

                  {activeModal === "signup" ? (
                    <label className="block text-sm font-medium text-foreground">
                      <span className="mb-1.5 block">Full name</span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
                        placeholder="Alex Morgan"
                        className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>
                  ) : null}

                  {activeModal === "feedback" ? (
                    <label className="block text-sm font-medium text-foreground">
                      <span className="mb-1.5 block">Your feedback</span>
                      <textarea
                        rows={4}
                        value={formData.code}
                        onChange={(e) => setFormData((c) => ({ ...c, code: e.target.value }))}
                        placeholder="Tell us what you want to see next"
                        className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </label>
                  ) : null}
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                {activeModal === "otp" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => requestOtp(formData.email)}
                      className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Send code
                    </button>
                    <button
                      type="submit"
                      className="rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      Verify
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    {activeModal === "signup" ? "Create account" : activeModal === "feedback" ? "Send feedback" : "Continue"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
