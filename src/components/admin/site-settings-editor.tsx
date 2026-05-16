"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { SiteSettingsPayload } from "@/services/site-settings-service";
import { DEFAULT_OG_IMAGE, SEASONAL_IMAGE_KEYS, type SeasonalImageKey } from "@/config/site-defaults";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import { resolveSiteOgImageAlt } from "@/lib/image-alt";

async function uploadOgImage(file: File, alt: string, siteName: string): Promise<string> {
  const { url } = await adminUploadMedia(file, {
    alt,
    contextTitle: `${siteName} Open Graph image`,
  });
  return url;
}

function emptySeasonal(): SiteSettingsPayload["seasonalItems"][number] {
  return {
    slug: "",
    name: "",
    description: "",
    imageKey: "spring",
    articlesTagPath: "",
  };
}

export function SiteSettingsEditor({ initial }: { initial: SiteSettingsPayload }) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [publicUrl, setPublicUrl] = useState(initial.publicUrl);
  const [ogImage, setOgImage] = useState(initial.ogImage);
  const [ogImageAlt, setOgImageAlt] = useState(initial.ogImageAlt ?? "");
  const [seasonalItems, setSeasonalItems] = useState(initial.seasonalItems);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");
  const [ogUploading, setOgUploading] = useState(false);
  const [ogUploadErr, setOgUploadErr] = useState("");
  const ogFileRef = useRef<HTMLInputElement>(null);

  const save = useCallback(async () => {
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, publicUrl, ogImage, ogImageAlt, seasonalItems }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setStatus("ok");
      setMessage("Saved.");
    } catch (e) {
      setStatus("err");
      setMessage(e instanceof Error ? e.message : "Save failed");
    }
  }, [name, description, publicUrl, ogImage, ogImageAlt, seasonalItems]);

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Site & seasons</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Brand name, global description, canonical URL, default OG image, and seasonal inspiration cards (homepage sidebar and
          <code className="mx-1 rounded bg-muted px-1">/inspiration/seasonal/…</code> pages). Leave public URL empty to use{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_SITE_URL</code>.
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h2 className="font-heading text-xl font-semibold">Global</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Site name</span>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="font-medium text-foreground">Public URL (no trailing slash)</span>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              placeholder="https://yoursite.com"
              value={publicUrl}
              onChange={(e) => setPublicUrl(e.target.value)}
            />
          </label>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-foreground">Default OG / social preview image</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Used when pages don&apos;t set their own image. Upload a file — it&apos;s stored in media library like article images.
            </p>
            <input
              ref={ogFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setOgUploadErr("");
                setOgUploading(true);
                try {
                  const url = await uploadOgImage(file, ogImageAlt, name);
                  setOgImage(url);
                } catch (err) {
                  setOgUploadErr(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setOgUploading(false);
                }
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={ogUploading}
                className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                onClick={() => ogFileRef.current?.click()}
              >
                {ogUploading ? "Uploading…" : "Upload image"}
              </button>
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                onClick={() => {
                  setOgImage(DEFAULT_OG_IMAGE);
                  setOgUploadErr("");
                }}
              >
                Use built-in default
              </button>
            </div>
            {ogUploadErr ? <p className="mt-2 text-sm text-destructive">{ogUploadErr}</p> : null}
            {ogImage ? (
              <div className="mt-4 flex items-start gap-4 rounded-lg border bg-muted/30 p-3">
                <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={ogImage}
                    alt={resolveSiteOgImageAlt(ogImage, name, ogImageAlt)}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized={ogImage.startsWith("http")}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="break-all text-xs text-muted-foreground">
                    Current file: <span className="font-mono text-foreground/90">{ogImage}</span>
                  </p>
                  <ImageAltField
                    label="Open Graph image alt"
                    value={ogImageAlt}
                    onChange={setOgImageAlt}
                    previewSrc={ogImage}
                    autoPreviewContext={{ siteName: name, articleTitle: `${name} social sharing preview` }}
                    autoPreviewUrl={ogImage}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <label className="block text-sm md:col-span-2">
            <span className="font-medium text-foreground">Site description</span>
            <textarea
              className="mt-1 min-h-[100px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Seasonal guides</h2>
          <button
            type="button"
            className="rounded-lg border bg-background px-3 py-2 text-sm font-medium"
            onClick={() => setSeasonalItems((s) => [...s, emptySeasonal()])}
          >
            Add row
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Image picks the hero photo from the built-in seasonal set (spring / summer / autumn / winter). Articles tag path drives
          related stories (defaults to slug).
        </p>
        <ul className="mt-6 space-y-6">
          {seasonalItems.map((row, i) => (
            <li key={i} className="rounded-xl border bg-background/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs">
                  <span className="text-muted-foreground">URL slug</span>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                    value={row.slug}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSeasonalItems((s) => s.map((x, j) => (j === i ? { ...x, slug: v } : x)));
                    }}
                  />
                </label>
                <label className="block text-xs sm:col-span-2">
                  <span className="text-muted-foreground">Title</span>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                    value={row.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSeasonalItems((s) => s.map((x, j) => (j === i ? { ...x, name: v } : x)));
                    }}
                  />
                </label>
                <label className="block text-xs lg:col-span-3">
                  <span className="text-muted-foreground">Description</span>
                  <textarea
                    className="mt-1 min-h-[60px] w-full rounded-md border px-2 py-1.5 text-sm"
                    value={row.description}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSeasonalItems((s) => s.map((x, j) => (j === i ? { ...x, description: v } : x)));
                    }}
                  />
                </label>
                <label className="block text-xs">
                  <span className="text-muted-foreground">Hero image key</span>
                  <select
                    className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                    value={row.imageKey}
                    onChange={(e) => {
                      const v = e.target.value as SeasonalImageKey;
                      setSeasonalItems((s) => s.map((x, j) => (j === i ? { ...x, imageKey: v } : x)));
                    }}
                  >
                    {SEASONAL_IMAGE_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs sm:col-span-2">
                  <span className="text-muted-foreground">Articles tag path (optional)</span>
                  <input
                    className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                    placeholder={row.slug || "e.g. spring-refresh"}
                    value={row.articlesTagPath || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSeasonalItems((s) => s.map((x, j) => (j === i ? { ...x, articlesTagPath: v } : x)));
                    }}
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-destructive hover:underline"
                onClick={() => setSeasonalItems((s) => s.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={status === "saving"}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          onClick={() => void save()}
        >
          {status === "saving" ? "Saving…" : "Save settings"}
        </button>
        {message ? (
          <span className={`text-sm ${status === "err" ? "text-destructive" : "text-muted-foreground"}`}>{message}</span>
        ) : null}
      </div>
    </div>
  );
}
