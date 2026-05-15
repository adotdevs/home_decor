import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { listPublishedArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";
import { getLatestMarketingMerged } from "@/services/site-page-marketing-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata() {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getLatestMarketingMerged()]);
  return await buildMetadata({
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    path: "/latest",
    keywords: ["latest home decor", "new interior guides", "decor editorials"],
  });
}

export default async function LatestPage() {
  const [articles, m] = await Promise.all([listPublishedArticles(24), getLatestMarketingMerged()]);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Latest</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl font-semibold md:text-5xl">{m.h1}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{m.intro}</p>
      <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-5 md:grid-cols-3 md:p-6">
        {m.bulletColumns.map((col) => (
          <div key={col.title}>
            <h2 className="font-heading text-lg font-semibold">{col.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{col.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: { slug?: string }) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
    </div>
  );
}
