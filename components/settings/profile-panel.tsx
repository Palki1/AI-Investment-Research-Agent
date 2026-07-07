"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/layout/auth-provider";
import { getUserById, updateUser, addFeedback } from "@/lib/auth/user-store";

export function ProfilePanel() {
  const auth = useAuth();
  const user = auth.currentUser || null;
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [feedback, setFeedback] = useState("");
  const [activities, setActivities] = useState<any[]>(user?.activities || []);

  useEffect(() => {
    if (auth.currentUser) {
      const u = getUserById(auth.currentUser.id);
      setName(u?.name || "");
      setEmail(u?.email || "");
      setActivities(u?.activities || []);
    }
  }, [auth.currentUser]);

  const save = () => {
    if (!auth.currentUser) return;
    updateUser(auth.currentUser.id, { name, email });
    showToast("Profile saved", "success");
  };

  const submitFeedback = () => {
    if (!auth.currentUser) return;
    if (!feedback.trim()) return;
    // try server-side first
    (async () => {
      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: auth.currentUser?.id, text: feedback.trim() }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "failed");
      } catch (err) {
        // fallback to local
        addFeedback(auth.currentUser!.id, feedback.trim());
      }
    })();
    setFeedback("");
    const u = getUserById(auth.currentUser.id);
    setActivities(u?.activities || []);
    showToast("Feedback submitted", "success");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold">Profile</h3>
        {user ? (
          <div className="mt-3 space-y-2">
            <label className="block text-sm">Name</label>
            <input className="w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
            <label className="block text-sm">Email</label>
            <input className="w-full rounded border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex justify-end">
              <button onClick={save} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">Save</button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No user signed in.</div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold">Activity</h3>
        <div className="mt-2 space-y-2 text-sm">
          {activities && activities.length > 0 ? (
            activities.slice().reverse().map((a: any) => (
              <div key={a.id} className="rounded border p-2">
                <div className="font-medium">{a.type}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.ts).toLocaleString()}</div>
                {a.meta ? <pre className="mt-2 text-xs">{JSON.stringify(a.meta, null, 2)}</pre> : null}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No recent activity.</div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-lg font-semibold">Feedback</h3>
        <textarea className="w-full rounded border px-3 py-2" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <div className="flex justify-end mt-2">
          <button onClick={submitFeedback} className="rounded bg-primary px-3 py-2 text-sm text-primary-foreground">Send feedback</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
