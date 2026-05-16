"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

export type SeasonalHubCopyFormInitial = {
  pageIntro: string;
  storiesSectionTitle: string;
  newsletterCtaLabel: string;
  hubLinksIntro: string;
  extraHubLinks: { label: string; href: string }[];
};

export function SeasonalHubCopyEditor({
  slug,
  seasonLabel,
  initial,
}: {
  slug: string;
  seasonLabel: string;
  initial: SeasonalHubCopyFormInitial;
}) {
  const [pageIntro, setPageIntro] = useState(initial.pageIntro);
  const [storiesSectionTitle, setStoriesSectionTitle] = useState(initial.storiesSectionTitle);
  const [newsletterCtaLabel, setNewsletterCtaLabel] = useState(initial.newsletterCtaLabel);
  const [hubLinksIntro, setHubLinksIntro] = useState(initial.hubLinksIntro);
  const [extraHubLinks, setExtraHubLinks] = useState(initial.extraHubLinks);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/seasonal-hub-copy", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          pageIntro,
          storiesSectionTitle,
          newsletterCtaLabel,
          hubLinksIntro,
          extraHubLinks,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg({ ok: true, text: "Saved. Refresh the seasonal hub page to verify." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy(false);
    }
  }, [slug, pageIntro, storiesSectionTitle, newsletterCtaLabel, hubLinksIntro, extraHubLinks]);

  function setLink(i: number, field: "label" | "href", v: string) {
    setExtraHubLinks((rows) => {
      const next = [...rows];
      const row = next[i];
      if (!row) return rows;
      next[i] = { ...row, [field]: v };
      return next;
    });
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-3xl space-y-10 px-3 py-6 sm:px-4 md:p-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/pages" className="hover:underline">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/pages/seasonal" className="hover:underline">
          Seasonal hubs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{seasonLabel}</span>
      </nav>
      <div>
        <h1 className="font-heading text-2xl font-semibold">{seasonLabel} hub — seasonal page copy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Public URL: <code className="rounded bg-muted px-1">/inspiration/seasonal/{slug}</code>. The large page title (headline), the shorter gray subtitle line beneath it,
          hero image, and which articles load here are edited under <strong>Site & seasons</strong> — this screen is only for the paragraph, section titles, newsletter button label, and
          optional footer links strip.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Main paragraph</h2>
        <p className="text-sm text-muted-foreground">
          This appears on the live page directly <strong>under the gray subtitle line</strong> (the line you set next to each season card in Site settings). Use it as the longer descriptive
          text for visitors.
        </p>
        <p className="text-sm text-muted-foreground">
          You can reuse one template for every season by typing placeholders: whenever someone visits this seasonal page,{" "}
          <code className="rounded bg-muted px-1">{"{seasonName}"}</code> becomes this season&apos;s display name exactly as configured in Site & seasons (for example Autumn warmth), and{" "}
          <code className="rounded bg-muted px-1">{"{seasonNameLower}"}</code> becomes the lowercase version (<code className="rounded bg-muted px-1">autumn warmth</code>). Sample sentence:
          &quot;We lean into {"{seasonNameLower}"} textures for {"{seasonName}"} — swap in your shop voice here.&quot;
        </p>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Paragraph text</span>
          <textarea
            className="mt-1.5 min-h-[120px] w-full rounded-xl border bg-background px-3 py-2 text-sm"
            value={pageIntro}
            onChange={(e) => setPageIntro(e.target.value)}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Stories section & newsletter</h2>
        <p className="text-sm text-muted-foreground">These strings appear beside the grid of editorial stories and above the seasonal hub footer links row.</p>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Stories section heading</span>
          <span className="mt-1 block text-xs text-muted-foreground">Shorter line above the story cards grid.</span>
          <input
            className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm"
            value={storiesSectionTitle}
            onChange={(e) => setStoriesSectionTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Newsletter button label</span>
          <span className="mt-1 block text-xs text-muted-foreground">Primary button under the paragraph; links to /newsletter.</span>
          <input
            className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm"
            value={newsletterCtaLabel}
            onChange={(e) => setNewsletterCtaLabel(e.target.value)}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Seasonal hubs strip</h2>
        <p className="text-sm text-muted-foreground">
          The bordered box near the bottom that lists links to other seasons (and adds any extra shortcuts you define below).
        </p>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Line of text before the links</span>
          <span className="mt-1 block text-xs text-muted-foreground">Shown immediately before automatic links like Summer light · Autumn warmth.</span>
          <input
            className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm"
            value={hubLinksIntro}
            onChange={(e) => setHubLinksIntro(e.target.value)}
          />
        </label>
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Extra shortcuts (optional)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add category or editorial links listed after all other seasonal hubs — use label plus path (starting with /).
            </p>
          </div>
          {extraHubLinks.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                Link label
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                  value={row.label}
                  onChange={(e) => setLink(i, "label", e.target.value)}
                />
              </label>
              <label className="text-sm">
                Path (e.g. /category/bedroom)
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                  value={row.href}
                  onChange={(e) => setLink(i, "href", e.target.value)}
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-medium text-primary underline"
            onClick={() => setExtraHubLinks((r) => [...r, { label: "", href: "" }])}
          >
            Add another link
          </button>
        </div>
      </section>

      {msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Saving…" : "Save seasonal hub copy"}
      </button>
    </div>
  );
}
