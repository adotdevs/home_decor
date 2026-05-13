import { cache } from "react";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { MediaUpload } from "@/models/MediaUpload";
import { localAssets } from "@/config/local-assets";
import type { LocalAsset } from "@/config/local-assets";
import { mapCategoryToGallery } from "@/lib/gallery/map-article-category";

const ALLOWED: ReadonlySet<LocalAsset["category"]> = new Set([
  "living",
  "kitchen",
  "bedroom",
  "bathroom",
  "wall-decor",
  "entryway",
  "general",
]);

export type GalleryItem = {
  src: string;
  alt: string;
  category: LocalAsset["category"];
  articleSlug?: string;
  articleTitle?: string;
  source: "local" | "article" | "upload";
};

function normalizeGalleryCategory(c: unknown): LocalAsset["category"] {
  if (typeof c === "string" && ALLOWED.has(c as LocalAsset["category"])) {
    return c as LocalAsset["category"];
  }
  return "general";
}

/**
 * Local seed assets, published article images (hero + inline blocks), and admin gallery uploads.
 * Deduplicated by `src`; article-linked metadata wins on conflicts.
 * Cached per request so metadata + page share one DB round-trip.
 */
export const getMergedGalleryItems = cache(async function getMergedGalleryItems(): Promise<GalleryItem[]> {
  const bySrc = new Map<string, GalleryItem>();

  function add(item: GalleryItem) {
    const key = item.src.trim();
    if (!key) return;
    const existing = bySrc.get(key);
    if (!existing) {
      bySrc.set(key, item);
      return;
    }
    if (item.articleSlug && !existing.articleSlug) {
      bySrc.set(key, {
        ...existing,
        ...item,
        alt: item.alt || existing.alt,
        category: item.category,
      });
    }
  }

  for (const a of localAssets) {
    add({ src: a.src, alt: a.alt, category: a.category, source: "local" });
  }

  try {
    await connectDb();
    const articles = await Article.find({ status: "published" })
      .select("slug title featuredImage contentBlocks categorySlug subcategorySlug")
      .lean();

    for (const raw of articles as Record<string, unknown>[]) {
      const slug = String(raw.slug ?? "");
      const title = String(raw.title ?? "");
      const catSlug = String(raw.categorySlug ?? "");
      const subSlug = raw.subcategorySlug != null ? String(raw.subcategorySlug) : "";
      const galleryCat = mapCategoryToGallery(catSlug, subSlug);

      const pushImg = (url: string, alt: string) => {
        const u = url.trim();
        if (!u) return;
        add({
          src: u,
          alt: alt || title,
          category: galleryCat,
          articleSlug: slug,
          articleTitle: title,
          source: "article",
        });
      };

      const fi = raw.featuredImage;
      if (typeof fi === "string" && fi.trim()) {
        pushImg(fi, title ? `${title} — featured` : "Article image");
      }

      const blocks = raw.contentBlocks;
      if (Array.isArray(blocks)) {
        for (const b of blocks) {
          if (!b || typeof b !== "object") continue;
          const block = b as Record<string, unknown>;
          if (block.type === "image" && typeof block.content === "string" && block.content.trim()) {
            const alt = typeof block.alt === "string" && block.alt.trim() ? block.alt : title;
            pushImg(block.content, alt);
          }
        }
      }
    }

    const uploads = await MediaUpload.find({ showInGallery: true }).select("url alt galleryCategory").lean();

    for (const raw of uploads as { url?: string; alt?: string; galleryCategory?: string }[]) {
      const url = String(raw.url ?? "").trim();
      if (!url) continue;
      add({
        src: url,
        alt: (raw.alt && String(raw.alt)) || "Gallery image",
        category: normalizeGalleryCategory(raw.galleryCategory),
        source: "upload",
      });
    }
  } catch {
    /* DB unavailable: still return local assets */
  }

  return [...bySrc.values()];
});
