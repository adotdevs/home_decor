import { NextResponse } from "next/server";
import { getRequestIp } from "@/lib/request-ip";
import {
  createReview,
  getReviewSummary,
  listReviewsPublic,
  type ReviewSort,
} from "@/services/review-service";

type Ctx = { params: Promise<{ slug: string }> };

const SORTS = new Set<ReviewSort>(["newest", "top_rated", "helpful", "featured"]);

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const sortRaw = searchParams.get("sort") || "newest";
  const sort = SORTS.has(sortRaw as ReviewSort) ? (sortRaw as ReviewSort) : "newest";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") || "10") || 10));

  const [summary, list] = await Promise.all([
    getReviewSummary(slug),
    listReviewsPublic(slug, sort, page, limit),
  ]);

  return NextResponse.json({ summary, ...list, sort });
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    const ip = getRequestIp(req);
    const result = await createReview(slug, {
      username: String(body.username || ""),
      email: String(body.email || ""),
      rating: Number(body.rating),
      reviewTitle: String(body.reviewTitle || ""),
      reviewText: String(body.reviewText || ""),
      website: body.website != null ? String(body.website) : "",
    }, ip);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not submit review";
    const status = message.includes("Rate limit") ? 429 : message.includes("already") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
