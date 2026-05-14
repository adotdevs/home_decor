export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/article/article-detail";
import { JsonLd, articleSchema, breadcrumbJsonLd, faqSchema } from "@/components/seo/json-ld";
import { getArticleBySlug, getRelatedArticles } from "@/services/article-service";
import { getReviewSummary, getReviewsJsonLd, listReviewsPublic } from "@/services/review-service";
import { buildMetadata } from "@/lib/utils/seo";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article: Record<string, unknown> | null = await getArticleBySlug(slug);
  if (!article) {
    return await buildMetadata({ title: "Article not found", description: "This article does not exist." });
  }
  return await buildMetadata({
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

  const [editorial, b, related, reviewSummary, reviewList, reviewLdItems] = await Promise.all([
    getHomeEditorialResolved(),
    getResolvedSiteBranding(),
    getRelatedArticles(
      { slug: article.slug, categorySlug: article.categorySlug, tags: article.tags },
      5,
    ),
    getReviewSummary(slug),
    listReviewsPublic(slug, "newest", 1, 8),
    getReviewsJsonLd(slug, 6),
  ]);

  const reviewsInitial = {
    summary: reviewSummary,
    reviews: reviewList.reviews,
    total: reviewList.total,
    page: reviewList.page,
    pages: reviewList.pages,
    sort: "newest" as const,
  };

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
      <JsonLd
        data={articleSchema(
          article as Record<string, unknown>,
          `/article/${article.slug}`,
          b.ogImage,
          b.url,
          {
            average: reviewSummary.average,
            count: reviewSummary.count,
            items: reviewLdItems,
          },
        )}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, b.url)} />
      {article.faq?.length ? <JsonLd data={faqSchema(article.faq)} /> : null}
      <ArticleDetail
        article={article as Record<string, unknown>}
        related={related as Array<Record<string, unknown>>}
        shareBaseUrl={b.url}
        reviewsInitial={reviewsInitial}
        relatedRailTitle={editorial.relatedStoriesTitle}
      />
    </>
  );
}
