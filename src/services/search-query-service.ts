import { connectDb } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
