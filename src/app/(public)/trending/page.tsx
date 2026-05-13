import Link from "next/link";
import { listTrendingArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";
import { TrendingFilters } from "@/components/trending/trending-filters";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return await buildMetadata({
    title: "Trending decor ideas — most loved guides",
    description:
      "High-engagement room playbooks readers return to: seasonal refreshes, quiet luxury, and family-friendly layouts.",
    path: "/trending",
    keywords: ["trending decor", "popular room guides", "home styling"],
  });
}

export default async function TrendingPage() {
  const raw = await listTrendingArticles(30);
  const articles = raw as Record<string, unknown>[];

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Trending</span>
      </nav>

      <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight md:text-5xl">
        Trending now
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Editorial pieces with the strongest engagement signals — refreshed often as the community
        saves and shares. Filter by time period to discover what&rsquo;s surging right now.
      </p>

      <TrendingFilters articles={articles} />
    </div>
  );
}
