import Link from "next/link";
import Image from "next/image";
import { ArticleCard } from "@/components/article/article-card";
import { AdSlot } from "@/components/ads/ad-slot";
import { FadeIn } from "@/components/common/fade-in";
import { categoryHeroImage, images } from "@/config/images";
import { categoryTree, seasonalInspiration, siteConfig } from "@/config/site";
import { FeaturedRail } from "@/features/home/featured-rail";
import { MasonryFeed } from "@/features/home/masonry-feed";
import { toSlug } from "@/lib/utils/content";

export function HomeExperience({
  latest,
  trending,
}: {
  latest: Array<Record<string, unknown>>;
  trending: Array<Record<string, unknown>>;
}) {
  const lead = latest[0];
  const spotlight = trending.slice(0, 8);
  const forMasonry = latest.slice(4, 20).length ? latest.slice(4, 20) : latest;

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,oklch(0.97_0.02_85),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.96_0.03_75),transparent_50%)]">
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-black/5 shadow-xl md:rounded-[2.5rem]">
          <div className="relative aspect-[16/11] w-full md:aspect-[21/8]">
            <Image
              src={images.heroes.editorialLiving}
              alt="Sunlit living room with layered neutral decor and sculptural lighting"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-br" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 md:max-w-2xl">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Pinterest-style decor studio</p>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] text-white drop-shadow-sm md:text-6xl lg:text-7xl">
                The home you want is built in layers — we show you how.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
                {siteConfig.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/inspiration/feed"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition hover:bg-white/95"
                >
                  Browse inspiration feed
                </Link>
                <Link
                  href="/latest"
                  className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                >
                  Latest editorials
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <AdSlot placement="header" />
      </div>

      {lead ? (
        <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 md:grid-cols-2 md:items-center md:px-8 lg:gap-14">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"> Today&apos;s lead story</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight md:text-4xl">{String(lead.title)}</h2>
            <p className="mt-4 text-muted-foreground md:text-lg">{String(lead.excerpt)}</p>
            <Link
              href={`/article/${lead.slug}`}
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Read the full feature
            </Link>
          </FadeIn>
          <Link href={`/article/${lead.slug}`} className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 shadow-lg md:aspect-[5/4]">
            <Image
              src={String(lead.featuredImage || images.heroes.luxeBedroom)}
              alt={String(lead.title)}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </Link>
        </section>
      ) : null}

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-semibold md:text-4xl">Featured this week</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">Editor-picked looks you can copy room by room — not just trend photos.</p>
          </div>
          <Link href="/trending" className="text-sm font-semibold text-primary hover:underline">
            See what&apos;s trending
          </Link>
        </div>
        <div className="mt-8">
          <FeaturedRail articles={spotlight.length ? spotlight : latest} />
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-3xl font-semibold">Inspiration feed</h2>
              <Link href="/inspiration/feed" className="hidden text-sm font-semibold text-primary sm:inline hover:underline">
                Open full feed
              </Link>
            </div>
            <p className="mt-2 text-muted-foreground">A Pinterest-style waterfall of real editorials — every card opens a full styling playbook.</p>
            <div className="mt-8">
              <MasonryFeed articles={forMasonry} />
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-1">
            <div className="rounded-3xl border border-black/5 bg-card/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Newsletter</p>
              <p className="mt-3 font-heading text-xl">Saturday styling letter</p>
              <p className="mt-2 text-sm text-muted-foreground">Room formulas, shopping edits, and quiet-luxury notes — weekly.</p>
              <Link
                href="/newsletter"
                className="mt-4 inline-flex w-full justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                Subscribe
              </Link>
            </div>
            <AdSlot placement="sidebar" />
            <div className="rounded-3xl border border-black/5 bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Seasonal guides</p>
              <ul className="mt-4 space-y-3 text-sm">
                {seasonalInspiration.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/inspiration/seasonal/${s.slug}`} className="font-medium hover:text-primary hover:underline">
                      {s.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.description.slice(0, 72)}…</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <h2 className="font-heading text-3xl font-semibold">Shop the rooms — by category</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every category hub links to subcategory playbooks, so you can drill from mood board to execution.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categoryTree.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={categoryHeroImage(cat.slug)}
                  alt={`${cat.name} decor ideas and styling guides`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-heading text-2xl text-white drop-shadow">{cat.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">
                  {cat.subcategories.length} curated subtopics — from product picks to layout math.
                </p>
                <span className="mt-3 inline-block text-sm font-semibold text-primary">Explore {cat.name.toLowerCase()} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-semibold">Fresh from the editors</h2>
          <Link href="/latest" className="text-sm font-semibold text-primary hover:underline">
            View all latest
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latest.slice(0, 8).map((a) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 md:px-8">
        <h2 className="font-heading text-2xl font-semibold">Popular tags</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "layered neutrals",
            "mood lighting",
            "Pinterest-worthy",
            "small-space styling",
            "textile mixing",
            "organic modern",
          ].map((t) => (
            <Link
              key={t}
              href={`/tag/${toSlug(t)}`}
              className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
            >
              {t}
            </Link>
          ))}
          <Link href="/tags" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            All tags
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 pb-6 md:px-8">
        <div className="rounded-3xl border border-black/5 bg-muted/40 p-8 md:p-12">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">Built for search, saves, and serious readers</h2>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            Luxe Home Decor Ideas publishes long-form, magazine-quality stories with structured FAQs, rich imagery, and internal links
            between categories — the kind of depth search engines and Pinterest audiences reward. Our layouts leave room for premium ad
            experiences without breaking editorial rhythm.
          </p>
        </div>
        <div className="mt-8">
          <AdSlot placement="grid" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <AdSlot placement="footer" />
      </section>
    </div>
  );
}
