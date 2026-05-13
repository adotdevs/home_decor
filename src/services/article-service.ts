import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { estimateReadingTime, toSlug } from "@/lib/utils/content";
import { isArticleExcludedFromTrending, parseExcludeFromTrendingFlag } from "@/lib/utils/exclude-from-trending";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Articles only store image URL strings in MongoDB — never binary or base64.
 * Actual bytes live on disk (`public/uploads/...`) or on a CDN; the browser loads those URLs, not the DB.
 */
function sanitizeImageUrlField(v: unknown, fieldLabel: string): string | undefined {
  if (v == null || v === "") return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (s.startsWith("data:")) {
    throw new Error(
      `${fieldLabel}: use Upload image so the file is stored under /uploads — data URLs are not stored in the database.`,
    );
  }
  if (s.length > 4096) {
    throw new Error(`${fieldLabel}: URL is too long.`);
  }
  if (/[\r\n<>]/.test(s)) {
    throw new Error(`${fieldLabel}: invalid URL characters.`);
  }
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }
  throw new Error(
    `${fieldLabel}: must be a site path (e.g. /uploads/...) or https URL — not raw image data.`,
  );
}

function sanitizeContentBlocksImageUrls(blocks: unknown): unknown {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((b, i) => {
    if (!b || typeof b !== "object") return b;
    const row = b as Record<string, unknown>;
    if (row.type === "image" && typeof row.content === "string" && row.content.trim()) {
      const url = sanitizeImageUrlField(row.content, `Content block ${i + 1} (image)`);
      return { ...row, content: url ?? "" };
    }
    return b;
  });
}

function clampStr(s: unknown, max: number): string | undefined {
  if (s == null) return undefined;
  const t = String(s).trim();
  if (!t) return undefined;
  return t.length > max ? t.slice(0, max) : t;
}

function normalizeFaq(raw: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { question: string; answer: string }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const question = String(o.question ?? "").trim();
    const answer = String(o.answer ?? "").trim();
    if (!question && !answer) continue;
    out.push({ question, answer });
    if (out.length >= 40) break;
  }
  return out;
}

function normalizeInternalLinks(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((s) => String(s).trim()).filter(Boolean))].slice(0, 40);
  }
  if (typeof raw === "string") {
    return [
      ...new Set(
        raw
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ].slice(0, 40);
  }
  return [];
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean).slice(0, 50);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 50);
  }
  return [];
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
  | { results: Record<string, unknown>[]; totalApprox: number; source: "db" };

async function distinctTagLabelsMatchingSlug(tagPathSlug: string): Promise<string[]> {
  await connectDb();
  const distinct = await Article.distinct("tags", { status: "published" });
  return [...new Set((distinct as string[]).map((t) => String(t).trim()).filter(Boolean))].filter(
    (t) => toSlug(t) === tagPathSlug,
  );
}

/** Distinct tag labels from published articles (for /tags, metadata, sitemap). */
export async function listDistinctPublishedTags(): Promise<string[]> {
  try {
    await connectDb();
    const distinct = await Article.distinct("tags", { status: "published" });
    return [...new Set((distinct as string[]).map((t) => String(t).trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
  } catch {
    return [];
  }
}

export async function searchArticles(params: SearchParams): Promise<SearchResponse> {
  const q = params.q.trim();
  const limit = Math.min(Math.max(params.limit ?? 24, 1), 60);
  const skip = Math.max(params.skip ?? 0, 0);

  if (params.suggest) {
    if (q.length < 2) return { suggestions: [] };
    try {
      await connectDb();
      const rx = new RegExp(escapeRegex(q), "i");
      const articles = await Article.find({ status: "published", title: rx }).select("title").limit(12).lean();
      const fromDb = (articles as { title?: string }[]).map((a) => a.title || "").filter(Boolean);
      return { suggestions: [...new Set(fromDb)].slice(0, 12) };
    } catch {
      return { suggestions: [] };
    }
  }

  if (!q) return { results: [], totalApprox: 0, source: "db" };

  const baseFilter: Record<string, unknown> = { status: "published" };
  if (params.categorySlug) baseFilter.categorySlug = params.categorySlug;
  if (params.tagSlug) {
    try {
      const labels = await distinctTagLabelsMatchingSlug(params.tagSlug);
      baseFilter.tags = labels.length
        ? { $in: labels }
        : new RegExp(params.tagSlug.replace(/-/g, "[- ]"), "i");
    } catch {
      baseFilter.tags = new RegExp(params.tagSlug.replace(/-/g, "[- ]"), "i");
    }
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
    /* no offline article library */
  }

  return { results: [], totalApprox: 0, source: "db" };
}

export async function listPublishedArticles(limit = 12) {
  try {
    await connectDb();
    const rows = await Article.find({ status: "published" }).sort({ publishedAt: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [];
  }
}

export async function articlesBySlugsOrdered(slugs: string[]) {
  const clean = [...new Set(slugs.map((s) => String(s || "").trim()).filter(Boolean))];
  if (!clean.length) return [];
  try {
    await connectDb();
    const found = await Article.find({ slug: { $in: clean }, status: "published" }).lean();
    const map = new Map(found.map((a) => [a.slug, JSON.parse(JSON.stringify(a))]));
    return clean.map((s) => map.get(s)).filter(Boolean) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

export async function listPublishedArticlesChronological(skip = 0, limit = 12, excludeSlugs: string[] = []) {
  const ex = [...new Set(excludeSlugs.map((s) => String(s || "").trim()).filter(Boolean))];
  const s = Math.max(0, skip);
  const l = Math.min(Math.max(limit, 1), 60);
  try {
    await connectDb();
    const q: Record<string, unknown> = { status: "published" };
    if (ex.length) q.slug = { $nin: ex };
    const rows = await Article.find(q).sort({ publishedAt: -1 }).skip(s).limit(l).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [];
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
    return [];
  }
}

export async function listTrendingArticles(limit = 10) {
  try {
    await connectDb();
    /** Strictly drop “exclude” in any legacy shape (boolean, string, number). */
    const baseFilter: Record<string, unknown> = {
      status: "published",
      $nor: [
        { excludeFromTrending: true },
        { excludeFromTrending: 1 },
        { excludeFromTrending: "true" },
        { excludeFromTrending: "1" },
        { excludeFromTrending: "yes" },
      ],
    };

    /** Ranks are 0–9999; use range so older MongoDB builds don’t need $type: "number" (unsupported on some versions). */
    const manual = await Article.find({
      ...baseFilter,
      trendingRank: { $gte: 0, $lte: 9999 },
    })
      .sort({ trendingRank: 1 as const })
      .limit(limit)
      .lean();
    const manualParsed = JSON.parse(JSON.stringify(manual)) as { slug?: string; excludeFromTrending?: unknown }[];
    const manualFiltered = manualParsed.filter((a) => !isArticleExcludedFromTrending(a.excludeFromTrending));
    const used = new Set(manualFiltered.map((a) => a.slug).filter(Boolean));
    const need = Math.max(0, limit - manualFiltered.length);
    let auto: Record<string, unknown>[] = [];
    if (need > 0) {
      const autoRows = await Article.find({
        ...baseFilter,
        slug: { $nin: [...used] },
        $or: [
          { trendingRank: { $exists: false } },
          { trendingRank: null },
          { trendingRank: { $lt: 0 } },
          { trendingRank: { $gt: 9999 } },
        ],
      })
        .sort({ popularityScore: -1 as const, publishedAt: -1 as const })
        .limit(need)
        .lean();
      auto = JSON.parse(JSON.stringify(autoRows)) as Record<string, unknown>[];
    }
    const autoFiltered = auto.filter((a) => !isArticleExcludedFromTrending(a.excludeFromTrending));
    return [...manualFiltered, ...autoFiltered].slice(0, limit);
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    await connectDb();
    const row = await Article.findOne({ slug, status: "published" }).lean();
    return row ? JSON.parse(JSON.stringify(row)) : null;
  } catch {
    return null;
  }
}

export async function listArticlesByTagPath(tagPathSlug: string, limit = 30) {
  try {
    await connectDb();
    const labels = await distinctTagLabelsMatchingSlug(tagPathSlug);
    const q = labels.length
      ? { status: "published" as const, tags: { $in: labels } }
      : { status: "published" as const, tags: new RegExp(tagPathSlug.replace(/-/g, "[- ]"), "i") };
    const rows = await Article.find(q).sort({ publishedAt: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return [];
  }
}

export async function upsertArticle(payload: Record<string, unknown>) {
  await connectDb();
  const title = String(payload.title || "Untitled");
  const slug = String(payload.slug || toSlug(title));
  const existing = await Article.findOne({ slug }).lean();
  const ex = existing ? (JSON.parse(JSON.stringify(existing)) as Record<string, unknown>) : null;

  const reading = estimateReadingTime(JSON.stringify(payload.contentBlocks || ""));
  let scheduled: Date | null = null;
  if (payload.scheduledPublishAt) {
    const d = new Date(String(payload.scheduledPublishAt));
    scheduled = Number.isNaN(d.getTime()) ? null : d;
  }

  const status = payload.status === "published" ? "published" : "draft";

  let publishedAt: Date | null = null;
  if (status === "published") {
    if (payload.publishedAt) {
      const d = new Date(String(payload.publishedAt));
      if (!Number.isNaN(d.getTime())) publishedAt = d;
    }
    if (!publishedAt && ex?.publishedAt) {
      publishedAt = new Date(String(ex.publishedAt));
    }
    if (!publishedAt) {
      publishedAt = new Date();
    }
  }

  const contentBlocks = sanitizeContentBlocksImageUrls(payload.contentBlocks);

  const trRaw = payload.trendingRank;
  const trendingRankValue =
    trRaw != null && String(trRaw).trim() !== "" && Number.isFinite(Number(trRaw))
      ? Math.min(9999, Math.max(0, Math.floor(Number(trRaw))))
      : null;
  const excludeFromTrending = parseExcludeFromTrendingFlag(payload.excludeFromTrending);

  let popularityScore = 0;
  if (
    payload.popularityScore != null &&
    String(payload.popularityScore).trim() !== "" &&
    Number.isFinite(Number(payload.popularityScore))
  ) {
    popularityScore = Math.max(0, Math.min(1e9, Number(payload.popularityScore)));
  } else if (typeof ex?.popularityScore === "number") {
    popularityScore = ex.popularityScore;
  }

  const categorySlug = String(payload.categorySlug || ex?.categorySlug || "bedroom");
  const subRaw = payload.subcategorySlug != null ? String(payload.subcategorySlug).trim() : "";
  const subFallback = ex?.subcategorySlug != null ? String(ex.subcategorySlug).trim() : "";
  const subcategorySlug = subRaw || subFallback || undefined;

  const authorSlugRaw = clampStr(payload.authorSlug, 200);
  const authorSlug =
    authorSlugRaw != null ? authorSlugRaw.toLowerCase().replace(/\s+/g, "-") : undefined;

  const unsetFields: Record<string, 1> = {};
  const setDoc: Record<string, unknown> = {
    title,
    slug,
    excerpt: clampStr(payload.excerpt, 8000) ?? "",
    contentBlocks,
    categorySlug,
    tags: normalizeTags(payload.tags),
    faq: normalizeFaq(payload.faq),
    internalLinks: normalizeInternalLinks(payload.internalLinks),
    status,
    readingTime: reading,
    excludeFromTrending,
    popularityScore,
    publishedAt,
    scheduledPublishAt: status === "draft" ? scheduled : null,
  };

  if ("featuredImage" in payload) {
    const fi = sanitizeImageUrlField(payload.featuredImage, "Featured image");
    if (fi) setDoc.featuredImage = fi;
    else unsetFields.featuredImage = 1;
  }

  if (subcategorySlug) {
    setDoc.subcategorySlug = subcategorySlug;
  } else {
    unsetFields.subcategorySlug = 1;
  }

  const authName = clampStr(payload.authorName, 200);
  if (authName) setDoc.authorName = authName;
  else unsetFields.authorName = 1;

  if (authorSlug) setDoc.authorSlug = authorSlug;
  else unsetFields.authorSlug = 1;

  const st = clampStr(payload.seoTitle, 220);
  if (st) setDoc.seoTitle = st;
  else unsetFields.seoTitle = 1;

  const sd = clampStr(payload.seoDescription, 520);
  if (sd) setDoc.seoDescription = sd;
  else unsetFields.seoDescription = 1;

  const fk = clampStr(payload.focusKeyword, 120);
  if (fk) setDoc.focusKeyword = fk;
  else unsetFields.focusKeyword = 1;

  if (trendingRankValue !== null) {
    setDoc.trendingRank = trendingRankValue;
  } else {
    unsetFields.trendingRank = 1;
  }

  const update: Record<string, unknown> = { $set: setDoc };
  if (Object.keys(unsetFields).length) {
    update.$unset = unsetFields;
  }

  return Article.findOneAndUpdate({ slug }, update as object, { upsert: true, new: true });
}

export type TrendingAdminRow = {
  slug: string;
  title: string;
  status: string;
  trendingRank?: number | null;
  excludeFromTrending?: boolean;
  popularityScore?: number;
  publishedAt?: string | null;
  featuredImage?: string;
};

export async function listArticlesForTrendingAdmin(): Promise<TrendingAdminRow[]> {
  await connectDb();
  const rows = await Article.find({})
    .select("slug title status trendingRank excludeFromTrending popularityScore publishedAt featuredImage")
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();
  const parsed = JSON.parse(JSON.stringify(rows)) as Record<string, unknown>[];
  return parsed.map((doc) => ({
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    status: String(doc.status ?? ""),
    trendingRank:
      doc.trendingRank != null && doc.trendingRank !== "" && Number.isFinite(Number(doc.trendingRank))
        ? Math.floor(Number(doc.trendingRank))
        : null,
    excludeFromTrending: parseExcludeFromTrendingFlag(doc.excludeFromTrending),
    popularityScore: Number.isFinite(Number(doc.popularityScore)) ? Number(doc.popularityScore) : 0,
    publishedAt: doc.publishedAt != null ? String(doc.publishedAt) : null,
    featuredImage: doc.featuredImage != null ? String(doc.featuredImage) : undefined,
  }));
}

export type TrendingBatchItem = {
  slug: string;
  trendingRank?: number | null;
  excludeFromTrending?: boolean;
  popularityScore?: number | null;
};

export async function applyTrendingAdminUpdates(items: TrendingBatchItem[]) {
  await connectDb();
  const ops: Parameters<typeof Article.bulkWrite>[0] = [];

  for (const item of items) {
    const slug = String(item.slug || "").trim();
    if (!slug) continue;

    const $set: Record<string, unknown> = {};
    const $unset: Record<string, 1> = {};

    if ("excludeFromTrending" in item) {
      $set.excludeFromTrending = parseExcludeFromTrendingFlag(item.excludeFromTrending);
    }

    if (
      "popularityScore" in item &&
      item.popularityScore != null &&
      String(item.popularityScore).trim() !== "" &&
      Number.isFinite(Number(item.popularityScore))
    ) {
      $set.popularityScore = Math.max(0, Math.min(1e9, Number(item.popularityScore)));
    }

    if ("trendingRank" in item) {
      const tr = item.trendingRank;
      if (tr != null && String(tr).trim() !== "" && Number.isFinite(Number(tr))) {
        $set.trendingRank = Math.min(9999, Math.max(0, Math.floor(Number(tr))));
      } else {
        $unset.trendingRank = 1;
      }
    }

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) continue;

    const update: Record<string, unknown> = {};
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;

    ops.push({
      updateOne: {
        filter: { slug },
        update: update as object,
      },
    });
  }

  if (ops.length > 0) {
    await Article.bulkWrite(ops);
  }
}

export async function deleteArticleBySlug(slug: string) {
  await connectDb();
  if (!slug.trim()) {
    throw new Error("Missing article slug");
  }
  return Article.findOneAndDelete({ slug: slug.trim() });
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
    return [];
  }
}