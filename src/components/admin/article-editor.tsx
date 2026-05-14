"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { categoryTree } from "@/config/site";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { parseExcludeFromTrendingFlag } from "@/lib/utils/exclude-from-trending";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import type { ImageAltContext } from "@/lib/image-alt";

type ContentBlock = { type: string; content: string; level?: number; alt?: string };

type BlockType = "paragraph" | "heading" | "image" | "quote" | "list";

type EditorBlock = {
  key: string;
  type: BlockType;
  content: string;
  level?: number;
  alt?: string;
};

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
  trendingRank?: number | null;
  excludeFromTrending?: boolean;
  /** Mirrors SiteEditorial editorsChoiceSlugs — not stored on Article. */
  inEditorsChoice?: boolean;
  publishedAt?: string | Date | null;
  popularityScore?: number;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  authorName?: string;
  authorSlug?: string;
  internalLinks?: string[];
  faq?: { question?: string; answer?: string }[];
  views?: number;
  featuredImageAlt?: string;
};

type FaqRow = { key: string; question: string; answer: string };

function newKey() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function faqFromInitial(initial?: { question?: string; answer?: string }[]): FaqRow[] {
  if (!initial?.length) return [];
  return initial.map((r) => ({
    key: newKey(),
    question: String(r.question ?? ""),
    answer: String(r.answer ?? ""),
  }));
}

function blocksFromInitial(initial?: ContentBlock[]): EditorBlock[] {
  const raw =
    initial && initial.length > 0
      ? initial
      : [
          {
            type: "paragraph",
            content: "Start your lede here — short paragraphs read best online.",
          },
        ];
  return raw.map((b) => ({
    key: newKey(),
    type: ((b.type as BlockType) || "paragraph") as BlockType,
    content: String(b.content ?? ""),
    level: typeof b.level === "number" ? b.level : b.type === "heading" ? 2 : undefined,
    alt: b.alt ? String(b.alt) : undefined,
  }));
}

function toPayloadBlocks(blocks: EditorBlock[]): ContentBlock[] {
  const cleaned = blocks
    .map(({ key: _k, ...b }) => b)
    .filter((b) => {
      const c = (b.content || "").trim();
      if (b.type === "image") return Boolean(c);
      return Boolean(c);
    });
  if (!cleaned.length) {
    return [{ type: "paragraph", content: "Add your editorial content using the blocks above." }];
  }
  return cleaned;
}

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
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initial?.featuredImageAlt || "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug || categoryTree[0]?.slug || "bedroom");
  const [subcategorySlug, setSubcategorySlug] = useState(initial?.subcategorySlug || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => blocksFromInitial(initial?.contentBlocks));
  const [scheduleAt, setScheduleAt] = useState(toDatetimeLocal(initial?.scheduledPublishAt));
  const [trendingRank, setTrendingRank] = useState(() => {
    const tr = initial?.trendingRank;
    return tr != null && Number.isFinite(Number(tr)) ? String(tr) : "";
  });
  const [excludeFromTrending, setExcludeFromTrending] = useState(() =>
    parseExcludeFromTrendingFlag(initial?.excludeFromTrending),
  );
  const [inEditorsChoice, setInEditorsChoice] = useState(() => Boolean(initial?.inEditorsChoice));
  const [publishedAtLocal, setPublishedAtLocal] = useState(() =>
    mode === "edit" ? toDatetimeLocal(initial?.publishedAt) : "",
  );
  const [popularityScore, setPopularityScore] = useState(() => {
    const v = initial?.popularityScore;
    return v != null && Number.isFinite(Number(v)) ? String(v) : "0";
  });
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || "");
  const [focusKeyword, setFocusKeyword] = useState(initial?.focusKeyword || "");
  const [authorName, setAuthorName] = useState(initial?.authorName || "");
  const [authorSlug, setAuthorSlug] = useState(initial?.authorSlug || "");
  const [internalLinksText, setInternalLinksText] = useState((initial?.internalLinks || []).join("\n"));
  const [faqRows, setFaqRows] = useState<FaqRow[]>(() => faqFromInitial(initial?.faq));
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState<string | null>(null);
  const [blockUploadKey, setBlockUploadKey] = useState<string | null>(null);

  const subs = useMemo(() => {
    const cat = categoryTree.find((c) => c.slug === categorySlug);
    return cat?.subcategories ?? [];
  }, [categorySlug]);

  const persistedSlug = mode === "edit" && initial?.slug ? String(initial.slug) : "";

  const heroAltContext: ImageAltContext = useMemo(
    () => ({
      articleTitle: title.trim(),
      categorySlug,
      subcategorySlug: (subcategorySlug || subs[0] || "").trim(),
      excerptSnippet: excerpt.slice(0, 220),
      focusKeyword: focusKeyword.trim(),
    }),
    [title, categorySlug, subcategorySlug, subs, excerpt, focusKeyword],
  );

  async function postArticle(body: Record<string, unknown>) {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: { error?: string } & Record<string, unknown> = {};
    try {
      data = JSON.parse(text) as { error?: string } & Record<string, unknown>;
    } catch {
      if (!res.ok) throw new Error(text || "Save failed");
      return {};
    }
    if (!res.ok) {
      throw new Error(data.error || text || "Save failed");
    }
    return data;
  }

  async function onHeroUpload(file: File) {
    setHeroUploading(true);
    setHeroUploadError(null);
    try {
      const { url } = await adminUploadMedia(file, {
        alt: featuredImageAlt,
        contextTitle: title,
        contextCategorySlug: categorySlug,
      });
      setFeaturedImage(url);
    } catch (e) {
      setHeroUploadError(e instanceof Error ? e.message : "Image upload failed");
    } finally {
      setHeroUploading(false);
    }
  }

  async function onBlockImageUpload(key: string, file: File) {
    setBlockUploadKey(key);
    try {
      const block = blocks.find((b) => b.key === key);
      const { url } = await adminUploadMedia(file, {
        alt: block?.alt,
        contextTitle: title,
        contextCategorySlug: categorySlug,
      });
      setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, content: url } : b)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBlockUploadKey(null);
    }
  }

  function updateBlock(key: string, patch: Partial<EditorBlock>) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  }

  function insertBlock(afterKey: string | null, type: BlockType) {
    const next: EditorBlock = {
      key: newKey(),
      type,
      content: "",
      level: type === "heading" ? 2 : undefined,
      alt: type === "image" ? "" : undefined,
    };
    setBlocks((prev) => {
      if (!afterKey) return [...prev, next];
      const i = prev.findIndex((b) => b.key === afterKey);
      if (i === -1) return [...prev, next];
      return [...prev.slice(0, i + 1), next, ...prev.slice(i + 1)];
    });
  }

  function removeBlock(key: string) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.key !== key);
      return next.length ? next : [{ key: newKey(), type: "paragraph", content: "" }];
    });
  }

  function moveBlock(key: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.key === key);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const [row] = copy.splice(i, 1);
      copy.splice(j, 0, row);
      return copy;
    });
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
    const sub = subcategorySlug.trim() || subs[0] || "";
    const faqPayload = faqRows
      .map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }))
      .filter((r) => r.question || r.answer);
    const internalLinksArr = internalLinksText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const payload: Record<string, unknown> = {
      title: title.trim() || "Untitled draft",
      slug: effectiveSlug,
      excerpt: excerpt.trim(),
      featuredImage: featuredImage.trim() ? featuredImage.trim() : null,
      featuredImageAlt: featuredImageAlt.trim() || null,
      categorySlug,
      subcategorySlug: sub || undefined,
      tags: tagList,
      status,
      scheduledPublishAt: withSchedule && scheduleAt ? new Date(scheduleAt).toISOString() : null,
      contentBlocks: toPayloadBlocks(blocks),
      trendingRank: trendingRank.trim() === "" ? null : Number(trendingRank),
      excludeFromTrending,
      inEditorsChoice,
      popularityScore: popularityScore.trim() === "" ? 0 : Number(popularityScore),
      faq: faqPayload,
      internalLinks: internalLinksArr,
      authorName: authorName.trim() || null,
      authorSlug: authorSlug.trim() || null,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      focusKeyword: focusKeyword.trim() || null,
    };
    if (status === "published" && mode === "edit" && publishedAtLocal) {
      const d = new Date(publishedAtLocal);
      if (!Number.isNaN(d.getTime())) {
        payload.publishedAt = d.toISOString();
      }
    }
    return payload;
  }

  const addRow = (t: BlockType) => (
    <button
      key={t}
      type="button"
      className="cursor-pointer rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
      onClick={() => insertBlock(null, t)}
    >
      + {t}
    </button>
  );

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">{mode === "create" ? "Create article" : "Edit article"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build the story with blocks — paragraphs, headings, bullet lists, quotes, and images (upload or URL) in any order. Inline
            images save at full file resolution on the public site.
          </p>
        </div>
        <Link href="/admin/articles" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:underline">
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
        <div className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Featured image (hero)</span>
          <div className="mt-1 overflow-hidden rounded-xl border bg-background">
            {featuredImage ? (
              <div className="relative aspect-[16/9] w-full border-b">
                <Image
                  src={featuredImage}
                  alt={featuredImageAlt.trim() || `${title} featured image preview`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  quality={100}
                />
              </div>
            ) : null}
            <div className="space-y-3 p-3">
              <input
                className="w-full rounded-lg border bg-background p-2 font-mono text-xs"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="/uploads/your-image.jpg"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition hover:bg-muted">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={heroUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onHeroUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                  {heroUploading ? "Uploading..." : "Upload hero"}
                </label>
                {featuredImage ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={() => setFeaturedImage("")}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              {heroUploadError ? <p className="text-xs text-destructive">{heroUploadError}</p> : null}
              <ImageAltField
                label="Featured image alt text"
                value={featuredImageAlt}
                onChange={setFeaturedImageAlt}
                previewSrc={featuredImage || undefined}
                autoPreviewContext={heroAltContext}
                autoPreviewUrl={featuredImage || undefined}
                className="pt-1"
              />
            </div>
          </div>
        </div>
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

        <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Where this story appears</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Inspiration feed & Latest</span> — newest published first. Set{" "}
              <strong>Published at</strong> below to control order without re-saving the article.
            </li>
            <li>
              <span className="font-medium text-foreground">Editor&apos;s choice</span> — row on the homepage and{" "}
              <strong>Editor&apos;s first reads</strong> on matching category hubs (published stories only). Use the checkbox below or
              manage the list in{" "}
              <Link href="/admin/homepage" className="text-primary hover:underline">
                Homepage & featured
              </Link>
              .
            </li>
            <li>
              <span className="font-medium text-foreground">Trending</span> — manual rank and engagement score in{" "}
              <Link href="/admin/trending" className="text-primary hover:underline">
                Trending admin
              </Link>
              .
            </li>
            <li>
              <span className="font-medium text-foreground">Homepage</span> — hero, rails, pins, and copy in{" "}
              <Link href="/admin/homepage" className="text-primary hover:underline">
                Homepage & featured
              </Link>
              .
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Article body (blocks)</span>
            <div className="flex flex-wrap gap-1">{addRow("paragraph")}{addRow("heading")}{addRow("list")}{addRow("quote")}{addRow("image")}</div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reorder with ↑ ↓. Insert images directly after any paragraph. Bullet list: one line per bullet.
          </p>

          <div className="mt-4 space-y-4">
            {blocks.map((b) => (
              <div key={b.key} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {b.type}
                  </span>
                  <button type="button" className="cursor-pointer text-xs text-muted-foreground hover:text-foreground" onClick={() => moveBlock(b.key, -1)}>
                    ↑
                  </button>
                  <button type="button" className="cursor-pointer text-xs text-muted-foreground hover:text-foreground" onClick={() => moveBlock(b.key, 1)}>
                    ↓
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button type="button" className="cursor-pointer text-xs text-primary hover:underline" onClick={() => insertBlock(b.key, "paragraph")}>
                    + paragraph
                  </button>
                  <button type="button" className="cursor-pointer text-xs text-primary hover:underline" onClick={() => insertBlock(b.key, "image")}>
                    + image
                  </button>
                  <button type="button" className="cursor-pointer text-xs text-destructive hover:underline" onClick={() => removeBlock(b.key)}>
                    Remove
                  </button>
                </div>

                {b.type === "paragraph" ? (
                  <textarea
                    className="w-full rounded-lg border bg-background p-3 text-sm leading-relaxed"
                    rows={5}
                    value={b.content}
                    onChange={(e) => updateBlock(b.key, { content: e.target.value })}
                    placeholder="Paragraph text..."
                  />
                ) : null}

                {b.type === "heading" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="text-xs text-muted-foreground">
                        Level
                        <select
                          className="mt-1 rounded-lg border bg-background p-2 text-sm"
                          value={b.level === 3 ? 3 : 2}
                          onChange={(e) => updateBlock(b.key, { level: Number(e.target.value) })}
                        >
                          <option value={2}>H2</option>
                          <option value={3}>H3</option>
                        </select>
                      </label>
                    </div>
                    <input
                      className="w-full rounded-lg border bg-background p-3 text-sm font-semibold"
                      value={b.content}
                      onChange={(e) => updateBlock(b.key, { content: e.target.value })}
                      placeholder="Section heading"
                    />
                  </div>
                ) : null}

                {b.type === "list" ? (
                  <textarea
                    className="w-full rounded-lg border bg-background p-3 text-sm leading-relaxed"
                    rows={6}
                    value={b.content}
                    onChange={(e) => updateBlock(b.key, { content: e.target.value })}
                    placeholder={"One bullet per line\nSecond point\nThird point"}
                  />
                ) : null}

                {b.type === "quote" ? (
                  <textarea
                    className="w-full rounded-lg border bg-background p-3 text-sm italic leading-relaxed"
                    rows={4}
                    value={b.content}
                    onChange={(e) => updateBlock(b.key, { content: e.target.value })}
                    placeholder="Pull quote..."
                  />
                ) : null}

                {b.type === "image" ? (
                  <div className="space-y-3">
                    {b.content ? (
                      <div className="relative max-h-64 w-full overflow-hidden rounded-lg border bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.content}
                          alt={b.alt?.trim() || `${title} inline decor image`}
                          className="max-h-64 w-full object-contain"
                        />
                      </div>
                    ) : null}
                    <input
                      className="w-full rounded-lg border bg-background p-2 font-mono text-xs"
                      value={b.content}
                      onChange={(e) => updateBlock(b.key, { content: e.target.value })}
                      placeholder="/uploads/....jpg"
                    />
                    <label className="inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={blockUploadKey === b.key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void onBlockImageUpload(b.key, file);
                          e.currentTarget.value = "";
                        }}
                      />
                      {blockUploadKey === b.key ? "Uploading…" : "Upload file"}
                    </label>
                    <ImageAltField
                      label="Alt text (SEO & accessibility)"
                      value={b.alt || ""}
                      onChange={(v) => updateBlock(b.key, { alt: v })}
                      previewSrc={b.content || undefined}
                      autoPreviewContext={heroAltContext}
                      autoPreviewUrl={b.content || undefined}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Author</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">Display name</span>
              <input
                className="mt-1 w-full rounded-lg border bg-background p-2 text-sm"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Studio editor"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Author slug (URL)</span>
              <input
                className="mt-1 w-full rounded-lg border bg-background p-2 font-mono text-sm"
                value={authorSlug}
                onChange={(e) => setAuthorSlug(e.target.value)}
                placeholder="studio-editor"
              />
            </label>
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">SEO & social</p>
          <div className="mt-3 grid gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">SEO title (optional override)</span>
              <input
                className="mt-1 w-full rounded-lg border bg-background p-2 text-sm"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to article title when empty"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Meta description</span>
              <textarea
                className="mt-1 w-full rounded-lg border bg-background p-2 text-sm"
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Focus keyword</span>
              <input
                className="mt-1 w-full rounded-lg border bg-background p-2 text-sm"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g. japandi living room"
              />
            </label>
          </div>
        </div>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Internal links (one URL per line)</span>
          <textarea
            className="mt-1 w-full rounded-xl border bg-background p-3 font-mono text-xs"
            rows={4}
            value={internalLinksText}
            onChange={(e) => setInternalLinksText(e.target.value)}
            placeholder={"/latest\n/article/another-story"}
          />
        </label>

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">FAQ blocks</p>
            <button
              type="button"
              className="cursor-pointer rounded-lg border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
              onClick={() => setFaqRows((prev) => [...prev, { key: newKey(), question: "", answer: "" }])}
            >
              + Add question
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {faqRows.map((row) => (
              <div key={row.key} className="rounded-lg border bg-background p-3">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    className="cursor-pointer text-xs text-destructive hover:underline"
                    onClick={() => setFaqRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    Remove
                  </button>
                </div>
                <input
                  className="mb-2 w-full rounded-lg border bg-background p-2 text-sm font-medium"
                  placeholder="Question"
                  value={row.question}
                  onChange={(e) =>
                    setFaqRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, question: e.target.value } : r)))
                  }
                />
                <textarea
                  className="w-full rounded-lg border bg-background p-2 text-sm"
                  rows={3}
                  placeholder="Answer"
                  value={row.answer}
                  onChange={(e) =>
                    setFaqRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, answer: e.target.value } : r)))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {mode === "edit" && initial?.views != null ? (
          <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Views:</span> {Number(initial.views).toLocaleString()} (read-only)
          </div>
        ) : null}

        <label className={`block md:col-span-2 rounded-xl border bg-muted/20 p-4 ${mode === "edit" ? "" : "opacity-60"}`}>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Published at (sort date for feed)</span>
          <input
            type="datetime-local"
            className="mt-2 w-full max-w-sm rounded-lg border bg-background p-2 text-sm"
            disabled={mode !== "edit"}
            value={publishedAtLocal}
            onChange={(e) => setPublishedAtLocal(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Used for Latest and inspiration feed ordering when you <strong>Publish</strong>. New articles get &ldquo;now&rdquo; until you
            change this on edit.
          </p>
        </label>

        <label className="block md:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Engagement score</span>
          <input
            type="number"
            min={0}
            className="mt-2 w-40 rounded-lg border bg-background p-2 text-sm tabular-nums"
            value={popularityScore}
            onChange={(e) => setPopularityScore(e.target.value)}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Higher values surface sooner in <strong>Trending</strong> when no manual rank is set. Adjust in bulk on the{" "}
            <Link href="/admin/trending" className="text-primary hover:underline">
              Trending
            </Link>{" "}
            page.
          </p>
        </label>

        <div className="md:col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trending & homepage</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set a numeric <strong>trending rank</strong> (0–9999, lower appears first) to pin this story in the trending list and
            “most pinned” modules. Leave empty to sort by engagement score only. Check <strong>exclude</strong> to hide from those
            surfaces. For multiple stories use{" "}
            <Link href="/admin/trending" className="font-medium text-primary hover:underline">
              Trending admin
            </Link>
            . Check <strong>Editor&apos;s choice</strong> to surface this story on the homepage rail and on category pages for the same
            room category (published only).
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <label className="block">
              <span className="text-xs text-muted-foreground">Manual trending rank</span>
              <input
                type="number"
                min={0}
                max={9999}
                className="mt-1 w-40 rounded-lg border bg-background p-2 text-sm"
                placeholder="Auto"
                value={trendingRank}
                onChange={(e) => setTrendingRank(e.target.value)}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={excludeFromTrending}
                onChange={(e) => setExcludeFromTrending(e.target.checked)}
              />
              Exclude from trending / most pinned
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inEditorsChoice}
                onChange={(e) => setInEditorsChoice(e.target.checked)}
              />
              Show in &ldquo;Editor&apos;s choice&rdquo; (homepage + this category when the story matches the category)
            </label>
          </div>
        </div>

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

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted" onClick={onSaveDraft}>
          Save draft
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15"
          onClick={onSchedule}
        >
          Schedule
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
          onClick={onPublishNow}
        >
          Publish now
        </button>
        {mode === "edit" && persistedSlug ? (
          <DeleteArticleButton slug={persistedSlug} label="Delete article" />
        ) : null}
      </div>
    </div>
  );
}
