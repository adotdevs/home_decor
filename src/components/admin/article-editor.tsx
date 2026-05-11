"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categoryTree } from "@/config/site";

type ContentBlock = { type: string; content: string; level?: number; alt?: string };

export type ArticleEditorInitial = {
  title?: string;
  slug?: string;
  excerpt?: string;
  featuredImage?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  tags?: string[];
  contentBlocks?: ContentBlock[];
  status?: string;
  scheduledPublishAt?: string | Date | null;
};

function toDatetimeLocal(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function ArticleEditor({ initial, mode }: { initial?: ArticleEditorInitial; mode: "create" | "edit" }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(initial?.featuredImage || "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug || categoryTree[0]?.slug || "bedroom");
  const [subcategorySlug, setSubcategorySlug] = useState(initial?.subcategorySlug || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const paragraph =
    initial?.contentBlocks?.find((b) => b.type === "paragraph")?.content ||
    "Start writing your editorial copy here — short ledes work best above the fold.";
  const [content, setContent] = useState(paragraph);
  const [scheduleAt, setScheduleAt] = useState(toDatetimeLocal(initial?.scheduledPublishAt));

  const subs = useMemo(() => {
    const cat = categoryTree.find((c) => c.slug === categorySlug);
    return cat?.subcategories ?? [];
  }, [categorySlug]);

  async function postArticle(body: Record<string, unknown>) {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Save failed");
    }
    return res.json();
  }

  async function onSaveDraft() {
    try {
      await postArticle(buildPayload("draft", false));
      router.push("/admin/articles");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function onPublishNow() {
    try {
      await postArticle(buildPayload("published", false));
      router.push("/admin/articles");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Publish failed");
    }
  }

  async function onSchedule() {
    if (!scheduleAt) {
      alert("Pick a date and time for scheduled publishing.");
      return;
    }
    try {
      await postArticle(buildPayload("draft", true));
      router.push("/admin/articles");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Schedule failed");
    }
  }

  function buildPayload(status: "draft" | "published", withSchedule: boolean) {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const effectiveSlug = slug.trim() || undefined;
    const sub = subcategorySlug.trim() || subs[0] || "general";
    return {
      title: title.trim() || "Untitled draft",
      slug: effectiveSlug,
      excerpt: excerpt.trim(),
      featuredImage: featuredImage.trim() || undefined,
      categorySlug,
      subcategorySlug: sub,
      tags: tagList,
      status,
      scheduledPublishAt: withSchedule && scheduleAt ? new Date(scheduleAt).toISOString() : null,
      contentBlocks: [{ type: "paragraph", content }] as ContentBlock[],
    };
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">{mode === "create" ? "Create article" : "Edit article"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drafts can carry a schedule — a cron job publishes when{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">scheduledPublishAt</code> is due.
          </p>
        </div>
        <Link href="/admin/articles" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          ← Back to list
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Title</span>
          <input
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Slug (optional)</span>
          <input
            className="mt-1 w-full rounded-xl border bg-background p-3 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from title"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Featured image URL</span>
          <input
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="/images/..."
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Excerpt</span>
          <textarea
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</span>
          <select
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              const next = categoryTree.find((c) => c.slug === e.target.value);
              setSubcategorySlug(next?.subcategories[0] || "");
            }}
          >
            {categoryTree.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subcategory</span>
          <select
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            value={subcategorySlug || subs[0] || ""}
            onChange={(e) => setSubcategorySlug(e.target.value)}
          >
            {subs.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("-", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tags (comma-separated)</span>
          <input
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="japandi, nursery, lighting"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Body (paragraph block)</span>
          <textarea
            className="mt-1 w-full rounded-xl border bg-background p-3 text-sm leading-relaxed"
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <label className="block md:col-span-2 rounded-xl border border-dashed border-primary/30 bg-muted/30 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schedule publish</span>
          <input
            type="datetime-local"
            className="mt-2 w-full max-w-sm rounded-lg border bg-background p-2 text-sm"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Saves as draft with <strong>scheduledPublishAt</strong>. Ensure <code className="rounded bg-muted px-1">/api/cron/publish</code> runs
            with <code className="rounded bg-muted px-1">CRON_SECRET</code>.
          </p>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted" onClick={onSaveDraft}>
          Save draft
        </button>
        <button
          type="button"
          className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15"
          onClick={onSchedule}
        >
          Schedule
        </button>
        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
          onClick={onPublishNow}
        >
          Publish now
        </button>
      </div>
    </div>
  );
}
