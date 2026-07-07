"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listUsers } from "@/lib/auth/user-store";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users");
        const json = await res.json();
        if (res.ok && json?.ok) setUsers(json.users || []);
      } catch (err) {
        setUsers(listUsers());
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>
      <div className="mb-4">
        <Link href="/auth/signup" className="rounded bg-primary px-3 py-2 text-primary-foreground">Register</Link>
      </div>
      <div className="grid gap-3">
        {users.length === 0 ? (
          <div className="text-sm text-muted-foreground">No users registered yet.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="rounded border p-3">
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
