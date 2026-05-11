export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/article/article-detail";
import { JsonLd, articleSchema, breadcrumbJsonLd, faqSchema } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getArticleBySlug, getRelatedArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article: Record<string, unknown> | null = await getArticleBySlug(slug);
  if (!article) return buildMetadata({ title: "Article not found", description: "This article does not exist." });
  return buildMetadata({
    title: String(article.seoTitle || article.title),
    description: String(article.seoDescription || article.excerpt),
    path: `/article/${article.slug}`,
    keywords: (article.tags as string[] | undefined) || undefined,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return notFound();

  const related = await getRelatedArticles(
    { slug: article.slug, categorySlug: article.categorySlug, tags: article.tags },
    5,
  );

  const cat = String(article.categorySlug || "");
  const sub = String(article.subcategorySlug || "");
  const crumbs = [
    { name: "Home", path: "/" },
    { name: cat.replace(/-/g, " ") || "Ideas", path: `/category/${cat}` },
    ...(sub ? [{ name: sub.replace(/-/g, " "), path: `/category/${cat}/${sub}` }] : []),
    { name: String(article.title).slice(0, 60), path: `/article/${article.slug}` },
  ];

  return (
    <>
      <JsonLd data={articleSchema(article as Record<string, unknown>, `/article/${article.slug}`)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {article.faq?.length ? <JsonLd data={faqSchema(article.faq)} /> : null}
      <ArticleDetail
        article={article as Record<string, unknown>}
        related={related as Array<Record<string, unknown>>}
        shareBaseUrl={siteConfig.url}
      />
    </>
  );
}
