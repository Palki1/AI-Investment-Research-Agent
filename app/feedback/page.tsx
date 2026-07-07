"use client";

import { useEffect, useState } from "react";
import { listUsers } from "@/lib/auth/user-store";

export default function FeedbackPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/feedback");
        const json = await res.json();
        if (res.ok && json?.ok) setItems(json.items || []);
      } catch (err) {
        // fallback: empty
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Feedback</h1>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No feedback yet.</div>
      ) : (
        <div className="grid gap-3">
          {items.map((it, idx) => (
            <div key={idx} className="rounded border p-3">
              <div className="font-medium">{it.userName || it.user}</div>
              <div className="text-xs text-muted-foreground">{it.user}</div>
              <div className="mt-2 text-sm">{it.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
