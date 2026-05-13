"use client";

import { useState, useMemo } from "react";
import { MasonryFeed } from "@/features/home/masonry-feed";
import { categoryTree } from "@/config/site";

const ALL_CHIP = { name: "All rooms", slug: "all" };
const CHIPS = [ALL_CHIP, ...categoryTree.map((c) => ({ name: c.name, slug: c.slug }))];

export function FeedFilters({
  articles,
  maxItems = 48,
}: {
  articles: Record<string, unknown>[];
  maxItems?: number;
}) {
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    if (active === "all") return articles;
    return articles.filter(
      (a) =>
        String(a.categorySlug ?? "") === active ||
        String(a.category ?? "").toLowerCase().replace(/\s+/g, "-") === active,
    );
  }, [articles, active]);

  return (
    <>
      {/* Chip filters */}
      <div
        role="group"
        aria-label="Filter by room"
        className="mt-8 flex flex-wrap gap-2"
      >
        {CHIPS.map((chip) => (
          <button
            key={chip.slug}
            type="button"
            onClick={() => setActive(chip.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === chip.slug
                ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-900"
                : "border border-border bg-background text-muted-foreground hover:border-neutral-400 hover:text-foreground"
            }`}
          >
            {chip.name}
            {active === chip.slug && filtered.length > 0 && (
              <span className="ml-1.5 text-white/70 dark:text-neutral-600">
                {filtered.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="mt-8">
        {filtered.length > 0 ? (
          <MasonryFeed articles={filtered} maxItems={maxItems} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">
            No articles in this category yet.
          </p>
        )}
      </div>
    </>
  );
}
