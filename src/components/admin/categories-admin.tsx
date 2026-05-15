"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { categoryHeroImage } from "@/config/images";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import { resolveCategoryBannerAlt } from "@/lib/image-alt";

export type SubCategoryAdminRow = { slug: string; name: string };
export type TopLevelCategoryAdminRow = {
  slug: string;
  name: string;
  image: string;
  imageAlt?: string;
  subcategories: SubCategoryAdminRow[];
};

function topNameKey(slug: string) {
  return `top:${slug}`;
}
function subNameKey(parentSlug: string, slug: string) {
  return `sub:${parentSlug}:${slug}`;
}

export function CategoriesAdmin({ initial }: { initial: TopLevelCategoryAdminRow[] }) {
  const [rows, setRows] = useState(() =>
    initial.map((r) => ({
      ...r,
      imageAlt: String(r.imageAlt ?? "").trim(),
      subcategories: r.subcategories.map((s) => ({ ...s })),
    })),
  );
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ key: string; text: string; ok: boolean } | null>(null);
  const [newTop, setNewTop] = useState({ name: "", slug: "" });
  const [newSubByParent, setNewSubByParent] = useState<Record<string, { name: string; slug: string }>>({});
  const [nameEdits, setNameEdits] = useState<Record<string, string>>({});

  const setFlash = useCallback((key: string, text: string, ok: boolean) => {
    setMsg({ key, text, ok });
  }, []);

  const patchImage = useCallback(async (slug: string, image: string | null, imageAlt: string) => {
    setBusySlug(slug);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image, imageAlt: image ? imageAlt.trim() : "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; image?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      const next = data.image ?? "";
      setRows((r) => r.map((x) => (x.slug === slug ? { ...x, image: next, imageAlt: image ? imageAlt.trim() : "" } : x)));
      setFlash(slug, "Saved.", true);
    } catch (e) {
      setFlash(slug, e instanceof Error ? e.message : "Failed", false);
    } finally {
      setBusySlug(null);
    }
  }, [setFlash]);

  const pickSlugRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const createTop = useCallback(async () => {
    const name = newTop.name.trim();
    if (!name) {
      setFlash("_newTop", "Enter a category name.", false);
      return;
    }
    setBusyKey("_newTop");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          slug: newTop.slug.trim() || undefined,
          parentSlug: null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; category?: { slug: string; name: string } };
      if (!res.ok) throw new Error(data.error || "Create failed");
      const c = data.category;
      if (!c) throw new Error("Invalid response");
      setRows((prev) => [...prev, { slug: c.slug, name: c.name, image: "", imageAlt: "", subcategories: [] }]);
      setNewTop({ name: "", slug: "" });
      setFlash("_newTop", "Category created.", true);
    } catch (e) {
      setFlash("_newTop", e instanceof Error ? e.message : "Failed", false);
    } finally {
      setBusyKey(null);
    }
  }, [newTop, setFlash]);

  const createSub = useCallback(
    async (parentSlug: string) => {
      const draft = newSubByParent[parentSlug] || { name: "", slug: "" };
      const name = draft.name.trim();
      if (!name) {
        setFlash(`_newSub:${parentSlug}`, "Enter a subcategory name.", false);
        return;
      }
      const k = `_newSub:${parentSlug}`;
      setBusyKey(k);
      setMsg(null);
      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            slug: draft.slug.trim() || undefined,
            parentSlug,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string; category?: { slug: string; name: string } };
        if (!res.ok) throw new Error(data.error || "Create failed");
        const c = data.category;
        if (!c) throw new Error("Invalid response");
        setRows((prev) =>
          prev.map((row) =>
            row.slug === parentSlug
              ? { ...row, subcategories: [...row.subcategories, { slug: c.slug, name: c.name }] }
              : row,
          ),
        );
        setNewSubByParent((p) => ({ ...p, [parentSlug]: { name: "", slug: "" } }));
        setFlash(k, "Subcategory created.", true);
      } catch (e) {
        setFlash(k, e instanceof Error ? e.message : "Failed", false);
      } finally {
        setBusyKey(null);
      }
    },
    [newSubByParent, setFlash],
  );

  const patchName = useCallback(
    async (slug: string, parentSlug: string | null, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setFlash(slug + (parentSlug || ""), "Name required.", false);
        return;
      }
      const k = parentSlug ? subNameKey(parentSlug, slug) : topNameKey(slug);
      setBusyKey(k);
      setMsg(null);
      try {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ slug, parentSlug: parentSlug ?? null, name: trimmed }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Update failed");
        setRows((prev) =>
          prev.map((row) => {
            if (parentSlug == null) {
              return row.slug === slug ? { ...row, name: trimmed } : row;
            }
            if (row.slug !== parentSlug) return row;
            return {
              ...row,
              subcategories: row.subcategories.map((s) => (s.slug === slug ? { ...s, name: trimmed } : s)),
            };
          }),
        );
        setNameEdits((e) => {
          const next = { ...e };
          delete next[k];
          return next;
        });
        setFlash(k, "Name saved.", true);
      } catch (e) {
        setFlash(k, e instanceof Error ? e.message : "Failed", false);
      } finally {
        setBusyKey(null);
      }
    },
    [setFlash],
  );

  const removeTop = useCallback(
    async (slug: string, name: string) => {
      if (!window.confirm(`Remove “${name}” and hide its subcategories? Articles keep their slugs.`)) return;
      setBusyKey(`del:${slug}`);
      setMsg(null);
      try {
        const res = await fetch(`/api/admin/categories?slug=${encodeURIComponent(slug)}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Delete failed");
        setRows((prev) => prev.filter((r) => r.slug !== slug));
        setFlash(`del:${slug}`, "Removed.", true);
      } catch (e) {
        setFlash(`del:${slug}`, e instanceof Error ? e.message : "Failed", false);
      } finally {
        setBusyKey(null);
      }
    },
    [setFlash],
  );

  const removeSub = useCallback(
    async (parentSlug: string, subSlug: string, label: string) => {
      if (!window.confirm(`Remove subcategory “${label}”?`)) return;
      const k = `del:${parentSlug}:${subSlug}`;
      setBusyKey(k);
      setMsg(null);
      try {
        const res = await fetch(
          `/api/admin/categories?slug=${encodeURIComponent(subSlug)}&parentSlug=${encodeURIComponent(parentSlug)}`,
          { method: "DELETE", credentials: "include" },
        );
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(data.error || "Delete failed");
        setRows((prev) =>
          prev.map((row) =>
            row.slug === parentSlug
              ? { ...row, subcategories: row.subcategories.filter((s) => s.slug !== subSlug) }
              : row,
          ),
        );
        setFlash(k, "Removed.", true);
      } catch (e) {
        setFlash(k, e instanceof Error ? e.message : "Failed", false);
      } finally {
        setBusyKey(null);
      }
    },
    [setFlash],
  );

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h1 className="font-heading text-3xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Manage room names, images, and URLs. To change the headlines and paragraphs on public category pages, open “Edit page text”
        for that room or sub-topic.
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">Add top-level category</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Display name
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground"
              value={newTop.name}
              onChange={(e) => setNewTop((t) => ({ ...t, name: e.target.value }))}
              placeholder="e.g. Pantry"
            />
          </label>
          <label className="block w-full sm:w-48 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Slug (optional)
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm text-foreground"
              value={newTop.slug}
              onChange={(e) => setNewTop((t) => ({ ...t, slug: e.target.value }))}
              placeholder="auto from name"
            />
          </label>
          <button
            type="button"
            disabled={busyKey === "_newTop"}
            className="h-10 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            onClick={() => void createTop()}
          >
            {busyKey === "_newTop" ? "Adding…" : "Add category"}
          </button>
        </div>
        {msg?.key === "_newTop" ? (
          <p className={`mt-2 text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={async (e) => {
          const slug = pickSlugRef.current;
          pickSlugRef.current = null;
          const file = e.target.files?.[0];
          if (fileRef.current) fileRef.current.value = "";
          if (!slug || !file) return;
          const row = rows.find((x) => x.slug === slug);
          try {
            const { url } = await adminUploadMedia(file, {
              contextCategorySlug: slug,
              alt: row?.imageAlt,
              contextTitle: row?.name,
            });
            await patchImage(slug, url, row?.imageAlt ?? "");
          } catch (err) {
            setMsg({
              key: slug,
              text: err instanceof Error ? err.message : "Upload failed",
              ok: false,
            });
          }
        }}
      />

      <ul className="mt-8 space-y-8">
        {rows.map((c) => {
          const displaySrc = c.image?.trim() || categoryHeroImage(c.slug);
          const resolvedPreview = resolveCategoryBannerAlt({
            categorySlug: c.slug,
            categoryDisplayName: c.name,
            imageAlt: c.imageAlt,
            heroImageUrl: displaySrc,
          });
          const tKey = topNameKey(c.slug);
          const topNameVal = nameEdits[tKey] ?? c.name;
          return (
            <li key={c.slug} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top-level room</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="block min-w-0 flex-1 text-xs font-medium text-muted-foreground">
                      Name
                      <input
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        value={topNameVal}
                        onChange={(e) => setNameEdits((prev) => ({ ...prev, [tKey]: e.target.value }))}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busyKey === tKey || topNameVal.trim() === c.name}
                      className="h-10 shrink-0 rounded-lg border bg-background px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      onClick={() => void patchName(c.slug, null, topNameVal)}
                    >
                      {busyKey === tKey ? "Saving…" : "Save name"}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">/{c.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/categories/${encodeURIComponent(c.slug)}/content`}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Edit page text
                  </Link>
                  <button
                    type="button"
                    disabled={busyKey === `del:${c.slug}`}
                    className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    onClick={() => void removeTop(c.slug, c.name)}
                  >
                    {busyKey === `del:${c.slug}` ? "…" : "Remove category"}
                  </button>
                </div>
              </div>
              {msg?.key === `del:${c.slug}` ? (
                <p className={`mt-2 text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
              ) : null}
              {msg?.key === tKey ? (
                <p className={`mt-2 text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
              ) : null}

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48">
                  <Image
                    src={displaySrc}
                    alt={resolvedPreview}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized={displaySrc.startsWith("http")}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <ImageAltField
                    label="Image alt text (SEO & accessibility)"
                    value={c.imageAlt}
                    onChange={(v) => setRows((prev) => prev.map((x) => (x.slug === c.slug ? { ...x, imageAlt: v } : x)))}
                    previewSrc={displaySrc}
                    autoPreviewContext={{
                      articleTitle: `${c.name} decor ideas and styling guides`,
                      categorySlug: c.slug,
                    }}
                    autoPreviewUrl={displaySrc}
                  />
                  <button
                    type="button"
                    className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                    disabled={busySlug === c.slug || !c.image?.trim()}
                    onClick={() => void patchImage(c.slug, c.image.trim(), c.imageAlt)}
                  >
                    Save alt text
                  </button>
                  {msg?.key === c.slug ? (
                    <p className={`text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busySlug === c.slug}
                      className="rounded-lg border bg-background px-3 py-2 text-sm font-medium disabled:opacity-50"
                      onClick={() => {
                        pickSlugRef.current = c.slug;
                        fileRef.current?.click();
                      }}
                    >
                      {busySlug === c.slug ? "Working…" : "Upload image"}
                    </button>
                    <button
                      type="button"
                      disabled={busySlug === c.slug}
                      className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
                      onClick={() => void patchImage(c.slug, null, "")}
                    >
                      Use stock photo
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-foreground">Subcategories</p>
                <ul className="mt-3 space-y-2">
                  {c.subcategories.length === 0 ? (
                    <li className="text-sm text-muted-foreground">No subcategories yet.</li>
                  ) : (
                    c.subcategories.map((s) => {
                      const sKey = subNameKey(c.slug, s.slug);
                      const subNameVal = nameEdits[sKey] ?? s.name;
                      return (
                        <li
                          key={s.slug}
                          className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/15 p-3 sm:flex-row sm:items-end"
                        >
                          <div className="min-w-0 flex-1 space-y-2">
                            <label className="block text-xs font-medium text-muted-foreground">
                              Name
                              <input
                                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                value={subNameVal}
                                onChange={(e) => setNameEdits((prev) => ({ ...prev, [sKey]: e.target.value }))}
                              />
                            </label>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              /category/{c.slug}/{s.slug}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Link
                              href={`/admin/categories/${encodeURIComponent(c.slug)}/sub/${encodeURIComponent(s.slug)}/content`}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
                            >
                              Page text
                            </Link>
                            <button
                              type="button"
                              disabled={busyKey === sKey || subNameVal.trim() === s.name}
                              className="rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
                              onClick={() => void patchName(s.slug, c.slug, subNameVal)}
                            >
                              {busyKey === sKey ? "…" : "Save"}
                            </button>
                            <button
                              type="button"
                              disabled={busyKey === `del:${c.slug}:${s.slug}`}
                              className="rounded-lg border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              onClick={() => void removeSub(c.slug, s.slug, s.name)}
                            >
                              Remove
                            </button>
                          </div>
                          {msg?.key === sKey ? (
                            <p className={`basis-full text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
                          ) : null}
                          {msg?.key === `del:${c.slug}:${s.slug}` ? (
                            <p className={`basis-full text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
                          ) : null}
                        </li>
                      );
                    })
                  )}
                </ul>

                <div className="mt-4 rounded-lg border border-dashed border-border/80 bg-background/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Add subcategory under {c.name}</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <input
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="Name"
                      value={newSubByParent[c.slug]?.name ?? ""}
                      onChange={(e) =>
                        setNewSubByParent((p) => ({
                          ...p,
                          [c.slug]: { name: e.target.value, slug: p[c.slug]?.slug ?? "" },
                        }))
                      }
                    />
                    <input
                      className="w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm sm:w-40"
                      placeholder="slug (opt)"
                      value={newSubByParent[c.slug]?.slug ?? ""}
                      onChange={(e) =>
                        setNewSubByParent((p) => ({
                          ...p,
                          [c.slug]: { name: p[c.slug]?.name ?? "", slug: e.target.value },
                        }))
                      }
                    />
                    <button
                      type="button"
                      disabled={busyKey === `_newSub:${c.slug}`}
                      className="h-10 shrink-0 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                      onClick={() => void createSub(c.slug)}
                    >
                      Add
                    </button>
                  </div>
                  {msg?.key === `_newSub:${c.slug}` ? (
                    <p className={`mt-2 text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
