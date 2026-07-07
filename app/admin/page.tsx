"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch('/api/users');
        const j1 = await r1.json();
        if (r1.ok && j1.ok) setUsers(j1.users || []);
      } catch {}
      try {
        const r2 = await fetch('/api/feedback');
        const j2 = await r2.json();
        if (r2.ok && j2.ok) setFeedback(j2.items || []);
      } catch {}
    })();
  }, []);

  const promote = async (id: string) => {
    try {
      const res = await fetch('/api/admin/promote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id }), credentials: 'include' });
      const j = await res.json();
      if (res.ok && j.ok) {
        setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: 'admin' } : x)));
      } else alert(j.error || 'failed');
    } catch (err) { alert('failed'); }
  };

  const del = async (id: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE', credentials: 'include' });
      const j = await res.json();
      if (res.ok && j.ok) setFeedback((f) => f.filter((x) => x.id !== id));
      else alert(j.error || 'failed');
    } catch (err) { alert('failed'); }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Admin</h1>
      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Users</h2>
        <div className="grid gap-2">
          {users.map((u) => (
            <div key={u.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email} {u.role ? `• ${u.role}` : ''}</div>
              </div>
              {u.role !== 'admin' ? <button onClick={() => promote(u.id)} className="rounded bg-primary px-3 py-1 text-sm text-primary-foreground">Promote</button> : <div className="text-sm font-medium">Admin</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Feedback</h2>
        <div className="grid gap-2">
          {feedback.map((f) => (
            <div key={f.id} className="rounded border p-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{f.user?.name || f.user?.email}</div>
                  <div className="text-xs text-muted-foreground">{f.user?.email}</div>
                </div>
                <button onClick={() => del(f.id)} className="rounded bg-destructive px-2 py-1 text-sm text-destructive-foreground">Delete</button>
              </div>
              <div className="mt-2 text-sm">{f.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
