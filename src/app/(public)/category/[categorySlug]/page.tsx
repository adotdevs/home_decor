import Link from "next/link";
import Image from "next/image";
import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/article/article-card";
import { categoryTree } from "@/config/site";
import { buildMetadata } from "@/lib/utils/seo";
import { resolveCategoryHubEditorial, resolveCategoryHeroVisual } from "@/services/category-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { editorsChoiceArticlesForCategory } from "@/services/article-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string }> };

function pretty(slug: string) {
  return slug.replaceAll("-", " ");
}

export async function generateMetadata({ params }: Props) {
  const { categorySlug } = await params;
  const [editorial, b] = await Promise.all([resolveCategoryHubEditorial(categorySlug), getResolvedSiteBranding()]);
  const label = categorySlug.replaceAll("-", " ");
  return await buildMetadata({
    title: `${editorial.title} — ${b.name}`,
    description: editorial.dek,
    path: `/category/${categorySlug}`,
    keywords: [label, "home decor", "interior inspiration"],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const tree = categoryTree.find((c) => c.slug === categorySlug);
  const [editorial, hero, editorsFirstReads, siteCopy] = await Promise.all([
    resolveCategoryHubEditorial(categorySlug),
    resolveCategoryHeroVisual(categorySlug),
    editorsChoiceArticlesForCategory(categorySlug, 3),
    getHomeEditorialResolved(),
  ]);
  const categoryDisplayName = tree?.name ?? pretty(categorySlug);
  const popularSearchesTitle = siteCopy.categoryPopularSearchesTitle.replace(
    /\{category\}/gi,
    categoryDisplayName,
  );

  await connectDb();
  const [dbSubs, dbArticles] = await Promise.all([
    Category.find({ parentSlug: categorySlug, isActive: true }).lean(),
    Article.find({ categorySlug, status: "published" }).sort({ publishedAt: -1 }).limit(24).lean(),
  ]);
  const subs =
    (dbSubs as { slug: string; name: string }[]).length > 0
      ? (dbSubs as { slug: string; name: string }[])
      : (tree?.subcategories || []).map((slug) => ({ slug, name: pretty(slug) }));
  const articles =
    (dbArticles as Record<string, unknown>[]).length > 0 ? (dbArticles as Record<string, unknown>[]) : [];

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-foreground">{pretty(categorySlug)}</span>
      </nav>

      <header className="mt-6 grid gap-8 rounded-3xl border border-black/5 bg-card p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_420px] md:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Room guide</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold capitalize leading-tight md:text-5xl">
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
            <h2 className="font-heading text-2xl font-semibold">Explore by subcategory</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Each subcategory opens a focused editorial hub with long-form styling advice, FAQs, and related inspiration.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((s) => (
            <Link
              key={s.slug}
              className="rounded-2xl border bg-card p-4 text-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              href={`/category/${categorySlug}/${s.slug}`}
            >
              <span className="font-medium capitalize text-foreground">{s.name}</span>
              <span className="mt-2 block text-muted-foreground">
                Palette ideas, proportion notes, product-adjacent styling, and practical maintenance tips.
              </span>
            </Link>
          ))}
        </div>
      </section>

      {editorsFirstReads.length ? (
        <section className="mt-12 rounded-3xl bg-muted/35 p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold">Editor&apos;s first reads</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Start here if you want the strongest combination of visual inspiration and practical styling logic — drawn from our
                site-wide editor&apos;s picks in this category.
              </p>
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
            <h2 className="font-heading text-2xl font-semibold">Latest {pretty(categorySlug)} stories</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Long-form, search-friendly articles written like real room consultations rather than thin inspiration cards.
            </p>
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

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-2xl font-semibold">{popularSearchesTitle}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {editorial.searches.map((search) => (
              <Link
                key={search}
                href={`/search?q=${encodeURIComponent(search)}`}
                className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold">Category FAQ</h2>
          <div className="mt-4 space-y-3">
            <details className="rounded-2xl border bg-background px-4 py-3">
              <summary className="cursor-pointer font-medium">Where should I start if the room feels unfinished?</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Start with scale and light before accessories. A larger lamp, better curtains, or one substantial rug often solves more than several small objects.
              </p>
            </details>
            <details className="rounded-2xl border bg-background px-4 py-3">
              <summary className="cursor-pointer font-medium">How do I keep inspiration from feeling copied?</summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Copy the composition, not the products. Repeat the palette structure and height variation, then add one personal object so the room belongs to you.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
