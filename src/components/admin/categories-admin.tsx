"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { categoryHeroImage } from "@/config/images";

export type TopLevelCategoryRow = {
  slug: string;
  name: string;
  image: string;
};

async function uploadLibraryImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("showInGallery", "0");
  const res = await fetch("/api/media", { method: "POST", body: fd, credentials: "include" });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Upload failed");
  const url = data.url;
  if (!url) throw new Error("No image URL returned");
  return url;
}

export function CategoriesAdmin({ initial }: { initial: TopLevelCategoryRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ slug: string; text: string; ok: boolean } | null>(null);
  const pickSlug = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patchImage = useCallback(async (slug: string, image: string | null) => {
    setBusySlug(slug);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; image?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      const next = data.image ?? "";
      setRows((r) => r.map((x) => (x.slug === slug ? { ...x, image: next } : x)));
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
        a photo or reset to the built-in stock image for that room type.
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
          try {
            const url = await uploadLibraryImage(file);
            await patchImage(slug, url);
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
          return (
            <li key={c.slug} className="rounded-xl border p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48">
                  <Image
                    src={displaySrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized={displaySrc.startsWith("http")}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium">{c.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">/{c.slug}</p>
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
                      onClick={() => void patchImage(c.slug, null)}
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
