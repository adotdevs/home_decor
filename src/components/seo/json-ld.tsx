import { absoluteUrl } from "@/lib/utils/seo";

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function articleSchema(
  article: Record<string, unknown>,
  path: string,
  ogFallback: string,
  baseUrl: string,
  reviews?: { average: number; count: number; items?: Record<string, unknown>[] },
) {
  const imgRaw = article.featuredImage as string | undefined;
  const image = imgRaw?.startsWith("http") ? imgRaw : absoluteUrl(imgRaw || ogFallback, baseUrl);
  const out: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: "Editorial Team" },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    image,
    mainEntityOfPage: absoluteUrl(path, baseUrl),
  };
  if (reviews && reviews.count > 0 && reviews.average > 0) {
    out.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviews.average,
      ratingCount: reviews.count,
      reviewCount: reviews.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (reviews?.items?.length) {
    out.review = reviews.items;
  }
  return out;
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: absoluteUrl(x.path, baseUrl),
    })),
  };
}

export function faqSchema(faq: ReadonlyArray<{ readonly question: string; readonly answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}
