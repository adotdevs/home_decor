"use client";

import { useState } from "react";
import { MasonryFeed } from "@/features/home/masonry-feed";

export function HomeFeedLoader({ initial }: { initial: Array<Record<string, unknown>> }) {
  const [rows, setRows] = useState(initial);
  const [offset, setOffset] = useState(initial.length);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initial.length < 12);

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?offset=${offset}&limit=12`);
      const next = (await res.json()) as Array<Record<string, unknown>>;
      if (!next.length) setDone(true);
      else {
        setRows((r) => [...r, ...next]);
        setOffset((o) => o + next.length);
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
