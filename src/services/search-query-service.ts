import { connectDb } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Server-side search results page — logs to Mongo (public site does not call /api/search for HTML search). */
export async function logSearchExecution(opts: {
  q: string;
  resultCount: number;
  categorySlug?: string;
  tagSlug?: string;
}): Promise<void> {
  const q = opts.q.trim();
  if (q.length < 2) return;
  try {
    await connectDb();
    await SearchQuery.create({
      q,
      suggest: false,
      resultCount: Math.max(0, opts.resultCount),
      categorySlug: opts.categorySlug || undefined,
      tagSlug: opts.tagSlug || undefined,
    });
  } catch {
    /* analytics must not break search */
  }
}

export type TopSearchRow = { _id: string; count: number; last: Date };

export async function aggregateTopSearchQueries(): Promise<TopSearchRow[]> {
  await connectDb();
  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  return SearchQuery.aggregate<TopSearchRow>([
    { $match: { suggest: false, createdAt: { $gte: since } } },
    { $group: { _id: "$q", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
    { $sort: { count: -1 } },
    { $limit: 60 },
  ]);
}
