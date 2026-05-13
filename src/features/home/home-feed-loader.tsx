"use client";

import { useState } from "react";
import { MasonryFeed } from "@/features/home/masonry-feed";

export function HomeFeedLoader({
  initial,
  excludeSlugs,
  chronologicalSkipStart,
}: {
  initial: Array<Record<string, unknown>>;
  excludeSlugs: string[];
  chronologicalSkipStart: number;
}) {
  const [rows, setRows] = useState(initial);
  const [chronologicalSkip, setChronologicalSkip] = useState(chronologicalSkipStart);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < 12);

  async function loadMore() {
    setLoading(true);
    try {
      const ex = excludeSlugs.length ? `&excludeSlugs=${encodeURIComponent(excludeSlugs.join(","))}` : "&excludeSlugs=";
      const res = await fetch(`/api/articles?offset=${chronologicalSkip}&limit=12${ex}`);
      const next = (await res.json()) as Array<Record<string, unknown>>;
      if (!next.length) setDone(true);
      else {
        const seen = new Set(rows.map((r) => String(r.slug)));
        const merged = next.filter((r) => !seen.has(String(r.slug)));
        setRows((r) => [...r, ...merged]);
        setChronologicalSkip((s) => s + next.length);
        if (next.length < 12) setDone(true);
      }
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0">
      <MasonryFeed articles={rows} maxItems={rows.length} />
      {!done ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border-2 border-foreground bg-background px-10 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more inspiration"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
