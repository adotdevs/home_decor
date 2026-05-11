import { NextRequest, NextResponse } from "next/server";
import { listPublishedArticlesRange, upsertArticle } from "@/services/article-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const offset = Math.max(0, Number(searchParams.get("offset") || "0"));
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "24"), 1), 60);
  return NextResponse.json(await listPublishedArticlesRange(offset, limit));
}

export async function POST(req: Request) {
  const payload = await req.json();
  return NextResponse.json(await upsertArticle(payload));
}

