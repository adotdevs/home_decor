export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { FeedFilters } from "@/components/feed/feed-filters";
import { getCategoryTree } from "@/services/category-service";
import { getInspirationFeedMarketingMerged } from "@/services/site-page-marketing-service";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getInspirationFeedMarketingMerged()]);
  return await buildMetadata({
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    path: "/inspiration/feed",
  });
}

export default async function InspirationFeedPage() {
  const [articles, tree, m] = await Promise.all([
    listPublishedArticles(48),
    getCategoryTree(),
    getInspirationFeedMarketingMerged(),
  ]);
  const rooms = tree.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="mx-auto max-w-7xl min-w-0 py-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-5 sm:py-10 md:px-8">
      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="min-w-0 max-w-full flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{m.eyebrow}</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-balance break-words hyphens-auto sm:text-4xl md:text-5xl">{m.h1}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-sm text-muted-foreground [overflow-wrap:anywhere] sm:text-base">{m.intro}</p>
        </div>
        <Link
          href="/latest"
          className="inline-flex shrink-0 self-start py-1 text-sm font-semibold text-primary hover:underline md:self-auto md:py-0"
        >
          {m.editorialListLinkText}
        </Link>
      </div>

      <FeedFilters articles={articles as Record<string, unknown>[]} maxItems={48} rooms={rooms} />
    </div>
  );
}
