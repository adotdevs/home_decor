"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetentionRunButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onRun() {
    if (
      !window.confirm(
        "Run a retention pass now? This deletes analytics/audit rows older than the configured windows (batched).",
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/owner/retention-run", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { error?: string; deleted?: Record<string, number> } | null;
      if (!res.ok) {
        setMessage(data?.error || `Failed (${res.status})`);
        return;
      }
      if (data?.deleted) {
        const n = Object.values(data.deleted).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
        setMessage(`Removed ~${n.toLocaleString()} documents (see activity log).`);
      }
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onRun}
        disabled={busy}
        className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
      >
        {busy ? "Running…" : "Run retention now"}
      </button>
      {message ? <p className="max-w-xs text-right text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
