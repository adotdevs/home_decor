import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { estimateReadingTime, toSlug } from "@/lib/utils/content";
import { seedArticles, articlesByTagSlug, allSeedTags } from "@/data/seed-content";

export async function listPublishedArticles(limit = 12) {
  try {
    await connectDb();
    const rows = await Article.find({ status: "published" }).sort({ publishedAt: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return seedArticles.slice(0, limit);
  }
}

export async function listTrendingArticles(limit = 10) {
  try {
    await connectDb();
    const rows = await Article.find({ status: "published" }).sort({ popularityScore: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [...seedArticles].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)).slice(0, limit);
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    await connectDb();
    const row = await Article.findOne({ slug, status: "published" }).lean();
    return row ? JSON.parse(JSON.stringify(row)) : null;
  } catch {
    return seedArticles.find((x) => x.slug === slug) || null;
  }
}

export async function listArticlesByTagPath(tagPathSlug: string, limit = 30) {
  const labels = allSeedTags().filter((t) => toSlug(t) === tagPathSlug);
  try {
    await connectDb();
    const q = labels.length
      ? { status: "published" as const, tags: { $in: labels } }
      : { status: "published" as const, tags: new RegExp(tagPathSlug.replace(/-/g, "[- ]"), "i") };
    const rows = await Article.find(q).sort({ publishedAt: -1 }).limit(limit).lean();
    const parsed = JSON.parse(JSON.stringify(rows));
    if (parsed.length) return parsed;
  } catch {
    /* fallback */
  }
  return articlesByTagSlug(tagPathSlug).slice(0, limit);
}

export async function upsertArticle(payload: Record<string, unknown>) {
  await connectDb();
  const title = String(payload.title || "Untitled");
  const slug = String(payload.slug || toSlug(title));
  const reading = estimateReadingTime(JSON.stringify(payload.contentBlocks || ""));
  return Article.findOneAndUpdate({ slug }, { ...payload, slug, readingTime: reading, publishedAt: payload.status === "published" ? new Date() : null }, { upsert: true, new: true });
}

type ArticleLike = { slug?: string; categorySlug?: string; tags?: string[] };

export async function getRelatedArticles(article: ArticleLike, limit = 5) {
  const slug = article.slug;
  const cat = article.categorySlug;
  const tags = article.tags || [];

  try {
    await connectDb();
    const exclude = slug ? { slug: { $ne: slug } } : {};
    const sameCat = await Article.find({ status: "published", categorySlug: cat, ...exclude })
      .sort({ popularityScore: -1 })
      .limit(limit)
      .lean();
    let rows = JSON.parse(JSON.stringify(sameCat));
    if (rows.length < limit) {
      const more = await Article.find({ status: "published", ...exclude })
        .sort({ popularityScore: -1 })
        .limit(limit - rows.length)
        .lean();
      rows = [...rows, ...JSON.parse(JSON.stringify(more))];
    }
    return rows.slice(0, limit);
  } catch {
    const pool = seedArticles.filter((a) => a.slug !== slug);
    const same = pool.filter((a) => a.categorySlug === cat);
    const tagMatch = pool.filter((a) => tags.some((t) => (a.tags || []).includes(t)));
    const merged = [...same, ...tagMatch, ...pool];
    const seen = new Set<string>();
    return merged.filter((a) => (seen.has(a.slug) ? false : (seen.add(a.slug), true))).slice(0, limit);
  }
}