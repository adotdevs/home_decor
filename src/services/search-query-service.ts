import { connectDb } from "@/lib/db";
import { SearchQuery } from "@/models/SearchQuery";
import { toSlug } from "@/lib/utils/content";
import {
  listTopTagsByFrequency,
  listTopTagsByFrequencyInScope,
  publishedSearchHasAnyHit,
} from "@/services/article-service";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** @deprecated Server-rendered search no longer logs here; use `POST /api/analytics/search-log` from the client beacon. */
export async function logSearchExecution(opts: {
  q: string;
  resultCount: number;
  categorySlug?: string;
  subcategorySlug?: string;
  tagSlug?: string;
}): Promise<void> {
  void opts;
  /* no-op: was firing once per RSC request and inflated SearchQuery counts */
}

export type TopSearchRow = { _id: string; count: number; last: Date };

export async function aggregateTopSearchQueries(): Promise<TopSearchRow[]> {
  await connectDb();
  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  return SearchQuery.aggregate<TopSearchRow>([
    { $match: { suggest: false, createdAt: { $gte: since } } },
    {
      $project: {
        key: {
          $cond: [
            { $gt: [{ $strLenCP: { $ifNull: ["$normalizedQ", ""] } }, 0] },
            "$normalizedQ",
            { $toLower: { $trim: { input: { $ifNull: ["$q", ""] } } } },
          ],
        },
      },
    },
    { $match: { key: { $nin: ["", null] } } },
    { $group: { _id: "$key", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
    { $sort: { count: -1 } },
    { $limit: 60 },
  ]);
}

/** Search queries logged with a room filter (used first on category hubs). */
export async function aggregateTopSearchQueriesForCategory(categorySlug: string): Promise<TopSearchRow[]> {
  const cat = categorySlug.trim();
  if (!cat) return [];
  await connectDb();
  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  return SearchQuery.aggregate<TopSearchRow>([
    {
      $match: { suggest: false, createdAt: { $gte: since }, categorySlug: cat },
    },
    {
      $project: {
        key: {
          $cond: [
            { $gt: [{ $strLenCP: { $ifNull: ["$normalizedQ", ""] } }, 0] },
            "$normalizedQ",
            { $toLower: { $trim: { input: { $ifNull: ["$q", ""] } } } },
          ],
        },
      },
    },
    { $match: { key: { $nin: ["", null] } } },
    { $group: { _id: "$key", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
    { $sort: { count: -1 } },
    { $limit: 40 },
  ]);
}

export type SearchIdeaChip =
  | { kind: "query"; q: string }
  | { kind: "tag"; slug: string; label: string };

async function filterQueriesWithHits(
  queries: string[],
  scope: { categorySlug?: string; subcategorySlug?: string },
  limit: number,
): Promise<string[]> {
  const unique = [...new Set(queries.map((q) => q.trim()).filter((q) => q.length >= 2))];
  if (!unique.length || limit <= 0) return [];
  const hits = await Promise.all(
    unique.map((q) => publishedSearchHasAnyHit({ q, ...scope })),
  );
  return unique.filter((_, i) => hits[i]).slice(0, limit);
}

async function appendTagChips(
  labels: string[],
  scope: { categorySlug?: string; subcategorySlug?: string },
  cap: number,
  chips: SearchIdeaChip[],
): Promise<SearchIdeaChip[]> {
  const out = [...chips];
  const seen = new Set<string>();
  for (const c of out) {
    if (c.kind === "query") seen.add(`q:${c.q.toLowerCase()}`);
    else seen.add(`tag:${c.slug}`);
  }
  const candidates = labels
    .map((l) => ({ label: l.trim(), slug: toSlug(l) }))
    .filter((x) => x.label.length >= 2 && x.slug.length >= 2);
  const checks = await Promise.all(
    candidates.map((x) =>
      publishedSearchHasAnyHit({ tagSlug: x.slug, categorySlug: scope.categorySlug, subcategorySlug: scope.subcategorySlug }),
    ),
  );
  for (let i = 0; i < candidates.length && out.length < cap; i++) {
    if (!checks[i]) continue;
    const { label, slug } = candidates[i]!;
    if (seen.has(`tag:${slug}`)) continue;
    seen.add(`tag:${slug}`);
    out.push({ kind: "tag", slug, label });
  }
  return out.slice(0, cap);
}

/**
 * /search “Ideas to try”: popular queries from analytics, then frequent article tags — only shown after verifying
 * at least one published article would match the same rules as live search.
 */
export async function getSearchIdeaChips(limit = 8): Promise<SearchIdeaChip[]> {
  const cap = Math.min(Math.max(limit, 1), 12);
  let rows: TopSearchRow[] = [];
  try {
    rows = await aggregateTopSearchQueries();
  } catch {
    rows = [];
  }
  const goodQ = await filterQueriesWithHits(
    rows.map((r) => String(r._id || "")),
    {},
    cap,
  );
  const chips: SearchIdeaChip[] = goodQ.map((q) => ({ kind: "query", q }));
  if (chips.length >= cap) return chips;
  let tags: string[] = [];
  try {
    tags = await listTopTagsByFrequency(120);
  } catch {
    tags = [];
  }
  return appendTagChips(tags, {}, cap, chips);
}

/** Category / subcategory hub chips: scoped logged queries first, then global queries filtered by hits in hub, then tags in scope. */
export async function getSearchIdeaChipsForCategoryHub(
  categorySlug: string,
  subcategorySlug: string | null,
  limit: number,
): Promise<SearchIdeaChip[]> {
  const cap = Math.min(Math.max(limit, 1), 12);
  const scope = { categorySlug: categorySlug.trim(), subcategorySlug: subcategorySlug?.trim() || undefined };
  const chips: SearchIdeaChip[] = [];

  let scopedRows: TopSearchRow[] = [];
  try {
    scopedRows = await aggregateTopSearchQueriesForCategory(scope.categorySlug);
  } catch {
    scopedRows = [];
  }
  let goodQ = await filterQueriesWithHits(
    scopedRows.map((r) => String(r._id || "")),
    scope,
    cap,
  );
  for (const q of goodQ) chips.push({ kind: "query", q });

  if (chips.length < cap) {
    let globalRows: TopSearchRow[] = [];
    try {
      globalRows = await aggregateTopSearchQueries();
    } catch {
      globalRows = [];
    }
    goodQ = await filterQueriesWithHits(
      globalRows.map((r) => String(r._id || "")),
      scope,
      cap - chips.length,
    );
    for (const q of goodQ) {
      if (chips.some((c) => c.kind === "query" && c.q.toLowerCase() === q.toLowerCase())) continue;
      chips.push({ kind: "query", q });
      if (chips.length >= cap) break;
    }
  }

  if (chips.length >= cap) return chips.slice(0, cap);
  let tags: string[] = [];
  try {
    tags = await listTopTagsByFrequencyInScope(scope.categorySlug, subcategorySlug, 120);
  } catch {
    tags = [];
  }
  return appendTagChips(tags, scope, cap, chips);
}
