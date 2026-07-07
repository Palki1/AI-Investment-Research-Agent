"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/layout/auth-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    try {
      const path = window.location.pathname;
      // allow unauthenticated access to auth pages and public users listing
      if (path.startsWith("/auth") || path === "/users") return;
      if (!auth.isAuthenticated) {
        window.location.href = "/auth/signin";
      }
    } catch (err) {
      // ignore
    }
  }, [auth]);

  return <>{children}</>;
}

export default AuthGate;
