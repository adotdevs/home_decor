"use client";

import { useCallback, useEffect, useState } from "react";
import { GALLERY_CATEGORIES } from "@/config/local-assets";

type MediaRow = {
  _id?: string;
  url?: string;
  alt?: string;
  mimeType?: string;
  createdAt?: string;
  showInGallery?: boolean;
  galleryCategory?: string;
};

const ROOM_FILTERS = GALLERY_CATEGORIES.filter((c) => c.id !== "all");

async function fetchMediaRows(): Promise<{ ok: true; rows: MediaRow[] } | { ok: false }> {
  const res = await fetch("/api/media");
  if (!res.ok) return { ok: false };
  return { ok: true, rows: await res.json() };
}

type UploadOpts = { showInGallery: boolean; galleryCategory?: string };

export default function Page() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [galleryDrag, setGalleryDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<string>(ROOM_FILTERS[0]?.id ?? "living");

  const reload = useCallback(async () => {
    const r = await fetchMediaRows();
    if (!r.ok) {
      setError("Could not load library");
      return;
    }
    setItems(r.rows);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const r = await fetchMediaRows();
      if (cancelled) return;
      if (!r.ok) setError("Could not load library");
      else {
        setItems(r.rows);
        setError(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function uploadFiles(fileList: FileList | File[], opts: UploadOpts) {
    const files = [...fileList];
    if (!files.length) return;
    if (opts.showInGallery && !opts.galleryCategory) {
      setError("Choose a gallery room category before uploading.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("showInGallery", opts.showInGallery ? "1" : "0");
        if (opts.showInGallery && opts.galleryCategory) {
          fd.set("galleryCategory", opts.galleryCategory);
        }
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || "Upload failed");
        }
      }
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="font-heading text-3xl">Media library</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Upload files for article hero images and inline blocks. On your machine files go under{" "}
        <code className="rounded bg-muted px-1 text-xs">public/uploads</code>. On{" "}
        <strong className="font-medium text-foreground">Vercel</strong>, connect{" "}
        <strong className="font-medium text-foreground">Blob</strong> storage to this project so{" "}
        <code className="rounded bg-muted px-1 text-xs">BLOB_READ_WRITE_TOKEN</code> is set. Use the inspiration gallery
        section below to add images that appear on the public gallery with room filters.
      </p>

      <div
        className={`mt-6 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          drag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/40"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void uploadFiles(e.dataTransfer.files, { showInGallery: false });
        }}
        onClick={() => document.getElementById("media-file-input")?.click()}
      >
        <input
          id="media-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            const fl = e.target.files;
            if (fl) void uploadFiles(fl, { showInGallery: false });
            e.target.value = "";
          }}
        />
        <p className="text-sm font-medium">{busy ? "Uploading…" : "Media library — drop files here or click to browse"}</p>
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF · max 8MB each · not shown on gallery by default</p>
      </div>

      <section className="mt-10 border-t pt-10" id="gallery-upload">
        <h2 className="font-heading text-xl font-semibold">Inspiration gallery (bulk)</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Upload one or many images at once. They appear on{" "}
          <a href="/inspiration-gallery" className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer">
            /inspiration-gallery
          </a>{" "}
          under the room you select.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gallery room filter</span>
            <select
              className="cursor-pointer rounded-xl border bg-background px-3 py-2 text-sm"
              value={galleryCategory}
              onChange={(e) => setGalleryCategory(e.target.value)}
            >
              {ROOM_FILTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className={`mt-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            galleryDrag ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/40"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setGalleryDrag(true);
          }}
          onDragLeave={() => setGalleryDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setGalleryDrag(false);
            void uploadFiles(e.dataTransfer.files, { showInGallery: true, galleryCategory });
          }}
          onClick={() => document.getElementById("gallery-file-input")?.click()}
        >
          <input
            id="gallery-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              const fl = e.target.files;
              if (fl) void uploadFiles(fl, { showInGallery: true, galleryCategory });
              e.target.value = "";
            }}
          />
          <p className="text-sm font-medium">
            {busy ? "Uploading…" : "Drop gallery images here or click — adds to public gallery (bulk)"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Same limits · tagged with the room selected above</p>
        </div>
      </section>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <figure key={String(m._id || m.url)} className="overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url || ""} alt={m.alt || ""} className="aspect-video w-full object-cover" loading="lazy" />
            <figcaption className="space-y-1 p-3 text-xs">
              <p className="truncate font-mono text-[11px] text-muted-foreground">{m.url}</p>
              {m.showInGallery ? (
                <p className="text-[11px] text-primary">Gallery · {m.galleryCategory ?? "?"}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Library only</p>
              )}
              <button
                type="button"
                className="cursor-pointer text-primary hover:underline"
                onClick={() => m.url && void navigator.clipboard.writeText(m.url)}
              >
                Copy URL
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
