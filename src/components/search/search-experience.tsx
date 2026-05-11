"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useState } from "react";
import { categoryTree } from "@/config/site";

export function SearchExperience({
  initialQ,
  initialCategory,
  initialTag,
}: {
  initialQ: string;
  initialCategory?: string;
  initialTag?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory || "");
  const [tag, setTag] = useState(initialTag || "");

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (category) sp.set("category", category);
      if (tag) sp.set("tag", tag);
      const qs = sp.toString();
      router.push(qs ? `/search?${qs}` : "/search");
    },
    [q, category, tag, router],
  );

  const quickTerms = [
    "layered neutrals",
    "Japandi interiors",
    "mood lighting",
    "small-space styling",
    "coffee table styling",
  ];

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-4 rounded-3xl border border-black/5 bg-card p-4 shadow-sm md:flex-row md:items-end md:p-6">
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
          className="w-full min-w-0 rounded-2xl border border-input bg-background px-4 py-3 text-[15px] outline-none ring-ring/30 focus-visible:ring-2"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-2 md:w-auto md:max-w-md md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="search-cat" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Room
          </label>
          <select
            id="search-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full min-w-0 rounded-2xl border border-input bg-background px-3 py-3 text-sm outline-none"
          >
            <option value="">All rooms</option>
            {categoryTree.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="search-tag" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tag slug
          </label>
          <input
            id="search-tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="organic-modern"
            className="w-full min-w-0 rounded-2xl border border-input bg-background px-3 py-3 text-sm outline-none"
          />
        </div>
      </div>
      <button
        type="submit"
        className="h-12 w-full shrink-0 rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:opacity-95 md:w-auto"
      >
        Search
      </button>
      <div className="flex flex-col gap-2 border-t border-border pt-4 md:col-span-full">
        <span className="text-xs font-medium text-muted-foreground">Ideas to try</span>
        <div className="flex flex-wrap gap-2">
          {quickTerms.map((t) => (
            <button
              key={t}
              type="button"
              className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
              onClick={() => setQ(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
