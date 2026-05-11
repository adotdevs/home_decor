import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { ArticleCard } from "@/components/article/article-card";
import { buildMetadata } from "@/lib/utils/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string; subcategorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  const catLabel = categorySlug.replaceAll("-", " ");
  const subLabel = subcategorySlug.replaceAll("-", " ");
  return buildMetadata({
    title: `${subLabel} — ${catLabel} decor guides & ideas`,
    description: `Curated ${subLabel} inspiration inside ${catLabel}: styling notes, FAQs, and shoppable-adjacent editorial picks.`,
    path: `/category/${categorySlug}/${subcategorySlug}`,
    keywords: [subLabel, catLabel, "home decor", "interior styling"],
  });
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  await connectDb();
  const [subDoc, articles] = await Promise.all([
    Category.findOne({ slug: subcategorySlug, parentSlug: categorySlug, isActive: true }).lean(),
    Article.find({ categorySlug, subcategorySlug, status: "published" }).sort({ publishedAt: -1 }).limit(24).lean(),
  ]);

  const subName =
    (subDoc as { name?: string } | null)?.name || subcategorySlug.replaceAll("-", " ");
  const catName = categorySlug.replaceAll("-", " ");

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${categorySlug}`} className="capitalize hover:underline">
          {catName}
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-foreground">{subName}</span>
      </nav>
      <h1 className="mt-6 font-heading text-4xl capitalize leading-tight md:text-5xl">{subName}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Deep-dive stories for this {catName} slice — room-ready advice, layered imagery, and internal links to related tags.
      </p>
      <div className="mt-10 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(articles as Record<string, unknown>[]).map((a) => (
          <ArticleCard key={String(a.slug)} article={a as never} />
        ))}
      </div>
      {articles.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No published stories in this subcategory yet.</p>
      ) : null}
    </div>
  );
}
