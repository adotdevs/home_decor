"use client";

import type { LatestMarketingPayload } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function LatestMarketingEditor({ initial }: { initial: LatestMarketingPayload }) {
  const [data, setData] = useState(initial);
  const { save, busy, msg } = useMarketingPatch("latest");

  function setBullet(i: number, field: "title" | "body", v: string) {
    setData((d) => {
      const bulletColumns = [...d.bulletColumns];
      const cur = bulletColumns[i];
      if (!cur) return d;
      bulletColumns[i] = { ...cur, [field]: v };
      return { ...d, bulletColumns };
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Public page: /latest</h1>
        <p className="mt-2 text-sm text-muted-foreground">Latest stories — hero, SEO, and three bullet columns.</p>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Latest page — browser tab title hint</span>
        <textarea
          className="mt-1.5 min-h-[44px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.metaTitle}
          onChange={(e) => setData((d) => ({ ...d, metaTitle: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Latest page — meta description</span>
        <textarea
          className="mt-1.5 min-h-[72px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.metaDescription}
          onChange={(e) => setData((d) => ({ ...d, metaDescription: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Latest page — H1</span>
        <textarea
          className="mt-1.5 min-h-[44px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.h1}
          onChange={(e) => setData((d) => ({ ...d, h1: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Latest page — intro paragraph</span>
        <textarea
          className="mt-1.5 min-h-[100px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.intro}
          onChange={(e) => setData((d) => ({ ...d, intro: e.target.value }))}
        />
      </label>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">Latest page — three highlight cards</p>
        {data.bulletColumns.map((col, i) => (
          <div key={i} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Card {i + 1} title
              <input
                className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={col.title}
                onChange={(e) => setBullet(i, "title", e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Card {i + 1} body
              <textarea
                className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={col.body}
                onChange={(e) => setBullet(i, "body", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
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
