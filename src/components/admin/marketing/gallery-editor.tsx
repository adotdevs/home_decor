"use client";

import type { InspirationGalleryMarketingPayload } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function InspirationGalleryMarketingEditor({ initial }: { initial: InspirationGalleryMarketingPayload }) {
  const [data, setData] = useState(initial);
  const { save, busy, msg } = useMarketingPatch("inspiration-gallery");

  function setBlurb(i: number, field: "title" | "body", v: string) {
    setData((d) => {
      const roomBlurbs = [...d.roomBlurbs];
      const cur = roomBlurbs[i];
      if (!cur) return d;
      roomBlurbs[i] = { ...cur, [field]: v };
      return { ...d, roomBlurbs };
    });
  }

  const text = (label: string, key: keyof InspirationGalleryMarketingPayload, tall?: boolean) => (
    <label key={String(key)} className="block text-sm">
      <span className="font-medium">{label}</span>
      <textarea
        className={`mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm ${tall ? "min-h-[88px]" : "min-h-[44px]"}`}
        value={String(data[key] ?? "")}
        onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
      />
    </label>
  );

  return (
    <div className="mx-auto min-w-0 w-full max-w-2xl space-y-6 px-3 py-6 sm:px-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Public page: /inspiration-gallery</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hero, “how to use” sidebar, room blurbs, bottom newsletter CTA, and SEO. Use {"{count}"} in the hero body template for
          the live gallery count.
        </p>
      </div>
      {text("Inspiration gallery — browser title & SEO title", "metaTitle")}
      {text("Inspiration gallery — meta description", "metaDescription", true)}
      {text("Inspiration gallery — Open Graph title", "ogTitle")}
      {text("Inspiration gallery — Open Graph description", "ogDescription", true)}
      {text("Inspiration gallery — breadcrumb current label", "breadcrumbCurrentLabel")}
      {text("Inspiration gallery — hero eyebrow", "heroEyebrow")}
      {text("Inspiration gallery — H1", "h1")}
      {text("Inspiration gallery — hero description (use {count}+)", "heroDescriptionTemplate", true)}
      {text("Inspiration gallery — “How to use” box title", "howToTitle")}
      {text("Inspiration gallery — “How to use” box body", "howToBody", true)}
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">Inspiration gallery — room blurbs (3 cards under grid)</p>
        {data.roomBlurbs.map((col, i) => (
          <div key={i} className="space-y-2 border-t pt-3 first:border-t-0 first:pt-0">
            <label className="block text-xs font-medium text-muted-foreground">
              Blurb {i + 1} title
              <input
                className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={col.title}
                onChange={(e) => setBlurb(i, "title", e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Blurb {i + 1} body
              <textarea
                className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={col.body}
                onChange={(e) => setBlurb(i, "body", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>
      {text("Inspiration gallery — bottom CTA title", "bottomCtaTitle")}
      {text("Inspiration gallery — bottom CTA body", "bottomCtaBody", true)}
      {text("Inspiration gallery — bottom CTA button", "bottomCtaButtonLabel")}
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
