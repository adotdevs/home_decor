import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { listPublishedArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Latest editorials — new room guides & decor ideas",
    description: "Freshly published long-form decor stories: bedrooms, kitchens, baths, kids spaces, and wall moments.",
    path: "/latest",
    keywords: ["latest home decor", "new interior guides", "decor editorials"],
  });
}

export default async function LatestPage() {
  const articles = await listPublishedArticles(24);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Latest</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl font-semibold md:text-5xl">Latest stories</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Newest publishes first — save this view if you want the magazine cadence without algorithmic reordering.
      </p>
      <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: { slug?: string }) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
    </div>
  );
}
