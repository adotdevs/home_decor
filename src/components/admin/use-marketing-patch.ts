"use client";

import { useCallback, useState } from "react";
import type { SiteMarketingPageKey } from "@/types/site-page-marketing";

export function useMarketingPatch(pageKey: SiteMarketingPageKey) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useCallback(
    async (data: Record<string, unknown>) => {
      setBusy(true);
      setMsg(null);
      try {
        const res = await fetch("/api/admin/site-page-marketing", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageKey, data }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(j.error || "Save failed");
        setMsg({ ok: true, text: "Saved. Refresh the public page to verify." });
      } catch (e) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
      } finally {
        setBusy(false);
      }
    },
    [pageKey],
  );

  return { save, busy, msg };
}
