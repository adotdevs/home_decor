import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/article/article-card";
import { buildMetadata } from "@/lib/utils/seo";
import { getCategoryTree, loadTopCategoryHubPayload, resolveCategoryHeroVisual } from "@/services/category-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { editorsChoiceArticlesForCategory, listAnalyticsPopularArticlesForCategoryHub } from "@/services/article-service";
import { getSearchIdeaChipsForCategoryHub, type SearchIdeaChip } from "@/services/search-query-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { categorySlug } = await params;
  const payload = await loadTopCategoryHubPayload(categorySlug);
  if (!payload) notFound();
  const [b] = await Promise.all([getResolvedSiteBranding()]);
  const label = payload.displayName;
  return await buildMetadata({
    title: `${payload.editorial.title} — ${b.name}`,
    description: payload.editorial.dek,
    path: `/category/${categorySlug}`,
    keywords: [label, "home decor", "interior inspiration"],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const payload = await loadTopCategoryHubPayload(categorySlug);
  if (!payload) notFound();

  const tree = await getCategoryTree();
  const branch = tree.find((c) => c.slug === categorySlug);
  const [hero, editorsFirstReads, siteCopy, ideaChips] = await Promise.all([
    resolveCategoryHeroVisual(categorySlug),
    editorsChoiceArticlesForCategory(categorySlug, 3),
    getHomeEditorialResolved(),
    getSearchIdeaChipsForCategoryHub(categorySlug, null, 10),
  ]);
  const { editorial, pageCopy, displayName } = payload;
  const popularSearchesTitle = siteCopy.categoryPopularSearchesTitle.replace(/\{category\}/gi, displayName);
  const relatedStoriesTitle = siteCopy.categoryRelatedStoriesTitle.replace(/\{category\}/gi, displayName);

  await connectDb();
  const [dbSubs, dbArticles] = await Promise.all([
    Category.find({ parentSlug: categorySlug, isActive: true }).lean(),
    Article.find({ categorySlug, status: "published" }).sort({ publishedAt: -1 }).limit(24).lean(),
  ]);
  const subs =
    (dbSubs as { slug: string; name: string }[]).length > 0
      ? (dbSubs as { slug: string; name: string }[])
      : (branch?.subcategories || []).map((s) => ({ slug: s.slug, name: s.name }));
  const articles =
    (dbArticles as Record<string, unknown>[]).length > 0 ? (dbArticles as Record<string, unknown>[]) : [];
  const excludeSlugs = articles.map((a) => String((a as { slug?: string }).slug || "").trim()).filter(Boolean);
  const relatedReads = await listAnalyticsPopularArticlesForCategoryHub(categorySlug, {
    limit: 4,
    excludeSlugs,
  });

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{displayName}</span>
      </nav>

      <header className="mt-6 grid gap-8 rounded-3xl border border-black/5 bg-card p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_420px] md:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{pageCopy.heroEyebrow}</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight md:text-5xl">
            {editorial.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{editorial.dek}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{editorial.advice}</p>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-2xl">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 420px"
            unoptimized={hero.src.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{pageCopy.exploreHeading}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pageCopy.exploreIntro}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((s) => (
            <Link
              key={s.slug}
              className="rounded-2xl border bg-card p-4 text-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              href={`/category/${categorySlug}/${s.slug}`}
            >
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="mt-2 block text-muted-foreground">{pageCopy.subCardBlurb}</span>
            </Link>
          ))}
        </div>
      </section>

      {editorsFirstReads.length ? (
        <section className="mt-12 rounded-3xl bg-muted/35 p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">{pageCopy.editorsHeading}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pageCopy.editorsIntro}</p>
            </div>
            <Link
              href="/latest"
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              Latest from all categories
            </Link>
          </div>
          <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-3">
            {editorsFirstReads.map((a) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{pageCopy.latestHeading}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pageCopy.latestIntro}</p>
          </div>
          <Link href="/inspiration/feed" className="text-sm font-semibold text-primary hover:underline">
            Open inspiration feed
          </Link>
        </div>
        <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
      </section>

      <section className={`mt-14 grid gap-6 ${ideaChips.length ? "lg:grid-cols-[1fr_360px]" : ""}`}>
        {ideaChips.length ? (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-2xl font-semibold">{popularSearchesTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pulled from recent on-site searches and real article tags — only links that currently match published stories.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {ideaChips.map((chip, i) => (
                <Link
                  key={`${i}-${chip.kind}-${chip.kind === "query" ? chip.q : chip.slug}`}
                  href={categoryHubSearchLink(categorySlug, null, chip)}
                  className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  {chip.kind === "query" ? chip.q : chip.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold">{pageCopy.faqHeading}</h2>
          <div className="mt-4 space-y-3">
            {pageCopy.faqItems.map((faq, i) => (
              <details key={`faq-${i}-${faq.question.slice(0, 24)}`} className="rounded-2xl border bg-background px-4 py-3">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {relatedReads.length ? (
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold">{relatedStoriesTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ranked by recent reader traffic on article pages in this room (when analytics data exists).
          </p>
          <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedReads.map((a) => (
              <ArticleCard key={String((a as { slug?: string }).slug)} article={a as never} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function categoryHubSearchLink(categorySlug: string, subcategorySlug: string | null, chip: SearchIdeaChip) {
  const sp = new URLSearchParams();
  sp.set("category", categorySlug);
  if (subcategorySlug?.trim()) sp.set("subcategory", subcategorySlug.trim());
  if (chip.kind === "query") sp.set("q", chip.q);
  else sp.set("tag", chip.slug);
  return `/search?${sp.toString()}`;
}
