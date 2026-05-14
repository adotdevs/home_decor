import { NextResponse } from "next/server";
import {
  deleteReview,
  updateReview,
} from "@/services/review-service";

type Ctx = { params: Promise<{ slug: string; reviewId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { slug, reviewId } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    const ownerToken = String(body.ownerToken || "");
    if (!ownerToken) {
      return NextResponse.json({ error: "Missing owner token" }, { status: 401 });
    }
    const review = await updateReview(slug, reviewId, ownerToken, {
      username: body.username != null ? String(body.username) : undefined,
      rating: body.rating != null ? Number(body.rating) : undefined,
      reviewTitle: body.reviewTitle != null ? String(body.reviewTitle) : undefined,
      reviewText: body.reviewText != null ? String(body.reviewText) : undefined,
    });
    return NextResponse.json({ review });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    let status = 400;
    if (message.includes("Not authorized")) status = 403;
    else if (message.includes("not found") || message.includes("Invalid review")) status = 404;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const { slug, reviewId } = await ctx.params;
    let ownerToken = "";
    try {
      const body = (await req.json()) as { ownerToken?: string };
      ownerToken = String(body.ownerToken || "");
    } catch {
      /* body optional */
    }
    if (!ownerToken) {
      const { searchParams } = new URL(req.url);
      ownerToken = String(searchParams.get("ownerToken") || "");
    }
    if (!ownerToken) {
      return NextResponse.json({ error: "Missing owner token" }, { status: 401 });
    }
    await deleteReview(slug, reviewId, ownerToken);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    let status = 400;
    if (message.includes("Not authorized")) status = 403;
    else if (message.includes("not found") || message.includes("Invalid review")) status = 404;
    return NextResponse.json({ error: message }, { status });
  }
}
