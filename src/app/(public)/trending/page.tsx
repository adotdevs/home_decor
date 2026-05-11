import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { listTrendingArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Trending decor ideas — most loved guides",
    description:
      "High-engagement room playbooks readers return to: seasonal refreshes, quiet luxury, and family-friendly layouts.",
    path: "/trending",
    keywords: ["trending decor", "popular room guides", "home styling"],
  });
}

export default async function TrendingPage() {
  const articles = await listTrendingArticles(18);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Trending</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight md:text-5xl">Trending now</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Editorial pieces with the strongest engagement signals this cycle — refreshed often as the community saves and shares.
      </p>
      <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: { slug?: string }) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
    </div>
  );
}
