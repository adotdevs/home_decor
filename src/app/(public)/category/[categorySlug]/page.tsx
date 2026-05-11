import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/article/article-card";
import { buildMetadata } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { categorySlug } = await params;
  const label = categorySlug.replaceAll("-", " ");
  return buildMetadata({
    title: `${label} ideas & styling guides — Luxe Home Decor Ideas`,
    description: `Explore ${label} decor editorials, room playbooks, and Pinterest-worthy inspiration.`,
    path: `/category/${categorySlug}`,
    keywords: [label, "home decor", "interior inspiration"],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  await connectDb();
  const [subs, articles] = await Promise.all([
    Category.find({ parentSlug: categorySlug, isActive: true }).lean(),
    Article.find({ categorySlug, status: "published" }).sort({ publishedAt: -1 }).limit(24).lean(),
  ]);

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-foreground">{categorySlug.replaceAll("-", " ")}</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl capitalize leading-tight md:text-5xl">{categorySlug.replaceAll("-", " ")}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Subcategory playbooks below — each opens a long-form styling guide with FAQs, imagery, and internal links.
      </p>
      <div className="mt-8 flex min-w-0 flex-wrap gap-3">
        {(subs as { slug: string; name: string }[]).map((s) => (
          <Link
            key={s.slug}
            className="rounded-full border bg-card px-4 py-2 text-sm transition hover:border-primary"
            href={`/category/${categorySlug}/${s.slug}`}
          >
            {s.name}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(articles as Record<string, unknown>[]).map((a) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
    </div>
  );
}
