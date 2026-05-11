import { absoluteUrl } from "@/lib/utils/seo";
import { siteConfig } from "@/config/site";

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function articleSchema(article: Record<string, unknown>, path: string) {
  const imgRaw = article.featuredImage as string | undefined;
  const image = imgRaw?.startsWith("http") ? imgRaw : absoluteUrl(imgRaw || siteConfig.ogImage);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Person", name: article.authorName || "Editorial Team" },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    image,
    mainEntityOfPage: absoluteUrl(path),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: absoluteUrl(x.path),
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
