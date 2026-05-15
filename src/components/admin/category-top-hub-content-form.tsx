"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { CategoryHubPageCopy } from "@/lib/category-hub-defaults";
import type { CategoryHubEditorial } from "@/services/category-service";

type Props = {
  categorySlug: string;
  initialEditorial: CategoryHubEditorial;
  initialPageCopy: CategoryHubPageCopy;
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

export function CategoryTopHubContentForm({ categorySlug, initialEditorial, initialPageCopy }: Props) {
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
          topSlug: categorySlug,
          hubEditorial: {
            ...editorial,
            searches: [],
          },
          hubPageCopy: pageCopy,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg({ ok: true, text: "Saved. Refresh the public category page to verify." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }, [categorySlug, editorial, pageCopy]);

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl">Category page text</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">/category/{categorySlug}</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            These lines appear on the public room hub. Leave a box empty only if you want to fall back to the site default for
            that spot (FAQ lists fall back when every pair is cleared).
          </p>
        </div>
        <Link href="/admin/categories" className="text-sm font-medium text-primary hover:underline">
          ← All categories
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Hero</h2>
          <Field label="Main headline" hint="Large title under the small eyebrow.">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.title}
              onChange={(e) => setEditorial((x) => ({ ...x, title: e.target.value }))}
            />
          </Field>
          <Field label="Intro paragraph" hint="Shown under the headline.">
            <textarea
              className="mt-1 min-h-[88px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.dek}
              onChange={(e) => setEditorial((x) => ({ ...x, dek: e.target.value }))}
            />
          </Field>
          <Field label="Short tip line" hint="One practical sentence under the intro.">
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={editorial.advice}
              onChange={(e) => setEditorial((x) => ({ ...x, advice: e.target.value }))}
            />
          </Field>
          <Field label="Small eyebrow (kicker)" hint="Uppercase label above the headline.">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.heroEyebrow}
              onChange={(e) => setPageCopy((x) => ({ ...x, heroEyebrow: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Subcategory cards</h2>
          <Field label="Section heading">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.exploreHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, exploreHeading: e.target.value }))}
            />
          </Field>
          <Field label="Section intro">
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.exploreIntro}
              onChange={(e) => setPageCopy((x) => ({ ...x, exploreIntro: e.target.value }))}
            />
          </Field>
          <Field label="Blurb on each subcategory card">
            <textarea
              className="mt-1 min-h-[64px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.subCardBlurb}
              onChange={(e) => setPageCopy((x) => ({ ...x, subCardBlurb: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Latest stories strip</h2>
          <Field label="Heading">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.latestHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, latestHeading: e.target.value }))}
            />
          </Field>
          <Field label="Intro">
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.latestIntro}
              onChange={(e) => setPageCopy((x) => ({ ...x, latestIntro: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <h2 className="text-sm font-semibold text-foreground">Editor’s first reads</h2>
          <Field label="Heading">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.editorsHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, editorsHeading: e.target.value }))}
            />
          </Field>
          <Field label="Intro">
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.editorsIntro}
              onChange={(e) => setPageCopy((x) => ({ ...x, editorsIntro: e.target.value }))}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">FAQ</h2>
            <button
              type="button"
              className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              onClick={() =>
                setPageCopy((x) => ({
                  ...x,
                  faqItems: [...x.faqItems, { question: "", answer: "" }],
                }))
              }
            >
              Add question
            </button>
          </div>
          <Field label="FAQ section title">
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={pageCopy.faqHeading}
              onChange={(e) => setPageCopy((x) => ({ ...x, faqHeading: e.target.value }))}
            />
          </Field>
          <ul className="space-y-3">
            {pageCopy.faqItems.map((item, i) => (
              <li key={i} className="rounded-lg border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">Question {i + 1}</p>
                <input
                  className="mt-2 w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) =>
                    setPageCopy((x) => {
                      const faqItems = x.faqItems.map((it, j) => (j === i ? { ...it, question: e.target.value } : it));
                      return { ...x, faqItems };
                    })
                  }
                />
                <textarea
                  className="mt-2 min-h-[64px] w-full rounded border px-2 py-1.5 text-sm"
                  placeholder="Answer"
                  value={item.answer}
                  onChange={(e) =>
                    setPageCopy((x) => {
                      const faqItems = x.faqItems.map((it, j) => (j === i ? { ...it, answer: e.target.value } : it));
                      return { ...x, faqItems };
                    })
                  }
                />
                <button
                  type="button"
                  className="mt-2 text-xs text-destructive hover:underline"
                  onClick={() =>
                    setPageCopy((x) => ({
                      ...x,
                      faqItems: x.faqItems.filter((_, j) => j !== i),
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
