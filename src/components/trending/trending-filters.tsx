"use client";

import { useState, useMemo } from "react";
import { ArticleCard } from "@/components/article/article-card";

type Period = "week" | "month" | "all";

const TABS: { id: Period; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

const NOW = Date.now();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function TrendingFilters({ articles }: { articles: Record<string, unknown>[] }) {
  const [period, setPeriod] = useState<Period>("all");

  const filtered = useMemo(() => {
    if (period === "all") return articles;
    const cutoff = NOW - (period === "week" ? WEEK_MS : MONTH_MS);
    const inPeriod = articles.filter((a) => {
      const pub = a.publishedAt ? new Date(a.publishedAt as string).getTime() : 0;
      return pub >= cutoff;
    });
    return inPeriod.length > 0 ? inPeriod : articles;
  }, [articles, period]);

  return (
    <>
      {/* Filter tab strip */}
      <div
        role="tablist"
        aria-label="Trending time period"
        className="mt-8 flex gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={period === tab.id}
            onClick={() => setPeriod(tab.id)}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
              period === tab.id
                ? "bg-neutral-900 text-white shadow dark:bg-white dark:text-neutral-900"
                : "border border-border bg-background text-muted-foreground hover:border-neutral-400 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No articles found for this period.
        </p>
      )}
    </>
  );
}
