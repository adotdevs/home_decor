"use client";

import type { InspirationFeedMarketingPayload } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function InspirationFeedMarketingEditor({ initial }: { initial: InspirationFeedMarketingPayload }) {
  const [data, setData] = useState(initial);
  const { save, busy, msg } = useMarketingPatch("inspiration-feed");

  const fields: { key: keyof InspirationFeedMarketingPayload; label: string; tall?: boolean }[] = [
    { key: "metaTitle", label: "browser tab title (site name appended in metadata)" },
    { key: "metaDescription", label: "SEO meta description" },
    { key: "eyebrow", label: "small uppercase line above H1" },
    { key: "h1", label: "main headline" },
    { key: "intro", label: "paragraph under headline", tall: true },
    { key: "editorialListLinkText", label: "link text to /latest" },
  ];

  return (
    <div className="mx-auto min-w-0 w-full max-w-2xl space-y-6 px-3 py-6 sm:px-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Public page: /inspiration/feed</h1>
        <p className="mt-2 text-sm text-muted-foreground">Inspiration feed — title, intro, and SEO.</p>
      </div>
      {fields.map(({ key, label, tall }) => (
        <label key={key} className="block text-sm">
          <span className="font-medium">Inspiration feed page — {label}</span>
          <textarea
            className={`mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm ${tall ? "min-h-[88px]" : "min-h-[44px]"}`}
            value={data[key]}
            onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
          />
        </label>
      ))}
      {msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => save(data as unknown as Record<string, unknown>)}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
