export const dynamic = "force-dynamic";
import Link from "next/link";
import { MasonryFeed } from "@/features/home/masonry-feed";
import { listPublishedArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export const metadata = buildMetadata({
  title: "Inspiration feed — Pinterest-style decor ideas",
  description:
    "Scroll an endless-style feed of editorial home decor stories: bedrooms, kitchens, baths, walls, and kids’ spaces.",
  path: "/inspiration/feed",
});

export default async function InspirationFeedPage() {
  const articles = await listPublishedArticles(48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Infinite-scroll mood</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">Inspiration feed</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Save-worthy visuals with substance — each tile links to a full article with FAQs, sources, and styling logic.
          </p>
        </div>
        <Link href="/latest" className="text-sm font-semibold text-primary hover:underline">
          Editorial list view →
        </Link>
      </div>
      <div className="mt-10">
        <MasonryFeed articles={articles as Record<string, unknown>[]} maxItems={48} />
      </div>
    </div>
  );
}
