import Link from "next/link";
import Image from "next/image";
import { ArticleCard } from "@/components/article/article-card";
import { AdSlot } from "@/components/ads/ad-slot";
import type { SeasonalInspirationItem } from "@/services/site-settings-service";
import type { HomeCategoryCard } from "@/services/category-service";
import { FeaturedRail } from "@/features/home/featured-rail";
import { HeroCarousel } from "@/features/home/hero-carousel";
import { AutoMoodRail } from "@/features/home/auto-mood-rail";
import { ShopTheLookRow } from "@/features/home/shop-the-look-row";
import { HomeFeedLoader } from "@/features/home/home-feed-loader";
import { InspirationSidebar } from "@/features/home/inspiration-sidebar";
import { images } from "@/config/images";
import type { HomeEditorialResolved } from "@/services/site-editorial-service";

function CuratedSection({
  title,
  dek,
  articles,
  linkHref,
  linkLabel,
}: {
  title: string;
  dek?: string;
  articles: Array<Record<string, unknown>>;
  linkHref?: string;
  linkLabel?: string;
}) {
  if (!articles.length) return null;
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 md:mt-16 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-3xl font-semibold md:text-4xl">{title}</h2>
          {dek ? <p className="mt-2 max-w-xl text-muted-foreground">{dek}</p> : null}
        </div>
        {linkHref && linkLabel ? (
          <Link href={linkHref} className="text-sm font-semibold text-primary hover:underline">
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className="mt-8">
        <FeaturedRail articles={articles} />
      </div>
    </section>
  );
}

export function HomeExperience({
  editorial,
  categoryCards,
  lead,
  featuredWeekly,
  featuredDaily,
  featuredMonthly,
  editorsChoice,
  moodArticles,
  trending,
  latestForFresh,
  inspirationInitial,
  inspirationExcludeSlugs,
  inspirationChronologicalSkip,
  siteName,
  seasonalItems,
}: {
  editorial: HomeEditorialResolved;
  categoryCards: HomeCategoryCard[];
  lead: Record<string, unknown> | null;
  featuredWeekly: Array<Record<string, unknown>>;
  featuredDaily: Array<Record<string, unknown>>;
  featuredMonthly: Array<Record<string, unknown>>;
  editorsChoice: Array<Record<string, unknown>>;
  moodArticles: Array<Record<string, unknown>>;
  trending: Array<Record<string, unknown>>;
  latestForFresh: Array<Record<string, unknown>>;
  inspirationInitial: Array<Record<string, unknown>>;
  inspirationExcludeSlugs: string[];
  inspirationChronologicalSkip: number;
  siteName: string;
  seasonalItems: SeasonalInspirationItem[];
}) {
  const spotlight = featuredWeekly.length ? featuredWeekly : trending.slice(0, 8);
  const moodTitle =
    editorial.moodRailTitle.trim() || "Editor’s mood — calm & tactile";
  const moodDek =
    editorial.moodRailDek.trim() ||
    "Rotating hero stories tuned for layered neutrals, quiet luxury, and Pinterest saves.";

  return (
    <div className="min-w-0 overflow-x-clip bg-[radial-gradient(ellipse_at_top,oklch(0.97_0.02_85),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.03_75),transparent_50%)]">
      <HeroCarousel slides={editorial.heroSlides} />

      {lead ? (
        <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:px-5 md:grid-cols-2 md:items-center md:px-8 lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Today&apos;s lead story
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight md:text-4xl">{String(lead.title ?? "").trim() || "Featured story"}</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">{String(lead.excerpt ?? "").trim() || "Read the full editorial on site."}</p>
            <Link
              href={`/article/${lead.slug}`}
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Read the full feature
            </Link>
          </div>
          <Link
            href={`/article/${lead.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 shadow-lg md:aspect-[5/4]"
          >
            <Image
              src={String(lead.featuredImage || images.heroes.luxeBedroom)}
              alt={String(lead.title ?? "Featured story")}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </Link>
        </section>
      ) : null}

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 md:mt-16 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-semibold md:text-4xl">
              {editorial.sectionFeaturedWeekTitle.trim() || "Featured this week"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {editorial.sectionFeaturedWeekDek.trim() ||
                "Editor-picked looks you can copy room by room — not just trend photos."}
            </p>
          </div>
          <Link href="/trending" className="text-sm font-semibold text-primary hover:underline">
            See what&apos;s trending
          </Link>
        </div>
        <div className="mt-8">
          <FeaturedRail articles={spotlight.length ? spotlight : latestForFresh} />
        </div>
      </section>

      <CuratedSection
        title={editorial.sectionDailyTitle.trim() || "Featured today"}
        dek={editorial.sectionDailyDek.trim() || "Shortlist of guides worth reading before the week runs away."}
        articles={featuredDaily}
        linkHref="/latest"
        linkLabel="Latest stories"
      />

      <CuratedSection
        title={editorial.sectionMonthlyTitle.trim() || "Monthly spotlight"}
        dek={editorial.sectionMonthlyDek.trim() || "Deeper cuts with lasting save rates — ideal for boards and renovations."}
        articles={featuredMonthly}
        linkHref="/trending"
        linkLabel="Trending index"
      />

      <CuratedSection
        title={editorial.sectionEditorsChoiceTitle.trim() || "Editor’s choice"}
        dek={editorial.sectionEditorsChoiceDek.trim() || "Our team’s current favourite playbooks — refined, practical, memorable."}
        articles={editorsChoice}
        linkHref="/inspiration/feed"
        linkLabel="Browse feed"
      />

      <div className="mt-16 md:mt-20">
        <AutoMoodRail title={moodTitle} dek={moodDek} articles={moodArticles.length ? moodArticles : latestForFresh.slice(0, 6)} />
      </div>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 md:mt-20 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
              {editorial.inspirationFeedTitle.trim() || "Inspiration feed"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {editorial.inspirationFeedDek.trim() ||
                "A Pinterest-style waterfall of real editorials — every card opens a full styling playbook."}
            </p>
          </div>
          <Link href="/inspiration/feed" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            Open full feed
          </Link>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-4 lg:items-start lg:gap-8">
          <InspirationSidebar seasonalItems={seasonalItems} />
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-3">
            <HomeFeedLoader
              initial={inspirationInitial}
              excludeSlugs={inspirationExcludeSlugs}
              chronologicalSkipStart={inspirationChronologicalSkip}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 md:mt-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold">
              {editorial.sectionMostPinnedTitle.trim() || "Most pinned this week"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {editorial.sectionMostPinnedDek.trim() ||
                "High-traffic ideas readers return to — great starting points for boards and shopping lists."}
            </p>
          </div>
          <Link href="/trending" className="text-sm font-semibold text-primary hover:underline">
            Trending index
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.slice(0, 8).map((a) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
      </section>

      <div className="mt-16 md:mt-24">
        <ShopTheLookRow items={editorial.shopTheLookItems} />
      </div>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 md:mt-20 md:px-8">
        <h2 className="font-heading text-3xl font-semibold">Shop the rooms — by category</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every category hub links to subcategory playbooks, so you can drill from mood board to execution.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryCards.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={cat.image}
                  alt={`${cat.name} decor ideas and styling guides`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="400px"
                  unoptimized={cat.image.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-heading text-2xl text-white drop-shadow">{cat.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">
                  {cat.subcategoryCount} curated subtopics — from product picks to layout math.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-primary">
                  Explore {cat.name.toLowerCase()} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 md:mt-16 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-semibold">
            {editorial.sectionFreshEditorsTitle.trim() || "Fresh from the editors"}
          </h2>
          <Link href="/latest" className="text-sm font-semibold text-primary hover:underline">
            View all latest
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestForFresh.slice(0, 8).map((a) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 pb-6 sm:px-5 md:mt-16 md:px-8">
        <div className="rounded-3xl border border-black/5 bg-muted/40 p-8 md:p-12">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">Built for search, saves, and serious readers</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            {siteName} publishes long-form, magazine-quality stories with structured FAQs, rich imagery, and internal
            links between categories — the kind of depth search engines and Pinterest audiences reward. Our layouts leave room for
            premium ad experiences without breaking editorial rhythm.
          </p>
        </div>
        <div className="mt-8">
          <AdSlot placement="grid" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-5 md:px-8">
        <AdSlot placement="footer" />
      </section>
    </div>
  );
}
