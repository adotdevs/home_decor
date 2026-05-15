import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isLikelyBotUserAgent } from "@/lib/analytics/request-meta";
import { normalizeSearchQuery } from "@/lib/analytics/normalize-search-query";
import { SearchQuery } from "@/models/SearchQuery";

const DEDUPE_MS = 120_000;

function sanitize(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F]/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Persists search analytics from the browser after debounced idle / navigation — not from RSC on every request.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (isLikelyBotUserAgent(ua)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const o = body as Record<string, unknown>;

  const rawQ = sanitize(o.q, 400);
  const norm = normalizeSearchQuery(rawQ || String(o.normalizedQ ?? ""));

  if (norm.length < 2) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const visitorKey = sanitize(o.visitorKey, 80);
  const page = Math.max(1, Math.floor(Number(o.page) || 1));
  const resultCount = Math.max(0, Math.floor(Number(o.resultCount) || 0));
  const resultsOnPage = Math.max(0, Math.floor(Number(o.resultsOnPage) || 0));

  const categorySlug = o.categorySlug ? sanitize(o.categorySlug, 200) : "";
  const subcategorySlug = o.subcategorySlug ? sanitize(o.subcategorySlug, 200) : "";
  const tagSlug = o.tagSlug ? sanitize(o.tagSlug, 200) : "";

  await connectDb();

  const since = new Date(Date.now() - DEDUPE_MS);
  const dedupeMatch: Record<string, unknown> = {
    suggest: false,
    normalizedQ: norm,
    page,
    createdAt: { $gte: since },
  };
  if (visitorKey.length >= 8) dedupeMatch.visitorKey = visitorKey;

  const existing = await SearchQuery.findOne(dedupeMatch).select("_id").lean();
  if (existing) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  await SearchQuery.create({
    q: rawQ.slice(0, 400),
    normalizedQ: norm.slice(0, 400),
    visitorKey: visitorKey.length >= 8 ? visitorKey : undefined,
    page,
    suggest: false,
    resultCount: Math.max(resultCount, resultsOnPage),
    categorySlug: categorySlug || undefined,
    subcategorySlug: subcategorySlug || undefined,
    tagSlug: tagSlug || undefined,
  });

  return NextResponse.json({ ok: true });
}
