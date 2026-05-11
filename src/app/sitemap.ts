export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils/seo";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { categoryTree, seasonalInspiration } from "@/config/site";
import { allSeedTags, tagToPathSlug, seedArticles } from "@/data/seed-content";
import { topicHubs } from "@/config/curations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  ].map((url) => ({ url: absoluteUrl(url), lastModified: now }));

  const seasonal = seasonalInspiration.map((s) => ({
    url: absoluteUrl(`/inspiration/seasonal/${s.slug}`),
    lastModified: now,
  }));

  const tagUrls = allSeedTags().map((t) => ({
    url: absoluteUrl(`/tag/${tagToPathSlug(t)}`),
    lastModified: now,
  }));

  const categoryUrls = categoryTree.flatMap((c) => [
    { url: absoluteUrl(`/category/${c.slug}`), lastModified: now },
    ...c.subcategories.map((sub) => ({
      url: absoluteUrl(`/category/${c.slug}/${sub}`),
      lastModified: now,
    })),
  ]);

  const topicUrls = topicHubs.map((t) => ({
    url: absoluteUrl(`/topics/${t.slug}`),
    lastModified: now,
  }));

  let articleUrls: MetadataRoute.Sitemap = [];
  try {
    await connectDb();
    const articles = await Article.find({ status: "published" }).select("slug updatedAt").lean();
    articleUrls = articles.map((a: { slug: string; updatedAt?: Date }) => ({
      url: absoluteUrl(`/article/${a.slug}`),
      lastModified: a.updatedAt || now,
    }));
  } catch {
    articleUrls = seedArticles.map((a) => ({
      url: absoluteUrl(`/article/${a.slug}`),
      lastModified: now,
    }));
  }

  return [...core, ...seasonal, ...tagUrls, ...categoryUrls, ...topicUrls, ...articleUrls];
}
