"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { Save, RefreshCw } from "lucide-react";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import { resolveSiteOgImageAlt } from "@/lib/image-alt";

function shortSiteName(siteTitle: string): string {
  const t = siteTitle.trim();
  if (!t) return "Site";
  const head = t.split(/\s[—–-]\s/)[0]?.trim();
  return head || t;
}

type TwitterCard = "summary" | "summary_large_image";

type SeoForm = {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  ogImageAlt: string;
  twitterCard: TwitterCard;
};

const DEFAULTS: SeoForm = {
  siteTitle: "CoreFusion — Interior Inspiration & Design Guides",
  siteDescription:
    "Editorial home decor inspiration, seasonal room guides, and curated interior ideas for beautifully lived-in homes.",
  ogImage: "/images/assets/general/design-interior-light-room-minimal-items.jpg",
  ogImageAlt: "",
  twitterCard: "summary_large_image",
};

export default function AdminSeoPage() {
  const [form, setForm] = useState<SeoForm>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const ogFileRef = useRef<HTMLInputElement>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogUploadErr, setOgUploadErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo");
      if (res.ok) {
        const data = (await res.json()) as { key: string; value: string }[];
        const merged = { ...DEFAULTS };
        for (const item of data) {
          if (item.key in merged) {
            (merged as Record<string, string>)[item.key] = item.value;
          }
        }
        setForm(merged);
      }
    } catch {
      /* use defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        (Object.entries(form) as [string, string][]).map(([key, value]) =>
          fetch("/api/seo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ key, value }),
          }),
        ),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof SeoForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">SEO Management</h1>
          <p className="mt-1 text-muted-foreground">
            Configure global site metadata, Open Graph defaults, and Twitter card settings.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold">Global metadata</h2>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Site title</span>
              <input
                type="text"
                value={form.siteTitle}
                onChange={(e) => update("siteTitle", e.target.value)}
                maxLength={70}
                className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.siteTitle.length}/70 characters — aim for 50–60
              </p>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Site description</span>
              <textarea
                value={form.siteDescription}
                onChange={(e) => update("siteDescription", e.target.value)}
                rows={3}
                maxLength={160}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.siteDescription.length}/160 characters — aim for 120–160
              </p>
            </label>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="font-semibold">Open Graph & social sharing</h2>

            <div>
              <span className="mb-1.5 block text-sm font-medium">Default OG image</span>
              <p className="text-xs text-muted-foreground">
                Recommended: 1200×630 px. Used when an article has no featured image. Upload a file — it is stored like other media
                library images.
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
                    const siteName = shortSiteName(form.siteTitle);
                    const { url } = await adminUploadMedia(file, {
                      alt: form.ogImageAlt,
                      contextTitle: `${siteName} Open Graph image`,
                    });
                    update("ogImage", url);
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
                  className="inline-flex h-10 items-center rounded-xl border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
                  onClick={() => ogFileRef.current?.click()}
                >
                  {ogUploading ? "Uploading…" : "Upload image"}
                </button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  onClick={() => {
                    update("ogImage", DEFAULTS.ogImage);
                    setOgUploadErr("");
                  }}
                >
                  Use built-in default path
                </button>
              </div>
              {ogUploadErr ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{ogUploadErr}</p> : null}
              {form.ogImage ? (
                <div className="mt-4 flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={form.ogImage}
                      alt={resolveSiteOgImageAlt(form.ogImage, shortSiteName(form.siteTitle), form.ogImageAlt)}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={form.ogImage.startsWith("http")}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <p className="break-all text-xs text-muted-foreground">
                      Stored path or URL:{" "}
                      <span className="font-mono text-foreground/90">{form.ogImage}</span>
                    </p>
                    <ImageAltField
                      label="Open Graph image alt"
                      value={form.ogImageAlt}
                      onChange={(v) => update("ogImageAlt", v)}
                      previewSrc={form.ogImage}
                      autoPreviewContext={{
                        siteName: shortSiteName(form.siteTitle),
                        articleTitle: `${shortSiteName(form.siteTitle)} social sharing preview`,
                      }}
                      autoPreviewUrl={form.ogImage}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Twitter card type</span>
              <div className="relative">
                <select
                  value={form.twitterCard}
                  onChange={(e) => update("twitterCard", e.target.value as TwitterCard)}
                  className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with large image</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                &ldquo;Summary with large image&rdquo; is recommended for editorial content.
              </p>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white shadow transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save settings"}
            </button>
            {saved && (
              <span className="text-sm font-medium text-green-600">
                ✓ Saved successfully
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
