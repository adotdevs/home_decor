export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { tagToPathSlug } from "@/data/tag-utils";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { absoluteUrl } from "@/lib/utils/seo";
import { getResolvedSiteBranding, getSeasonalInspirationResolved } from "@/services/site-settings-service";
import { getCategoryTree } from "@/services/category-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [base, seasonalItems, categoryTree] = await Promise.all([
    getResolvedSiteBranding(),
    getSeasonalInspirationResolved(),
    getCategoryTree(),
  ]);
  const now = new Date();
  const core = [
    "",
    "/latest",
    "/trending",
    "/search",
    "/inspiration-gallery",
    "/inspiration/feed",
    "/tags",
    "/newsletter",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
  ].map((url) => ({ url: absoluteUrl(url, base.url), lastModified: now }));

  const seasonal = seasonalItems.map((s) => ({
    url: absoluteUrl(`/inspiration/seasonal/${s.slug}`, base.url),
    lastModified: now,
  }));

  const categoryUrls = categoryTree.flatMap((c) => [
    { url: absoluteUrl(`/category/${c.slug}`, base.url), lastModified: now },
    ...c.subcategories.map((sub) => ({
      url: absoluteUrl(`/category/${c.slug}/${sub.slug}`, base.url),
      lastModified: now,
    })),
  ]);

  let tagUrls: MetadataRoute.Sitemap = [];
  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    await connectDb();
    const tagLabels = await Article.distinct("tags", { status: "published" });
    tagUrls = [...new Set((tagLabels as string[]).map((t) => String(t).trim()).filter(Boolean))].map((t) => ({
      url: absoluteUrl(`/tag/${tagToPathSlug(t)}`, base.url),
      lastModified: now,
    }));
    const articles = await Article.find({ status: "published" }).select("slug updatedAt").lean();
    articleUrls = articles.map((a: { slug: string; updatedAt?: Date }) => ({
      url: absoluteUrl(`/article/${a.slug}`, base.url),
      lastModified: a.updatedAt || now,
    }));
  } catch {
    tagUrls = [];
    articleUrls = [];
  }

  return [...core, ...seasonal, ...tagUrls, ...categoryUrls, ...articleUrls];
}
