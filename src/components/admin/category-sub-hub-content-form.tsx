"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { SubcategoryHubPageCopy } from "@/lib/category-hub-defaults";
import type { SubCategoryHubEditorial } from "@/services/category-service";

type Props = {
  parentSlug: string;
  subSlug: string;
  categoryLabel: string;
  initialEditorial: SubCategoryHubEditorial;
  initialPageCopy: SubcategoryHubPageCopy;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {hint ? <span className="block text-xs font-normal text-muted-foreground/90">{hint}</span> : null}
      {children}
    </label>
  );
}

export function CategorySubHubContentForm({
  parentSlug,
  subSlug,
  categoryLabel,
  initialEditorial,
  initialPageCopy,
}: Props) {
  const [editorial, setEditorial] = useState(initialEditorial);
  const [pageCopy, setPageCopy] = useState(initialPageCopy);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/categories/hub-content", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topSlug: parentSlug,
          subSlug,
          hubEditorial: {
            title: editorial.headline,
            dek: editorial.dek,
            advice: editorial.tip,
            searches: [],
          },
          hubPageCopy: {
            subHeroEyebrow: pageCopy.heroEyebrow,
            guidesHeading: pageCopy.guidesHeading,
            guidesIntro: pageCopy.guidesIntro,
            emptyStateTitle: pageCopy.emptyStateTitle,
            emptyStateBody: pageCopy.emptyStateBody,
            howToHeading: pageCopy.howToHeading,
            howToColumns: pageCopy.howToColumns,
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg({ ok: true, text: "Saved. Refresh the public subcategory page to verify." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }, [parentSlug, subSlug, editorial, pageCopy]);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">Subcategory page text</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            /category/{parentSlug}/{subSlug}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Room: <span className="font-medium text-foreground">{categoryLabel}</span>
          </p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Hero copy is stored like other categories (title + intro + tip). The blocks below control the guide list, empty state,
            how-to column, and headings. Search chips on the public page come from analytics and real tags automatically.
          </p>
        </div>
        <Link href="/admin/categories" className="text-sm font-medium text-primary hover:underline">
          ← All categories
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Hero</h2>
          <Field label="Small eyebrow (kicker)">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.heroEyebrow}
              onChange={(e) => setPageCopy((x) => ({ ...x, heroEyebrow: e.target.value }))}
            />
          </Field>
          <Field label="Main headline">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.headline}
              onChange={(e) => setEditorial((x) => ({ ...x, headline: e.target.value }))}
            />
          </Field>
          <Field label="Intro paragraph">
            <textarea
              className="mt-1 min-h-[96px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.dek}
              onChange={(e) => setEditorial((x) => ({ ...x, dek: e.target.value }))}
            />
          </Field>
          <Field label="Tip line">
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.tip}
              onChange={(e) => setEditorial((x) => ({ ...x, tip: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Article grid</h2>
          <Field label="Heading above the cards">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.guidesHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, guidesHeading: e.target.value }))}
            />
          </Field>
          <Field label="Intro">
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.guidesIntro}
              onChange={(e) => setPageCopy((x) => ({ ...x, guidesIntro: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">When no articles are published yet</h2>
          <Field label="Title">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.emptyStateTitle}
              onChange={(e) => setPageCopy((x) => ({ ...x, emptyStateTitle: e.target.value }))}
            />
          </Field>
          <Field label="Body text">
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.emptyStateBody}
              onChange={(e) => setPageCopy((x) => ({ ...x, emptyStateBody: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">How-to columns</h2>
            <button
              type="button"
              className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              onClick={() =>
                setPageCopy((x) => ({
                  ...x,
                  howToColumns: [...x.howToColumns, { title: "", body: "" }],
                }))
              }
            >
              Add column
            </button>
          </div>
          <Field label="Section heading">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.howToHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, howToHeading: e.target.value }))}
            />
          </Field>
          <ul className="space-y-3">
            {pageCopy.howToColumns.map((col, i) => (
              <li key={i} className="rounded-lg border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">Column {i + 1}</p>
                <input
                  className="mt-2 w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="Title"
                  value={col.title}
                  onChange={(e) =>
                    setPageCopy((x) => {
                      const howToColumns = x.howToColumns.map((c, j) =>
                        j === i ? { ...c, title: e.target.value } : c,
                      );
                      return { ...x, howToColumns };
                    })
                  }
                />
                <textarea
                  className="mt-2 min-h-[64px] w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="Body"
                  value={col.body}
                  onChange={(e) =>
                    setPageCopy((x) => {
                      const howToColumns = x.howToColumns.map((c, j) =>
                        j === i ? { ...c, body: e.target.value } : c,
                      );
                      return { ...x, howToColumns };
                    })
                  }
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-destructive hover:underline"
                  onClick={() =>
                    setPageCopy((x) => ({
                      ...x,
                      howToColumns: x.howToColumns.filter((_, j) => j !== i),
                    }))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
        <button
          type="button"
          disabled={busy}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Save page text"}
        </button>
        {msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
