"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/auth-provider";
import { showToast } from "@/components/ui/toast";

export default function SignInPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.signIn(email, password);
      showToast("Signed in", "success");
      router.replace("/");
    } catch (err: any) {
      const msg = err?.message || "Sign in failed";
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sign In</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded border px-3 py-2" />
        </label>

        {error ? <div className="text-sm text-destructive">{error}</div> : null}

        <div className="flex justify-end gap-2">
          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</button>
        </div>
      </form>
    </div>
  );
}
