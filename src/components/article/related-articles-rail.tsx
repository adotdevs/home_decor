import Link from "next/link";
import Image from "next/image";
import { ArticleRatingBadge } from "@/components/reviews/article-rating-badge";

export function RelatedArticlesRail({
  articles,
  title = "Related stories",
}: {
  articles: Array<Record<string, unknown>>;
  title?: string;
}) {
  if (!articles.length) return null;
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-4">
        {articles.map((a: Record<string, unknown>) => (
          <li key={String(a.slug)}>
            <Link href={`/article/${a.slug}`} className="group flex gap-3" data-analytics-kind="related_article">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
                  alt={String(a.title)}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">{String(a.title)}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">{String(a.categorySlug || "").replace(/-/g, " ")}</p>
                  <ArticleRatingBadge
                    average={Number(a.reviewAverage ?? 0)}
                    count={Number(a.reviewCount ?? 0)}
                    dense
                    className="scale-90"
                  />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
