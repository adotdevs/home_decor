"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export function AnalyticsResetButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    const ok = window.confirm(
      "Delete all analytics data?\n\nThis removes every event, session, legacy analytics points, and all logged search queries. It cannot be undone.",
    );
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch("/api/admin/analytics/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearSearchQueries: true }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        window.alert(data?.error || `Reset failed (${res.status})`);
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      window.alert("Network error while resetting.");
    } finally {
      setBusy(false);
    }
  }

  const loading = busy || pending;

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:border-destructive hover:bg-destructive/15 disabled:pointer-events-none disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4 shrink-0" />
      {loading ? "Resetting…" : "Reset all stats"}
    </button>
  );
}
