export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { seasonalHeroImage } from "@/config/images";
import { applySeasonalIntroTemplate } from "@/config/seasonal-hub-defaults";
import { listArticlesByTagPath } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding, getSeasonalInspirationResolved } from "@/services/site-settings-service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seasonal = await getSeasonalInspirationResolved();
  const match = seasonal.find((s) => s.slug === slug);
  const b = await getResolvedSiteBranding();
  if (!match) {
    return await buildMetadata({
      title: `Seasonal inspiration — ${b.name}`,
      description: "Editorial seasonal guides.",
      path: "/inspiration/feed",
    });
  }
  return await buildMetadata({
    title: `${match.name} decor ideas | ${b.name}`,
    description: match.description,
    path: `/inspiration/seasonal/${slug}`,
  });
}

export default async function SeasonalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seasonal = await getSeasonalInspirationResolved();
  const match = seasonal.find((s) => s.slug === slug);
  if (!match) notFound();

  const tagPath = (match.articlesTagPath || match.slug).replace(/\s+/g, "-");
  const articles = await listArticlesByTagPath(tagPath, 36);
  const fallback = await listArticlesByTagPath("spring-refresh", 12);
  const grid = articles.length ? articles : fallback;
  const heroKey = match.imageKey;

  const intro = applySeasonalIntroTemplate((match.pageIntro ?? "").trim(), match.name);
  const storiesTitle = match.storiesSectionTitle;
  const newsletterCta = match.newsletterCtaLabel;
  const hubIntro = match.hubLinksIntro;
  const extraHubLinks = match.extraHubLinks ?? [];

  return (
    <div>
      <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-6 md:px-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/inspiration/feed" className="hover:underline">
            Inspiration
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{match.name}</span>
        </nav>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-heading text-4xl font-semibold md:text-5xl">{match.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{match.description}</p>
            <p className="mt-6 leading-relaxed text-foreground/90">{intro}</p>
            <Link
              href="/newsletter"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              {newsletterCta}
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-black/5 shadow-xl">
            <Image
              src={seasonalHeroImage(heroKey)}
              alt={`${match.name} home decor inspiration photography`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h2 className="font-heading text-2xl font-semibold">{storiesTitle}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.slice(0, 12).map((a: { slug?: string }) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          <span className="text-foreground/80">{hubIntro} </span>
          {seasonal
            .filter((s) => s.slug !== slug)
            .map((s, i) => (
              <span key={s.slug}>
                {i > 0 ? <span className="text-muted-foreground/60"> · </span> : null}
                <Link href={`/inspiration/seasonal/${s.slug}`} className="font-medium text-primary hover:underline">
                  {s.name}
                </Link>
              </span>
            ))}
          {extraHubLinks.map((link, i) => (
            <span key={`${link.href}-${i}`}>
              <span className="text-muted-foreground/60"> · </span>
              <Link href={link.href} className="font-medium text-primary hover:underline">
                {link.label}
              </Link>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
