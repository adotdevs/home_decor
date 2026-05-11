import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { estimateReadingTime, toSlug } from "@/lib/utils/content";
import { seedArticles, articlesByTagSlug, allSeedTags, searchSeedArticles, suggestSeedTitles } from "@/data/seed-content";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type SearchParams = {
  q: string;
  suggest?: boolean;
  limit?: number;
  skip?: number;
  categorySlug?: string;
  tagSlug?: string;
};

export type SearchResponse =
  | { suggestions: string[] }
  | { results: Record<string, unknown>[]; totalApprox: number; source: "db" | "seed" };

export async function searchArticles(params: SearchParams): Promise<SearchResponse> {
  const q = params.q.trim();
  const limit = Math.min(Math.max(params.limit ?? 24, 1), 60);
  const skip = Math.max(params.skip ?? 0, 0);

  if (params.suggest) {
    if (q.length < 2) return { suggestions: [] };
    let fromDb: string[] = [];
    try {
      await connectDb();
      const rx = new RegExp(escapeRegex(q), "i");
      const articles = await Article.find({ status: "published", title: rx }).select("title").limit(10).lean();
      fromDb = (articles as { title?: string }[]).map((a) => a.title || "").filter(Boolean);
    } catch {
      /* use seed only */
    }
    const fromSeed = suggestSeedTitles(q, 12);
    const merged = [...new Set([...fromDb, ...fromSeed])].slice(0, 12);
    return { suggestions: merged };
  }

  if (!q) return { results: [], totalApprox: 0, source: "seed" };

  const baseFilter: Record<string, unknown> = { status: "published" };
  if (params.categorySlug) baseFilter.categorySlug = params.categorySlug;
  if (params.tagSlug) {
    const labels = allSeedTags().filter((t) => toSlug(t) === params.tagSlug);
    baseFilter.tags = labels.length
      ? { $in: labels }
      : new RegExp(params.tagSlug.replace(/-/g, "[- ]"), "i");
  }

  try {
    await connectDb();
    let rows: Record<string, unknown>[] = [];
    try {
      const textRows = await Article.find({ ...baseFilter, $text: { $search: q } } as object, {
        score: { $meta: "textScore" },
      })
        .sort({ score: { $meta: "textScore" } } as never)
        .skip(skip)
        .limit(limit)
        .lean();
      rows = JSON.parse(JSON.stringify(textRows));
    } catch {
      rows = [];
    }

    if (!rows.length) {
      const rx = new RegExp(escapeRegex(q), "i");
      const fallbackRows = await Article.find({
        ...baseFilter,
        $or: [{ title: rx }, { excerpt: rx }, { tags: rx }, { categorySlug: rx }, { focusKeyword: rx }],
      } as object)
        .sort({ popularityScore: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      rows = JSON.parse(JSON.stringify(fallbackRows));
    }

    if (rows.length) {
      let totalApprox = rows.length + skip;
      try {
        const rx = new RegExp(escapeRegex(q), "i");
        totalApprox = await Article.countDocuments({
          ...baseFilter,
          $or: [{ title: rx }, { excerpt: rx }, { tags: rx }, { categorySlug: rx }],
        } as object);
      } catch {
        totalApprox = rows.length + skip;
      }
      return { results: rows, totalApprox, source: "db" };
    }
  } catch {
    /* seed */
  }

  const seed = searchSeedArticles(q, { limit, skip, categorySlug: params.categorySlug, tagSlug: params.tagSlug });
  return { results: seed as unknown as Record<string, unknown>[], totalApprox: seed.length + skip, source: "seed" };
}

export async function listPublishedArticles(limit = 12) {
  try {
    await connectDb();
    const rows = await Article.find({ status: "published" }).sort({ publishedAt: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return seedArticles.slice(0, limit);
  }
}

export async function listPublishedArticlesRange(skip = 0, limit = 12) {
  const s = Math.max(0, skip);
  const l = Math.min(Math.max(limit, 1), 48);
  try {
    await connectDb();
    const rows = await Article.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .skip(s)
      .limit(l)
      .lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return seedArticles.slice(s, s + l);
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
  const scheduled = payload.scheduledPublishAt ? new Date(String(payload.scheduledPublishAt)) : null;
  return Article.findOneAndUpdate(
    { slug },
    {
      ...payload,
      slug,
      readingTime: reading,
      publishedAt: payload.status === "published" ? new Date() : null,
      scheduledPublishAt: scheduled,
    },
    { upsert: true, new: true },
  );
}

export async function publishDueScheduledArticles() {
  await connectDb();
  const now = new Date();
  const due = await Article.find({
    status: "draft",
    scheduledPublishAt: { $lte: now },
  }).select("slug");
  const slugs = due.map((d) => d.slug);
  if (slugs.length) {
    await Article.updateMany(
      { slug: { $in: slugs } },
      { $set: { status: "published", publishedAt: now }, $unset: { scheduledPublishAt: 1 } },
    );
  }
  return { published: slugs.length, slugs };
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