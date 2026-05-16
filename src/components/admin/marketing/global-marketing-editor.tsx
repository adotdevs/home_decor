"use client";

import type { GlobalMarketingPayload } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function GlobalMarketingEditor({ initial }: { initial: GlobalMarketingPayload }) {
  const [data, setData] = useState(initial);
  const { save, busy, msg } = useMarketingPatch("global-marketing");

  return (
    <div className="mx-auto min-w-0 w-full max-w-2xl space-y-6 px-3 py-6 sm:px-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Site footer — newsletter strip</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Controls the gradient bar above the main footer on every public page (email capture row).
        </p>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Site footer — newsletter prompt (left column)</span>
        <textarea
          className="mt-1.5 min-h-[72px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.footerMiniNewsletterLine}
          onChange={(e) => setData((d) => ({ ...d, footerMiniNewsletterLine: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Site footer — subscribe button label</span>
        <input
          className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.footerSubscribeButtonLabel}
          onChange={(e) => setData((d) => ({ ...d, footerSubscribeButtonLabel: e.target.value }))}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium">Site footer — email field placeholder</span>
        <input
          className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          value={data.footerEmailPlaceholder}
          onChange={(e) => setData((d) => ({ ...d, footerEmailPlaceholder: e.target.value }))}
        />
      </label>
      {msg ? (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
      ) : null}
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
