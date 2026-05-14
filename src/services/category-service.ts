import { cache } from "react";
import { categoryTree } from "@/config/site";
import { categoryHeroImage } from "@/config/images";
import {
  buildAutoImageAlt,
  extractFilenameStem,
  sanitizeAltText,
  wordsFromSlug,
  resolveCategoryBannerAlt,
} from "@/lib/image-alt";
import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";

export type CategoryHubEditorial = {
  title: string;
  dek: string;
  advice: string;
  searches: string[];
};

function prettyCategoryLabel(categorySlug: string) {
  return categorySlug.replaceAll("-", " ");
}

function defaultHubEditorial(categorySlug: string): CategoryHubEditorial {
  const label = prettyCategoryLabel(categorySlug);
  return {
    title: `${label} ideas with editorial polish`,
    dek: `Explore realistic styling guides, room playbooks, and Pinterest-friendly inspiration for ${label}.`,
    advice: "Start with function, refine scale, repeat your palette, and use texture to make the room feel collected.",
    searches: [`${label} ideas`, "home decor inspiration", "modern interior styling"],
  };
}

/** Hub hero copy for `/category/[slug]` — from Mongo when present, else generic fallback. */
export const resolveCategoryHubEditorial = cache(async (categorySlug: string): Promise<CategoryHubEditorial> => {
  try {
    await connectDb();
    const doc = await Category.findOne({ slug: categorySlug, parentSlug: null, isActive: true })
      .select("hubEditorial")
      .lean();
    const hub = doc && (doc as { hubEditorial?: Partial<CategoryHubEditorial> }).hubEditorial;
    if (hub?.title?.trim() && hub?.dek?.trim()) {
      const fallback = defaultHubEditorial(categorySlug);
      return {
        title: hub.title.trim(),
        dek: hub.dek.trim(),
        advice: hub.advice?.trim() || fallback.advice,
        searches:
          Array.isArray(hub.searches) && hub.searches.length > 0
            ? hub.searches.map((s: unknown) => String(s).trim()).filter(Boolean)
            : fallback.searches,
      };
    }
  } catch {
    /* use fallback */
  }
  return defaultHubEditorial(categorySlug);
});

export async function getCategories() {
  try {
    await connectDb();
    const rows = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return categoryTree.map((x) => ({ name: x.name, slug: x.slug, parentSlug: null, isActive: true }));
  }
}

export type HomeCategoryCard = {
  slug: string;
  name: string;
  subcategoryCount: number;
  image: string;
  /** Resolved alt for SEO / accessibility */
  imageAlt: string;
};

/** Cards for “Shop the rooms — by category” on the homepage. */
export const getHomeCategoryCards = cache(async (): Promise<HomeCategoryCard[]> => {
  const slugs = categoryTree.map((c) => c.slug);
  const bySlug = new Map<string, { image?: string; imageAlt?: string; imageAutoAlt?: string }>();
  try {
    await connectDb();
    const rows = await Category.find({ parentSlug: null, slug: { $in: slugs } })
      .select("slug image imageAlt imageAutoAlt")
      .lean();
    for (const r of rows) {
      const row = r as { slug: string; image?: string; imageAlt?: string; imageAutoAlt?: string };
      bySlug.set(row.slug, {
        image: row.image,
        imageAlt: row.imageAlt,
        imageAutoAlt: row.imageAutoAlt,
      });
    }
  } catch {
    /* fall through to defaults */
  }
  return categoryTree.map((c) => {
    const fallbackImg = categoryHeroImage(c.slug);
    const row = bySlug.get(c.slug);
    const img = row?.image?.trim() || fallbackImg;
    const imageAlt = resolveCategoryBannerAlt({
      categorySlug: c.slug,
      categoryDisplayName: c.name,
      imageAlt: row?.imageAlt,
      imageAutoAlt: row?.imageAutoAlt,
      heroImageUrl: img,
    });
    return {
      slug: c.slug,
      name: c.name,
      subcategoryCount: c.subcategories.length,
      image: img,
      imageAlt,
    };
  });
});

export type CategoryHeroVisual = { src: string; alt: string; displayName: string };

export const resolveCategoryHeroVisual = cache(async (categorySlug: string): Promise<CategoryHeroVisual> => {
  const tree = categoryTree.find((c) => c.slug === categorySlug);
  const displayName = tree?.name ?? wordsFromSlug(categorySlug);
  let src = categoryHeroImage(categorySlug);
  let imageAlt = "";
  let imageAutoAlt = "";
  try {
    await connectDb();
    const doc = await Category.findOne({ slug: categorySlug, parentSlug: null, isActive: true })
      .select("image imageAlt imageAutoAlt")
      .lean();
    if (doc) {
      const d = doc as { image?: string; imageAlt?: string; imageAutoAlt?: string };
      if (d.image?.trim()) src = d.image.trim();
      imageAlt = String(d.imageAlt ?? "");
      imageAutoAlt = String(d.imageAutoAlt ?? "");
    }
  } catch {
    /* */
  }
  const alt = resolveCategoryBannerAlt({
    categorySlug,
    categoryDisplayName: displayName,
    imageAlt,
    imageAutoAlt,
    heroImageUrl: src,
  });
  return { src, alt, displayName };
});

/** Hub hero on category pages — `Category.image` when set, else built-in map. */
export const resolveCategoryHeroImage = cache(async (categorySlug: string): Promise<string> => {
  const v = await resolveCategoryHeroVisual(categorySlug);
  return v.src;
});

export async function setTopLevelCategoryCardImage(
  slug: string,
  image: string | null,
  opts?: { imageAlt?: string | null },
): Promise<void> {
  await connectDb();
  const trimmed = image?.trim() || "";
  const cat = await Category.findOne({ slug, parentSlug: null });
  if (!cat) throw new Error("Category not found");
  const tree = categoryTree.find((c) => c.slug === slug);
  const display = tree?.name ?? wordsFromSlug(slug);
  if (!trimmed) {
    await Category.updateOne({ _id: cat._id }, { $unset: { image: 1, imageAlt: 1, imageAutoAlt: 1 } });
    return;
  }
  const manual = sanitizeAltText(String(opts?.imageAlt ?? ""));
  const auto = buildAutoImageAlt(
    {
      articleTitle: `${display} decor ideas and styling guides`,
      categorySlug: slug,
      filenameHint: extractFilenameStem(trimmed),
    },
    trimmed,
  );
  await Category.updateOne(
    { _id: cat._id },
    { $set: { image: trimmed, imageAlt: manual, imageAutoAlt: auto } },
  );
}