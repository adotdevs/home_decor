"use client";

import { useCallback, useEffect, useState } from "react";

type MediaRow = {
  _id?: string;
  url?: string;
  alt?: string;
  mimeType?: string;
  createdAt?: string;
};

async function fetchMediaRows(): Promise<{ ok: true; rows: MediaRow[] } | { ok: false }> {
  const res = await fetch("/api/media");
  if (!res.ok) return { ok: false };
  return { ok: true, rows: await res.json() };
}

export default function Page() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function uploadFiles(fileList: FileList | File[]) {
    const files = [...fileList];
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.set("file", file);
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
        Drag images into the drop zone or use the file picker. Files are stored under{" "}
        <code className="rounded bg-muted px-1 text-xs">public/uploads</code> and referenced by URL for article featured
        images.
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
          void uploadFiles(e.dataTransfer.files);
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
            if (fl) void uploadFiles(fl);
            e.target.value = "";
          }}
        />
        <p className="text-sm font-medium">{busy ? "Uploading…" : "Drop files here or click to browse"}</p>
        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, or GIF · max 8MB each</p>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <figure
            key={String(m._id || m.url)}
            className="overflow-hidden rounded-xl border bg-background shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url || ""} alt={m.alt || ""} className="aspect-video w-full object-cover" loading="lazy" />
            <figcaption className="space-y-1 p-3 text-xs">
              <p className="truncate font-mono text-[11px] text-muted-foreground">{m.url}</p>
              <button
                type="button"
                className="text-primary hover:underline"
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
