import { cache } from "react";
import { categoryHeroImage } from "@/config/images";
import {
  buildAutoImageAlt,
  extractFilenameStem,
  sanitizeAltText,
  wordsFromSlug,
  resolveCategoryBannerAlt,
} from "@/lib/image-alt";
import { connectDb } from "@/lib/db";
import type {
  CategoryHubPageCopy,
  CategoryHubPageCopyDb,
  SubcategoryHubPageCopy,
} from "@/lib/category-hub-defaults";
import {
  mergeSubHubPageCopy,
  mergeTopHubPageCopy,
} from "@/lib/category-hub-defaults";
import { filterTopLevelBySlug, filterTopLevelBySlugs } from "@/lib/mongodb/category-scope";
import { Category } from "@/models/Category";

export type CategoryHubEditorial = {
  title: string;
  dek: string;
  advice: string;
  searches: string[];
};

export type CategoryTreeSub = { name: string; slug: string };
export type CategoryTreeTop = { name: string; slug: string; subcategories: CategoryTreeSub[] };

type CategoryRow = { name: string; slug: string; parentSlug?: string | null; sortOrder?: number };

/** Navigation + admin tree from MongoDB only. Run `npm run seed` (or Admin → categories) to populate. */
export const getCategoryTree = cache(async (): Promise<CategoryTreeTop[]> => {
  try {
    await connectDb();
    const rows = (await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean()) as CategoryRow[];
    if (!rows.length) return [];

    const tops = rows.filter((r) => r.parentSlug == null || r.parentSlug === "");
    const subs = rows.filter((r) => r.parentSlug != null && r.parentSlug !== "");

    const subsByParent = new Map<string, CategoryRow[]>();
    for (const s of subs) {
      const p = String(s.parentSlug);
      if (!subsByParent.has(p)) subsByParent.set(p, []);
      subsByParent.get(p)!.push(s);
    }
    for (const [, list] of subsByParent) {
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
    }

    tops.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));

    return tops.map((t) => ({
      name: t.name,
      slug: t.slug,
      subcategories: (subsByParent.get(t.slug) || []).map((s) => ({ name: s.name, slug: s.slug })),
    }));
  } catch {
    return [];
  }
});

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

function defaultHubEditorialFromDisplay(displayName: string): CategoryHubEditorial {
  const label = displayName.trim() || "this room";
  return {
    title: `${label} ideas with editorial polish`,
    dek: `Explore realistic styling guides, room playbooks, and Pinterest-friendly inspiration for ${label}.`,
    advice: "Start with function, refine scale, repeat your palette, and use texture to make the room feel collected.",
    searches: [`${label} ideas`, "home decor inspiration", "modern interior styling"],
  };
}

function mergeTopHubEditorial(
  hub: Partial<CategoryHubEditorial> | null | undefined,
  fallback: CategoryHubEditorial,
): CategoryHubEditorial {
  if (hub?.title?.trim() && hub?.dek?.trim()) {
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
  return fallback;
}

export type TopCategoryHubPayload = {
  slug: string;
  displayName: string;
  editorial: CategoryHubEditorial;
  pageCopy: CategoryHubPageCopy;
};

export type SubCategoryHubEditorial = { headline: string; dek: string; tip: string };

export type SubCategoryHubPayload = {
  parentSlug: string;
  subSlug: string;
  categoryDisplayName: string;
  subDisplayName: string;
  editorial: SubCategoryHubEditorial;
  pageCopy: SubcategoryHubPageCopy;
};

function defaultSubHubEditorial(categoryDisplayName: string, subDisplayName: string): SubCategoryHubEditorial {
  const cat = categoryDisplayName.trim() || "this space";
  const sub = subDisplayName.trim() || "this topic";
  const subLower = sub.toLowerCase();
  return {
    headline: `${sub} ideas for a ${cat} that feels intentional`,
    dek: `This hub gathers long-form editorial guides for ${subLower} inside ${cat}. Expect realistic color palettes, material notes, styling formulas, layout advice, and FAQ answers written for homes that are actually lived in.`,
    tip: `Before you buy anything, decide what ${subLower} needs to solve: softness, storage, light, rhythm, height, or a clearer focal point. The most beautiful rooms usually start with one precise problem solved beautifully.`,
  };
}

function mergeSubHubEditorial(
  hub: Partial<CategoryHubEditorial> | null | undefined,
  fallback: SubCategoryHubEditorial,
): SubCategoryHubEditorial {
  if (hub?.title?.trim() && hub?.dek?.trim()) {
    return {
      headline: hub.title.trim(),
      dek: hub.dek.trim(),
      tip: hub.advice?.trim() || fallback.tip,
    };
  }
  return fallback;
}

/** Active top-level category hub for `/category/[slug]`. Null if the category does not exist or is inactive. */
export const loadTopCategoryHubPayload = cache(async (categorySlug: string): Promise<TopCategoryHubPayload | null> => {
  try {
    await connectDb();
    const doc = await Category.findOne({ ...filterTopLevelBySlug(categorySlug), isActive: true })
      .select("name slug hubEditorial hubPageCopy")
      .lean();
    if (!doc) return null;
    const d = doc as {
      name?: string;
      slug: string;
      hubEditorial?: Partial<CategoryHubEditorial> | null;
      hubPageCopy?: CategoryHubPageCopyDb | null;
    };
    const displayName = d.name?.trim() || wordsFromSlug(categorySlug);
    const editorialFallback = defaultHubEditorialFromDisplay(displayName);
    const editorial = mergeTopHubEditorial(d.hubEditorial, editorialFallback);
    const pageCopy = mergeTopHubPageCopy(displayName, d.hubPageCopy);
    return { slug: categorySlug, displayName, editorial, pageCopy };
  } catch {
    return null;
  }
});

/** Active subcategory hub. Null if parent or subcategory is missing or inactive. */
export const loadSubCategoryHubPayload = cache(
  async (parentSlug: string, subSlug: string): Promise<SubCategoryHubPayload | null> => {
    try {
      await connectDb();
      const [parent, sub] = await Promise.all([
        Category.findOne({ ...filterTopLevelBySlug(parentSlug), isActive: true }).select("name slug").lean(),
        Category.findOne({ slug: subSlug, parentSlug, isActive: true })
          .select("name slug hubEditorial hubPageCopy")
          .lean(),
      ]);
      if (!parent || !sub) return null;
      const p = parent as { name?: string; slug: string };
      const s = sub as {
        name?: string;
        slug: string;
        hubEditorial?: Partial<CategoryHubEditorial> | null;
        hubPageCopy?: CategoryHubPageCopyDb | null;
      };
      const categoryDisplayName = p.name?.trim() || wordsFromSlug(parentSlug);
      const subDisplayName = s.name?.trim() || wordsFromSlug(subSlug);
      const editorialFallback = defaultSubHubEditorial(categoryDisplayName, subDisplayName);
      const editorial = mergeSubHubEditorial(s.hubEditorial, editorialFallback);
      const pageCopy = mergeSubHubPageCopy(categoryDisplayName, subDisplayName, s.hubPageCopy);
      return {
        parentSlug,
        subSlug,
        categoryDisplayName,
        subDisplayName,
        editorial,
        pageCopy,
      };
    } catch {
      return null;
    }
  },
);

/** Hub hero copy for `/category/[slug]` — only for known categories; use `loadTopCategoryHubPayload` on public routes. */
export const resolveCategoryHubEditorial = cache(async (categorySlug: string): Promise<CategoryHubEditorial> => {
  const payload = await loadTopCategoryHubPayload(categorySlug);
  if (payload) return payload.editorial;
  return defaultHubEditorial(categorySlug);
});

export async function getCategories() {
  try {
    await connectDb();
    const rows = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [];
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
  const tree = await getCategoryTree();
  const slugs = tree.map((c) => c.slug);
  const bySlug = new Map<string, { image?: string; imageAlt?: string; imageAutoAlt?: string }>();
  try {
    await connectDb();
    const rows = await Category.find({ ...filterTopLevelBySlugs(slugs) })
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
  return tree.map((c) => {
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
  const tree = await getCategoryTree();
  const treeRow = tree.find((c) => c.slug === categorySlug);
  let displayName = treeRow?.name ?? wordsFromSlug(categorySlug);
  let src = categoryHeroImage(categorySlug);
  let imageAlt = "";
  let imageAutoAlt = "";
  try {
    await connectDb();
    const doc = await Category.findOne({ ...filterTopLevelBySlug(categorySlug), isActive: true })
      .select("name image imageAlt imageAutoAlt")
      .lean();
    if (doc) {
      const d = doc as { name?: string; image?: string; imageAlt?: string; imageAutoAlt?: string };
      if (d.name?.trim()) displayName = d.name.trim();
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
  const cat = await Category.findOne(filterTopLevelBySlug(slug));
  if (!cat) throw new Error("Category not found");
  const doc = cat as { name?: string };
  const display = doc.name?.trim() || wordsFromSlug(slug);
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
