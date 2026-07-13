"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name?: string;
  email: string;
  role?: string;
};

type Feedback = {
  id: string;
  text: string;
  user?: {
    name?: string;
    email: string;
  };
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch("/api/users");
        const j1 = await r1.json();

        if (r1.ok && j1.ok) {
          setUsers(j1.users || []);
        }
      } catch {}

      try {
        const r2 = await fetch("/api/feedback");
        const j2 = await r2.json();

        if (r2.ok && j2.ok) {
          setFeedback(j2.items || []);
        }
      } catch {}
    })();
  }, []);

  const promote = async (id: string) => {
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: id }),
        credentials: "include",
      });

      const j = await res.json();

      if (res.ok && j.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === id ? { ...user, role: "admin" } : user
          )
        );
      } else {
        alert(j.error || "failed");
      }
    } catch {
      alert("failed");
    }
  };

  const del = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const j = await res.json();

      if (res.ok && j.ok) {
        setFeedback((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(j.error || "failed");
      }
    } catch {
      alert("failed");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium">Users</h2>

        <div className="grid gap-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">
                  {user.name || user.email}
                </div>

                <div className="text-xs text-muted-foreground">
                  {user.email}
                  {user.role ? ` • ${user.role}` : ""}
                </div>
              </div>

              {user.role !== "admin" ? (
                <button
                  onClick={() => promote(user.id)}
                  className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  Promote
                </button>
              ) : (
                <div className="text-sm font-medium">Admin</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Feedback</h2>

        <div className="grid gap-2">
          {feedback.map((item) => (
            <div key={item.id} className="rounded border p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">
                    {item.user?.name || item.user?.email}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {item.user?.email}
                  </div>
                </div>

                <button
                  onClick={() => del(item.id)}
                  className="rounded bg-destructive px-2 py-1 text-sm text-destructive-foreground"
                >
                  Delete
                </button>
              </div>

              <div className="mt-2 text-sm">{item.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}