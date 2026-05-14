import { NextResponse } from "next/server";
import { markHelpful } from "@/services/review-service";

type Ctx = { params: Promise<{ slug: string; reviewId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { reviewId } = await ctx.params;
    const body = (await req.json()) as { voterKey?: string };
    const voterKey = String(body.voterKey || "");
    const result = await markHelpful(reviewId, voterKey);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Vote failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
