import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";
import { searchArticles } from "@/services/article-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const suggest = searchParams.get("suggest") === "1";
  const limit = Math.min(Number(searchParams.get("limit") || "24"), 60);
  const skip = Math.max(Number(searchParams.get("skip") || "0"), 0);
  const categorySlug = searchParams.get("category") || undefined;
  const subcategorySlug = searchParams.get("subcategory") || undefined;
  const tagSlug = searchParams.get("tag") || undefined;

  const data = await searchArticles({ q, suggest, limit, skip, categorySlug, subcategorySlug, tagSlug });

  if (!suggest && q.trim().length >= 2) {
    try {
      await connectDb();
      const resultCount = "results" in data ? data.results.length : 0;
      await SearchQuery.create({ q: q.trim(), suggest: false, resultCount });
    } catch {
      /* analytics optional */
    }
  }

  return NextResponse.json(data);
}
