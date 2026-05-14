"use client";

import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { viewportPresets } from "@/lib/motion/presets";
import { ArticleRatingBadge } from "@/components/reviews/article-rating-badge";
import { editorialEase } from "@/styles/motion";
import { resolveArticleFeaturedAlt } from "@/lib/image-alt";

export function FeaturedRail({ articles }: { articles: Array<Record<string, unknown>> }) {
  const reduce = useReducedMotion();
  if (!articles.length) return null;

  return (
    <div
      className="no-scrollbar -mx-px flex min-w-0 w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2"
      style={{ scrollPaddingInline: "1rem" }}
    >
      {articles.slice(0, 6).map((a, i) => (
        <RevealOnScroll
          key={String(a.slug)}
          viewportMargin={viewportPresets.rail}
          viewportAmount={0.01}
          delay={reduce ? 0 : i * 0.045}
          duration={0.68}
          transition={{ ease: editorialEase }}
          className="w-[min(21rem,calc(100vw-2.5rem))] shrink-0 snap-center sm:w-[min(22rem,calc(100vw-3rem))] md:w-[340px]"
        >
          <Link
            href={`/article/${a.slug}`}
            className="group block overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
                alt={resolveArticleFeaturedAlt(a)}
                fill
                className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/62" />
              <div className="absolute right-2.5 top-2.5">
                <ArticleRatingBadge
                  average={Number(a.reviewAverage ?? 0)}
                  count={Number(a.reviewCount ?? 0)}
                  dense
                  className="border-0 bg-black/40 text-white ring-1 ring-white/25 backdrop-blur-md [&_span]:text-white"
                />
              </div>
              <p className="absolute bottom-3 left-3 right-3 font-heading text-xl leading-snug text-white drop-shadow-sm">
                {String(a.title)}
              </p>
            </div>
          </Link>
        </RevealOnScroll>
      ))}
    </div>
  );
}
