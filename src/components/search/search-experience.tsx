"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import type { CategoryTreeTop } from "@/services/category-service";
import type { SearchIdeaChip } from "@/services/search-query-service";

export function SearchExperience({
  initialQ,
  initialCategory,
  initialSubcategory,
  initialTag,
  ideaChips,
  categoryTree,
}: {
  initialQ: string;
  initialCategory?: string;
  initialSubcategory?: string;
  initialTag?: string;
  ideaChips: SearchIdeaChip[];
  categoryTree: CategoryTreeTop[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory || "");
  const [subcategory, setSubcategory] = useState(initialSubcategory || "");
  const [tag, setTag] = useState(initialTag || "");

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (category) sp.set("category", category);
      if (subcategory.trim()) sp.set("subcategory", subcategory.trim());
      if (tag.trim()) sp.set("tag", tag.trim());
      const qs = sp.toString();
      router.push(qs ? `/search?${qs}` : "/search");
    },
    [q, category, subcategory, tag, router],
  );

  const fieldClass =
    "w-full min-w-0 rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring/30 placeholder:text-muted-foreground focus-visible:ring-2";

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-4 rounded-3xl border border-black/5 bg-card p-4 shadow-sm md:p-6">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor="site-search" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Keywords
          </label>
          <input
            id="site-search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. linen bedding, matte brass, nursery mood…"
            className={`${fieldClass} text-[15px]`}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
        <div className="grid min-w-0 w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:min-w-0 md:max-w-3xl md:shrink-0">
          <div className="min-w-0 space-y-2">
            <label htmlFor="search-cat" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Room
            </label>
            <select id="search-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldClass} cursor-pointer`}>
              <option value="">All rooms</option>
              {categoryTree.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <label htmlFor="search-sub" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sub-topic slug (optional)
            </label>
            <input
              id="search-sub"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. sofas"
              className={fieldClass}
            />
          </div>
          <div className="min-w-0 space-y-2 sm:col-span-2 lg:col-span-1">
            <label htmlFor="search-tag" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tag slug
            </label>
            <input id="search-tag" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="organic-modern" className={fieldClass} />
          </div>
        </div>
        <button
          type="submit"
          className="h-12 w-full shrink-0 rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:opacity-95 md:w-auto md:self-end"
        >
          Search
        </button>
      </div>
      {ideaChips.length ? (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-xs font-medium text-muted-foreground">Ideas to try (from your readers &amp; tags)</span>
          <div className="flex flex-wrap gap-2">
            {ideaChips.map((chip, i) => (
              <button
                key={`${i}-${chip.kind}-${chip.kind === "query" ? chip.q : chip.slug}`}
                type="button"
                className="rounded-full border border-input bg-background px-3 py-1.5 text-xs text-foreground transition hover:border-primary hover:text-foreground"
                onClick={() => {
                  if (chip.kind === "query") {
                    setQ(chip.q);
                    setTag("");
                  } else {
                    setQ("");
                    setTag(chip.slug);
                  }
                }}
              >
                {chip.kind === "query" ? chip.q : chip.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
