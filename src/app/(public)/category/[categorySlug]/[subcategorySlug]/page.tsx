import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/article/article-card";
import { buildMetadata } from "@/lib/utils/seo";
import { loadSubCategoryHubPayload, resolveCategoryHeroImage } from "@/services/category-service";
import { listAnalyticsPopularArticlesForCategoryHub } from "@/services/article-service";
import { getSearchIdeaChipsForCategoryHub, type SearchIdeaChip } from "@/services/search-query-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string; subcategorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  const payload = await loadSubCategoryHubPayload(categorySlug, subcategorySlug);
  if (!payload) notFound();
  const { categoryDisplayName, subDisplayName, editorial } = payload;
  return await buildMetadata({
    title: `${subDisplayName} — ${categoryDisplayName} decor guides & ideas`,
    description: editorial.dek.slice(0, 220),
    path: `/category/${categorySlug}/${subcategorySlug}`,
    keywords: [subDisplayName, categoryDisplayName, "home decor", "interior styling"],
  });
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  const payload = await loadSubCategoryHubPayload(categorySlug, subcategorySlug);
  if (!payload) notFound();

  const heroImage = await resolveCategoryHeroImage(categorySlug);
  const { categoryDisplayName, subDisplayName, editorial, pageCopy } = payload;

  const [siteCopy, ideaChips] = await Promise.all([
    getHomeEditorialResolved(),
    getSearchIdeaChipsForCategoryHub(categorySlug, subcategorySlug, 10),
  ]);
  const popularSearchesTitle = siteCopy.categoryPopularSearchesTitle.replace(/\{category\}/gi, categoryDisplayName);
  const relatedStoriesTitle = siteCopy.categoryRelatedStoriesTitle.replace(/\{category\}/gi, categoryDisplayName);

  await connectDb();
  const dbArticles = await Article.find({ categorySlug, subcategorySlug, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(24)
    .lean();

  const articles =
    (dbArticles as Record<string, unknown>[]).length > 0 ? (dbArticles as Record<string, unknown>[]) : [];
  const excludeSlugs = articles.map((a) => String((a as { slug?: string }).slug || "").trim()).filter(Boolean);
  const relatedReads = await listAnalyticsPopularArticlesForCategoryHub(categorySlug, {
    limit: 4,
    preferSubcategorySlug: subcategorySlug,
    excludeSlugs,
  });

  const heroAlt = `${subDisplayName} inspiration for ${categoryDisplayName} decor`;

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${categorySlug}`} className="hover:underline">
          {categoryDisplayName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{subDisplayName}</span>
      </nav>
      <header className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-6 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{pageCopy.heroEyebrow}</p>
            <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl">{editorial.headline}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{editorial.dek}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{editorial.tip}</p>
          </div>
          <div className="relative min-h-72">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
              unoptimized={heroImage.startsWith("http")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{pageCopy.guidesHeading}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pageCopy.guidesIntro}</p>
          </div>
          <Link href="/inspiration-gallery" className="text-sm font-semibold text-primary hover:underline">
            Browse visual gallery
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
            <h2 className="font-heading text-xl font-semibold">{pageCopy.emptyStateTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{pageCopy.emptyStateBody}</p>
          </div>
        )}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-2xl font-semibold">{pageCopy.howToHeading}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {pageCopy.howToColumns.map((col, i) => (
              <div key={i} className="rounded-2xl bg-background p-4">
                <h3 className="font-medium">{col.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold">{popularSearchesTitle}</h2>
          {ideaChips.length ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Tags and searches validated against articles in this topic.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ideaChips.map((chip, i) => (
                  <Link
                    key={`${i}-${chip.kind}-${chip.kind === "query" ? chip.q : chip.slug}`}
                    href={categoryHubSearchLink(categorySlug, subcategorySlug, chip)}
                    className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
                  >
                    {chip.kind === "query" ? chip.q : chip.label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              As readers search and tag stories in this room, suggestions will appear here automatically.
            </p>
          )}
        </div>
      </section>

      {relatedReads.length ? (
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold">{relatedStoriesTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Stories in this room with the strongest recent readership signals (sub-topic first when possible).
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
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
