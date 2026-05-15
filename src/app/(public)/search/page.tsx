import Link from "next/link";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/article-card";
import { listTrendingArticles, searchArticles } from "@/services/article-service";
import { SearchAnalyticsBeacon } from "@/components/analytics/search-analytics-beacon";
import { SearchExperience } from "@/components/search/search-experience";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { getSearchIdeaChips } from "@/services/search-query-service";
import { getCategoryTree } from "@/services/category-service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    subcategory?: string;
    tag?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const q = (p.q || "").trim();
  const b = await getResolvedSiteBranding();
  if (q) {
    return await buildMetadata({
      title: `Search “${q.slice(0, 48)}” — ${b.name}`,
      description: `Editorial results for “${q.slice(0, 80)}” — room guides, decor ideas, and styling playbooks.`,
      path: `/search?q=${encodeURIComponent(q)}`,
    });
  }
  return await buildMetadata({
    title: `Search — ${b.name}`,
    description: "Search decor editorials, room ideas, Pinterest-style guides, and expert styling playbooks.",
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, Number(params.page || "1"));
  const skip = (page - 1) * 24;
  const categorySlug = params.category || undefined;
  const subcategorySlug = params.subcategory || undefined;
  const tagSlug = params.tag || undefined;

  const hasActiveSearch =
    q.length >= 2 || Boolean(categorySlug || subcategorySlug || tagSlug);

  const [data, trending, editorial, ideaChips, categoryTree] = await Promise.all([
    hasActiveSearch
      ? searchArticles({ q, limit: 24, skip, categorySlug, subcategorySlug, tagSlug })
      : Promise.resolve({ results: [] as Record<string, unknown>[], totalApprox: 0, source: "db" as const }),
    listTrendingArticles(8),
    getHomeEditorialResolved(),
    getSearchIdeaChips(8),
    getCategoryTree(),
  ]);

  const results = "results" in data ? data.results : [];
  const totalApprox = "totalApprox" in data ? Number(data.totalApprox) || 0 : 0;

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-14">
      <SearchAnalyticsBeacon
        q={q}
        page={page}
        resultCount={totalApprox}
        resultsOnPage={results.length}
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
        tagSlug={tagSlug}
      />
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {editorial.searchIntroEyebrow}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">{editorial.searchIntroTitle}</h1>
        <p className="mt-3 text-muted-foreground">{editorial.searchIntroDek}</p>
      </div>

      <SearchExperience
        initialQ={q}
        initialCategory={categorySlug}
        initialSubcategory={subcategorySlug}
        initialTag={tagSlug}
        ideaChips={ideaChips}
        categoryTree={categoryTree}
      />

      {hasActiveSearch ? (
        <>
          <p className="mt-10 text-sm text-muted-foreground">
            About{" "}
            <span className="font-medium text-foreground">
              {results.length ? `${results.length}+` : "no"} matching stor{results.length === 1 ? "y" : "ies"}
            </span>{" "}
            {categorySlug || subcategorySlug || tagSlug ? "(filtered)" : ""}
          </p>
          <div className="mt-6 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <SearchHitCard key={String(a.slug)} article={a} query={q} />
            ))}
          </div>
          {!results.length ? (
            <div className="mt-14 rounded-3xl border border-dashed border-border bg-muted/20 p-8 md:p-12">
              <h2 className="font-heading text-2xl font-semibold">No exact matches — here&apos;s what readers love</h2>
              <p className="mt-3 text-muted-foreground">
                Try a shorter phrase, browse trending below, or explore a category hub.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {trending.map((a: Record<string, unknown>) => (
                  <ArticleCard key={String(a.slug)} article={a as never} />
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-2">
                {categoryTree.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="rounded-full border bg-card px-4 py-2 text-sm hover:border-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {results.length >= 24 ? (
            <div className="mt-10 flex justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={searchResultsHref({ q, page: page - 1, categorySlug, subcategorySlug, tagSlug })}
                  className="rounded-full border px-6 py-3 text-sm font-medium"
                >
                  Previous
                </Link>
              ) : null}
              <Link
                href={searchResultsHref({ q, page: page + 1, categorySlug, subcategorySlug, tagSlug })}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Next
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-semibold">{editorial.searchTrendingTitle}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((a: Record<string, unknown>) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchHitCard({ article, query }: { article: Record<string, unknown>; query: string }) {
  const excerpt = String(article.excerpt || "");
  const lowered = excerpt.toLowerCase();
  const qi = lowered.indexOf(query.toLowerCase());
  let snippet = excerpt.slice(0, 160);
  if (qi >= 0) snippet = excerpt.slice(Math.max(0, qi - 40), qi + 120);

  return (
    <div className="min-w-0">
      <ArticleCard article={article as never} />
      {snippet ? (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          <Highlight text={snippet} needle={query} />
        </p>
      ) : null}
    </div>
  );
}

function Highlight({ text, needle }: { text: string; needle: string }) {
  if (!needle.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeReg(needle)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchResultsHref(opts: {
  q: string;
  page: number;
  categorySlug?: string;
  subcategorySlug?: string;
  tagSlug?: string;
}) {
  const sp = new URLSearchParams();
  if (opts.q.trim()) sp.set("q", opts.q.trim());
  if (opts.categorySlug) sp.set("category", opts.categorySlug);
  if (opts.subcategorySlug) sp.set("subcategory", opts.subcategorySlug);
  if (opts.tagSlug) sp.set("tag", opts.tagSlug);
  if (opts.page > 1) sp.set("page", String(opts.page));
  const qs = sp.toString();
  return qs ? `/search?${qs}` : "/search";
}
