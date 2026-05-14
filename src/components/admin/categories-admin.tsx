"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { categoryHeroImage } from "@/config/images";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import { resolveCategoryBannerAlt } from "@/lib/image-alt";

export type TopLevelCategoryRow = {
  slug: string;
  name: string;
  image: string;
  imageAlt?: string;
};

export function CategoriesAdmin({ initial }: { initial: TopLevelCategoryRow[] }) {
  const [rows, setRows] = useState(() =>
    initial.map((r) => ({ ...r, imageAlt: String(r.imageAlt ?? "").trim() })),
  );
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ slug: string; text: string; ok: boolean } | null>(null);
  const pickSlug = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setMsg({ slug, text: "Saved.", ok: true });
    } catch (e) {
      setMsg({ slug, text: e instanceof Error ? e.message : "Failed", ok: false });
    } finally {
      setBusySlug(null);
    }
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h1 className="font-heading text-3xl">Category management</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Homepage cards under &ldquo;Shop the rooms — by category&rdquo; and category hub heroes use the image you set here. Upload
        a photo or reset to the built-in stock image for that room type. Alt text powers SEO, Pinterest, and accessibility.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={async (e) => {
          const slug = pickSlug.current;
          pickSlug.current = null;
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
              slug,
              text: err instanceof Error ? err.message : "Upload failed",
              ok: false,
            });
          }
        }}
      />

      <ul className="mt-8 space-y-6">
        {rows.map((c) => {
          const displaySrc = c.image?.trim() || categoryHeroImage(c.slug);
          const resolvedPreview = resolveCategoryBannerAlt({
            categorySlug: c.slug,
            categoryDisplayName: c.name,
            imageAlt: c.imageAlt,
            heroImageUrl: displaySrc,
          });
          return (
            <li key={c.slug} className="rounded-xl border p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
                  <p className="font-medium">{c.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">/{c.slug}</p>
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
                  {msg?.slug === c.slug ? (
                    <p className={`text-sm ${msg.ok ? "text-green-600" : "text-destructive"}`}>{msg.text}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busySlug === c.slug}
                      className="rounded-lg border bg-background px-3 py-2 text-sm font-medium disabled:opacity-50"
                      onClick={() => {
                        pickSlug.current = c.slug;
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
