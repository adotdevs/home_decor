import Link from "next/link";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/article-card";
import { categoryTree } from "@/config/site";
import { listTrendingArticles, searchArticles } from "@/services/article-service";
import { SearchExperience } from "@/components/search/search-experience";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; page?: string; category?: string; tag?: string }>;
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
  const tagSlug = params.tag || undefined;

  const data = q
    ? await searchArticles({ q, limit: 24, skip, categorySlug, tagSlug })
    : { results: [] as Record<string, unknown>[], totalApprox: 0, source: "db" as const };

  const results = "results" in data ? data.results : [];
  const trending = await listTrendingArticles(8);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Search the library</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight md:text-5xl">Find your next room story</h1>
        <p className="mt-3 text-muted-foreground">
          Search articles, tags, and room guides. Use filters to narrow by category or tag.
        </p>
      </div>

      <SearchExperience initialQ={q} initialCategory={categorySlug} initialTag={tagSlug} />

      {q ? (
        <>
          <p className="mt-10 text-sm text-muted-foreground">
            About{" "}
            <span className="font-medium text-foreground">
              {results.length ? `${results.length}+` : "no"} matching stor{results.length === 1 ? "y" : "ies"}
            </span>{" "}
            {categorySlug || tagSlug ? "(filtered)" : ""}
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
                  href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ""}${tagSlug ? `&tag=${tagSlug}` : ""}`}
                  className="rounded-full border px-6 py-3 text-sm font-medium"
                >
                  Previous
                </Link>
              ) : null}
              <Link
                href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ""}${tagSlug ? `&tag=${tagSlug}` : ""}`}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Next
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-12">
          <h2 className="font-heading text-2xl font-semibold">Trending now</h2>
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
