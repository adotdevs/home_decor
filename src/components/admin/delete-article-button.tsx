"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteArticleButton({ slug, label = "Delete" }: { slug: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        `Permanently delete article “${slug}”? This cannot be undone. Uploaded images in /uploads are not removed automatically.`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void onDelete()}
      className="cursor-pointer rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/15 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {busy ? "Deleting…" : label}
    </button>
  );
}
