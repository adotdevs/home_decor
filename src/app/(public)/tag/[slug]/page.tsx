export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { tagToPathSlug } from "@/data/tag-utils";
import { listArticlesByTagPath, listDistinctPublishedTags } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tags = await listDistinctPublishedTags();
  const label = tags.find((t) => tagToPathSlug(t) === slug) || slug.replace(/-/g, " ");
  return await buildMetadata({
    title: `${label} — decor ideas & guides`,
    description: `Editorial decor ideas, room guides, and styling notes tagged “${label}”.`,
    path: `/tag/${slug}`,
  });
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tags = await listDistinctPublishedTags();
  const known = tags.some((t) => tagToPathSlug(t) === slug);
  const articles = await listArticlesByTagPath(slug, 48);
  if (!known && articles.length === 0) notFound();

  const display = tags.find((t) => tagToPathSlug(t) === slug) || slug.replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="hover:underline">
          Tags
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{display}</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl font-semibold capitalize md:text-5xl">{display}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Everything we have published under this topic — long-form playbooks with FAQs, imagery, and actionable room advice.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a: { slug?: string }) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
      {articles.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No stories in this tag yet — explore the full library on the homepage.</p>
      ) : null}
    </div>
  );
}
