import { createHash } from "crypto";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleReview } from "@/models/ArticleReview";
import { ReviewHelpfulVote } from "@/models/ReviewHelpfulVote";
import { ReviewRateLimit } from "@/models/ReviewRateLimit";
import { env } from "@/lib/env";
import { generateOwnerToken, hashOwnerToken, safeCompareTokenHash } from "@/lib/review-owner";
import type { ArticleReviewStatus, PublicReview, ReviewSort, ReviewSummary } from "@/types/article-review";

export type { ArticleReviewStatus, PublicReview, ReviewSort, ReviewSummary } from "@/types/article-review";

const MAX_REVIEW_TITLE = 200;
const MAX_REVIEW_TEXT = 5000;
const MAX_USERNAME = 80;
const RATE_LIMIT_PER_HOUR = 5;

function sanitizeLine(s: string, max: number): string {
  return String(s || "")
    .replace(/[\u0000-\u001F<>]/g, " ")
    .trim()
    .slice(0, max);
}

function hashIp(ip: string): string {
  const p = process.env.REVIEW_OWNER_PEPPER || env.JWT_SECRET;
  return createHash("sha256").update(`${p}:ip:${ip}`, "utf8").digest("hex").slice(0, 32);
}

export async function assertReviewRateLimit(ip: string, articleSlug: string): Promise<void> {
  if (!ip || ip === "unknown") return;
  await connectDb();
  const hour = Math.floor(Date.now() / 3600000);
  const key = `rv:${hashIp(ip)}:${articleSlug}:${hour}`;
  const doc = await ReviewRateLimit.findOne({ key });
  if ((doc?.count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    throw new Error("Too many submissions. Please try again later.");
  }
  await ReviewRateLimit.updateOne(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { key } },
    { upsert: true },
  );
}

function sortObject(sort: ReviewSort): Record<string, 1 | -1> {
  switch (sort) {
    case "top_rated":
      return { rating: -1, createdAt: -1 };
    case "helpful":
      return { helpfulCount: -1, createdAt: -1 };
    case "featured":
      return { isPinned: -1, helpfulCount: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

function toPublic(doc: Record<string, unknown>): PublicReview {
  return {
    id: String(doc._id),
    username: String(doc.username),
    rating: Number(doc.rating),
    reviewTitle: String(doc.reviewTitle),
    reviewText: String(doc.reviewText),
    avatarStyle: Number(doc.avatarStyle),
    helpfulCount: Number(doc.helpfulCount ?? 0),
    verified: Boolean(doc.verified),
    isPinned: Boolean(doc.isPinned),
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt as string).toISOString() : new Date().toISOString(),
  };
}

export async function getReviewSummary(articleSlug: string): Promise<ReviewSummary> {
  await connectDb();
  const slug = String(articleSlug || "").trim();
  if (!slug) {
    return { average: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const rows = await ArticleReview.aggregate<{ _id: number; c: number }>([
    { $match: { articleSlug: slug, status: "live" } },
    { $group: { _id: "$rating", c: { $sum: 1 } } },
  ]);
  const breakdown: ReviewSummary["breakdown"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const r of rows) {
    const star = Math.min(5, Math.max(1, r._id)) as 1 | 2 | 3 | 4 | 5;
    breakdown[star] = r.c;
    total += r.c;
    sum += r._id * r.c;
  }
  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
  return { average, count: total, breakdown };
}

export async function syncArticleReviewStats(articleSlug: string): Promise<void> {
  await connectDb();
  const slug = String(articleSlug || "").trim();
  if (!slug) return;
  const [agg] = await ArticleReview.aggregate<{ avg: number; count: number }>([
    { $match: { articleSlug: slug, status: "live" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const count = agg?.count ?? 0;
  const average = count > 0 ? Math.round((agg!.avg as number) * 10) / 10 : 0;
  await Article.updateOne({ slug }, { $set: { reviewAverage: average, reviewCount: count } });
}

export async function listReviewsPublic(
  articleSlug: string,
  sort: ReviewSort = "newest",
  page = 1,
  limit = 10,
): Promise<{ reviews: PublicReview[]; total: number; page: number; pages: number }> {
  await connectDb();
  const slug = String(articleSlug || "").trim();
  const l = Math.min(Math.max(limit, 1), 30);
  const p = Math.max(1, page);
  const skip = (p - 1) * l;

  const filter = { articleSlug: slug, status: "live" as const };
  const total = await ArticleReview.countDocuments(filter);
  const orders = sortObject(sort);
  const docs = JSON.parse(
    JSON.stringify(await ArticleReview.find(filter).sort(orders).skip(skip).limit(l).lean()),
  ) as Record<string, unknown>[];
  return {
    reviews: docs.map(toPublic),
    total,
    page: p,
    pages: Math.max(1, Math.ceil(total / l)),
  };
}

export async function getReviewsJsonLd(
  articleSlug: string,
  limit: number,
): Promise<Record<string, unknown>[]> {
  await connectDb();
  const slug = String(articleSlug || "").trim();
  const docs = await ArticleReview.find({ articleSlug: slug, status: "live" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  const parsed = JSON.parse(JSON.stringify(docs)) as Record<string, unknown>[];
  return parsed.map((doc) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: { "@type": "Rating", ratingValue: doc.rating, bestRating: 5, worstRating: 1 },
    author: { "@type": "Person", name: doc.username },
    reviewBody: doc.reviewText,
    name: doc.reviewTitle,
    datePublished: doc.createdAt,
  }));
}

export type CreateReviewInput = {
  username: string;
  email: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  website?: string;
};

export async function createReview(
  articleSlug: string,
  input: CreateReviewInput,
  clientIp: string,
): Promise<{ review: PublicReview; ownerToken: string }> {
  if (input.website && String(input.website).trim()) {
    throw new Error("Spam rejected.");
  }
  await connectDb();
  const slug = String(articleSlug || "").trim();
  const article = await Article.findOne({ slug, status: "published" }).select("_id").lean();
  if (!article) throw new Error("Article not found");

  await assertReviewRateLimit(clientIp, slug);

  const username = sanitizeLine(input.username, MAX_USERNAME);
  const email = sanitizeLine(input.email, 320).toLowerCase();
  const reviewTitle = sanitizeLine(input.reviewTitle, MAX_REVIEW_TITLE);
  const reviewText = sanitizeLine(input.reviewText, MAX_REVIEW_TEXT);
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating))));

  if (username.length < 2) throw new Error("Please enter a display name (at least 2 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email.");
  if (reviewTitle.length < 2) throw new Error("Please add a short headline for your review.");
  if (reviewText.length < 20) throw new Error("Please write at least a few sentences (20+ characters).");

  const avatarStyle =
    [...email].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 8;

  const ownerToken = generateOwnerToken();
  const ownerTokenHash = hashOwnerToken(ownerToken);

  try {
    const doc = await ArticleReview.create({
      articleId: article._id,
      articleSlug: slug,
      username,
      email,
      ownerTokenHash,
      rating,
      reviewTitle,
      reviewText,
      avatarStyle,
      status: "live",
    });
    await syncArticleReviewStats(slug);
    const raw = JSON.parse(JSON.stringify(doc.toObject())) as Record<string, unknown>;
    return { review: toPublic(raw), ownerToken };
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e ? (e as { code?: number }).code : 0;
    if (msg === 11000) throw new Error("You already submitted a review for this story.");
    throw e;
  }
}

export async function updateReview(
  articleSlug: string,
  reviewId: string,
  ownerToken: string,
  patch: Partial<Pick<CreateReviewInput, "username" | "rating" | "reviewTitle" | "reviewText">>,
): Promise<PublicReview> {
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(reviewId)) throw new Error("Invalid review");
  const slug = String(articleSlug || "").trim();
  const doc = await ArticleReview.findOne({
    _id: reviewId,
    articleSlug: slug,
  })
    .select("+ownerTokenHash")
    .lean();
  if (!doc) throw new Error("Review not found");
  const hash = (doc as { ownerTokenHash?: string }).ownerTokenHash;
  if (!hash || !safeCompareTokenHash(hash, ownerToken)) throw new Error("Not authorized to edit this review");
  if ((doc as { status?: string }).status !== "live") throw new Error("Review is not editable");

  const $set: Record<string, unknown> = {};
  if (patch.username != null) {
    const u = sanitizeLine(patch.username, MAX_USERNAME);
    if (u.length < 2) throw new Error("Name too short");
    $set.username = u;
  }
  if (patch.reviewTitle != null) {
    const t = sanitizeLine(patch.reviewTitle, MAX_REVIEW_TITLE);
    if (t.length < 2) throw new Error("Title too short");
    $set.reviewTitle = t;
  }
  if (patch.reviewText != null) {
    const t = sanitizeLine(patch.reviewText, MAX_REVIEW_TEXT);
    if (t.length < 20) throw new Error("Review too short");
    $set.reviewText = t;
  }
  if (patch.rating != null) {
    $set.rating = Math.min(5, Math.max(1, Math.round(Number(patch.rating))));
  }
  if (!Object.keys($set).length) throw new Error("Nothing to update");

  const updated = await ArticleReview.findOneAndUpdate({ _id: reviewId, articleSlug: slug }, $set, {
    new: true,
  }).lean();
  await syncArticleReviewStats(slug);
  return toPublic(JSON.parse(JSON.stringify(updated)) as Record<string, unknown>);
}

export async function deleteReview(articleSlug: string, reviewId: string, ownerToken: string): Promise<void> {
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(reviewId)) throw new Error("Invalid review");
  const slug = String(articleSlug || "").trim();
  const doc = await ArticleReview.findOne({ _id: reviewId, articleSlug: slug })
    .select("+ownerTokenHash")
    .lean();
  if (!doc) throw new Error("Review not found");
  const hash = (doc as { ownerTokenHash?: string }).ownerTokenHash;
  if (!hash || !safeCompareTokenHash(hash, ownerToken)) throw new Error("Not authorized to delete this review");
  await ArticleReview.deleteOne({ _id: reviewId, articleSlug: slug });
  await ReviewHelpfulVote.deleteMany({ reviewId: new mongoose.Types.ObjectId(reviewId) });
  await syncArticleReviewStats(slug);
}

export async function markHelpful(reviewId: string, voterKey: string): Promise<{ helpfulCount: number; ok: boolean }> {
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(reviewId)) throw new Error("Invalid review");
  const key = sanitizeLine(voterKey, 128);
  if (key.length < 8) throw new Error("Invalid voter");

  const review = await ArticleReview.findOne({ _id: reviewId, status: "live" }).select("_id").lean();
  if (!review) throw new Error("Review not found");

  try {
    await ReviewHelpfulVote.create({ reviewId: review._id, voterKey: key });
  } catch {
    return { helpfulCount: (await ArticleReview.findById(reviewId).select("helpfulCount").lean())?.helpfulCount ?? 0, ok: false };
  }
  const upd = await ArticleReview.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  )
    .select("helpfulCount")
    .lean();
  return { helpfulCount: upd?.helpfulCount ?? 0, ok: true };
}

export type AdminReviewRow = PublicReview & {
  email: string;
  status: ArticleReviewStatus;
  articleSlug: string;
};

export async function listReviewsAdmin(params: {
  q?: string;
  status?: ArticleReviewStatus | "all";
  articleSlug?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}): Promise<{ rows: AdminReviewRow[]; total: number; page: number; pages: number }> {
  await connectDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};
  if (params.status && params.status !== "all") filter.status = params.status;
  if (params.articleSlug?.trim()) filter.articleSlug = params.articleSlug.trim();
  if (params.q?.trim()) {
    const rx = new RegExp(params.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ username: rx }, { reviewTitle: rx }, { reviewText: rx }, { email: rx }];
  }
  const total = await ArticleReview.countDocuments(filter);
  const sort = params.sort === "oldest" ? { createdAt: 1 as const } : { createdAt: -1 as const };
  const docs = await ArticleReview.find(filter).sort(sort).skip(skip).limit(limit).lean();
  const parsed = JSON.parse(JSON.stringify(docs)) as Record<string, unknown>[];
  const rows: AdminReviewRow[] = parsed.map((doc) => ({
    ...toPublic(doc),
    email: String(doc.email),
    status: doc.status as ArticleReviewStatus,
    articleSlug: String(doc.articleSlug),
  }));
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function adminPatchReview(
  id: string,
  patch: Partial<{ status: ArticleReviewStatus; verified: boolean; isPinned: boolean }>,
): Promise<void> {
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const $set: Record<string, unknown> = {};
  if (patch.status != null) $set.status = patch.status;
  if (patch.verified != null) $set.verified = patch.verified;
  if (patch.isPinned != null) $set.isPinned = patch.isPinned;
  if (!Object.keys($set).length) return;
  const doc = await ArticleReview.findByIdAndUpdate(id, $set, { new: true }).select("articleSlug").lean();
  if (doc?.articleSlug) await syncArticleReviewStats(String(doc.articleSlug));
}

export async function adminDeleteReview(id: string): Promise<void> {
  await connectDb();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  const doc = await ArticleReview.findByIdAndDelete(id).select("articleSlug").lean();
  if (doc?._id) await ReviewHelpfulVote.deleteMany({ reviewId: doc._id });
  if (doc?.articleSlug) await syncArticleReviewStats(String(doc.articleSlug));
}

export type NewsletterSocialProofQuote = {
  quote: string;
  byline: string;
};

const NEGATIVE_REVIEW_LEX =
  /\b(hate|hated|terrible|awful|worst|disappoint|disappointed|scam|waste|refund|garbage|rubbish|useless|doesn'?t work|broken|misleading|never again|avoid|horrible|poor quality)\b/i;

const POSITIVE_REVIEW_LEX =
  /\b(love|loved|loving|beautiful|helpful|amazing|great|wonderful|perfect|thank|thanks|enjoyed|enjoy|inspiring|recommend|excellent|fantastic|pleased|happy|refresh|transformed|gorgeous|stunning|brilliant|appreciate|worth|well written|well-written|highly recommend)\b/i;

export function newsletterReviewByline(username: string): string {
  const parts = String(username || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "Reader";
  if (parts.length === 1) {
    const w = parts[0]!;
    return `${w[0]!.toUpperCase()}${w.slice(1).toLowerCase()}.`;
  }
  const first = `${parts[0]![0]!.toUpperCase()}${parts[0]!.slice(1).toLowerCase()}`;
  const li = parts[parts.length - 1]![0]!.toUpperCase();
  return `${first} ${li}.`;
}

export function newsletterReviewBody(doc: { reviewTitle: string; reviewText: string }): string {
  const body = String(doc.reviewText || "").replace(/\s+/g, " ").trim();
  const title = String(doc.reviewTitle || "").replace(/\s+/g, " ").trim();
  let quote = body;
  if (title && body && !body.toLowerCase().includes(title.toLowerCase().slice(0, Math.min(12, title.length)))) {
    quote = `${title}. ${body}`;
  }
  if (quote.length > 260) quote = `${quote.slice(0, 257).trim()}…`;
  return quote;
}

/**
 * Live 4–5★ reviews with positive tone, ranked by helpful votes; de-duplicated per article;
 * slight preference for 4★ among similar scores so the block is not “all fives.”
 */
export async function getNewsletterSocialProofQuotes(limit = 3): Promise<NewsletterSocialProofQuote[]> {
  if (limit < 1) return [];
  await connectDb();
  const rows = await ArticleReview.find({ status: "live", rating: { $gte: 4, $lte: 5 } })
    .sort({ helpfulCount: -1, createdAt: -1 })
    .limit(100)
    .lean();

  type Row = (typeof rows)[number];
  const scored = rows
    .map((doc) => {
      const combined = `${doc.reviewTitle} ${doc.reviewText}`;
      if (NEGATIVE_REVIEW_LEX.test(combined)) return null;
      if (!POSITIVE_REVIEW_LEX.test(combined)) return null;
      if (String(doc.reviewText || "").trim().length < 40) return null;
      const helpful = Number(doc.helpfulCount ?? 0);
      const variety = (5 - Number(doc.rating)) * 5;
      const pinned = doc.isPinned ? 40 : 0;
      const score = helpful * 25 + variety + pinned;
      return { doc, score };
    })
    .filter(Boolean) as { doc: Row; score: number }[];

  scored.sort((a, b) => b.score - a.score);

  const seenSlug = new Set<string>();
  const pool: Row[] = [];
  for (const { doc } of scored) {
    const slug = String(doc.articleSlug);
    if (seenSlug.has(slug)) continue;
    seenSlug.add(slug);
    pool.push(doc);
    if (pool.length >= Math.max(limit * 6, 12)) break;
  }

  const out: NewsletterSocialProofQuote[] = [];
  const used = new Set<string>();
  const four = pool.find((d) => d.rating === 4);
  if (four && limit >= 2) {
    out.push({
      quote: newsletterReviewBody(four),
      byline: newsletterReviewByline(String(four.username)),
    });
    used.add(String(four._id));
  }
  for (const d of pool) {
    if (out.length >= limit) break;
    if (used.has(String(d._id))) continue;
    out.push({ quote: newsletterReviewBody(d), byline: newsletterReviewByline(String(d.username)) });
    used.add(String(d._id));
  }

  return out.slice(0, limit);
}

/** Featured quotes on `/newsletter` when admin selects specific live reviews by id (order preserved). */
export async function getNewsletterQuotesByReviewIds(ids: string[]): Promise<NewsletterSocialProofQuote[]> {
  const cleaned = ids.map((id) => String(id).trim()).filter(Boolean);
  if (!cleaned.length) return [];
  await connectDb();
  const oids = cleaned
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (!oids.length) return [];
  const docs = await ArticleReview.find({ _id: { $in: oids }, status: "live" }).lean();
  const map = new Map(docs.map((d) => [String(d._id), d]));
  const out: NewsletterSocialProofQuote[] = [];
  for (const id of cleaned) {
    const doc = map.get(id);
    if (!doc) continue;
    out.push({
      quote: newsletterReviewBody(doc),
      byline: newsletterReviewByline(String(doc.username)),
    });
  }
  return out;
}
