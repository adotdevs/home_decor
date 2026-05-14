import Link from "next/link";
import Image from "next/image";
import { ArticleRatingBadge } from "@/components/reviews/article-rating-badge";
import { isPublishedWithinLastDays } from "@/lib/utils/article-age";
import { cn } from "@/lib/utils";

type CardArticle = {
  title: string;
  slug: string;
  excerpt?: string;
  categorySlug?: string;
  readingTime?: number;
  featuredImage?: string;
  reviewAverage?: number;
  reviewCount?: number;
  publishedAt?: string | Date | null;
};

function ArticleNewPill({ onImage }: { onImage?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm backdrop-blur-md",
        onImage
          ? "border-white/35 bg-gradient-to-br from-white/25 to-white/10 text-white ring-1 ring-white/25"
          : "border-amber-200/80 bg-gradient-to-r from-amber-50 via-rose-50/90 to-orange-50/80 text-amber-950/90 ring-1 ring-amber-100/80 dark:border-amber-500/25 dark:from-amber-950/50 dark:via-rose-950/40 dark:to-orange-950/35 dark:text-amber-50 dark:ring-amber-800/30",
      )}
    >
      New
    </span>
  );
}

export function ArticleCard({ article }: { article: CardArticle }) {
  const avg = Number(article.reviewAverage ?? 0);
  const cnt = Number(article.reviewCount ?? 0);
  const showRating = cnt > 0 && avg > 0;
  const showNew = isPublishedWithinLastDays(article.publishedAt, 7);

  const href = `/article/${article.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={href} className="relative block h-48 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
        <Image
          src={article.featuredImage || `/images/categories/${article.categorySlug || "decoration"}.svg`}
          alt={`${article.title} inspiration visual`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={100}
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-end gap-1.5">
          {showNew ? <ArticleNewPill onImage /> : null}
          {showRating ? (
            <ArticleRatingBadge average={avg} count={cnt} dense className="bg-black/35 text-white ring-1 ring-white/20 dark:bg-black/50" />
          ) : null}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{article.categorySlug || "Decor"}</p>
          <div className="hidden items-center gap-1.5 sm:flex">
            {showNew ? <ArticleNewPill /> : null}
            {showRating ? <ArticleRatingBadge average={avg} count={cnt} dense /> : null}
          </div>
        </div>
        <h3 className="mt-2 font-heading text-xl leading-snug">
          <Link
            href={href}
            className="text-foreground outline-none transition hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{article.readingTime || 5} min read</span>
          <Link href={href} className="font-semibold text-foreground hover:underline">
            Read
          </Link>
        </div>
      </div>
    </article>
  );
}
