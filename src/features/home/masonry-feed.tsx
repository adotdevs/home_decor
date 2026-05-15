"use client";

import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { MasonryReveal } from "@/components/motion/wrappers";
import { images } from "@/config/images";
import { editorialEase } from "@/styles/motion";
import { resolveArticleFeaturedAlt } from "@/lib/image-alt";
import { cn } from "@/lib/utils";

/** Single portrait ratio keeps column masonry aligned — jagged bottoms come from caption length, not wildly different tile heights. */
const TILE_ASPECT = "aspect-[3/4]";

export function MasonryFeed({
  articles,
  maxItems = 12,
  /** Wider pages (`/inspiration/feed`) can add a 4th column on `xl`; homepage stays at 3 to match the sidebar layout. */
  wideLayout = false,
}: {
  articles: Array<Record<string, unknown>>;
  maxItems?: number;
  wideLayout?: boolean;
}) {
  const reduce = useReducedMotion();
  const tiles = articles.slice(0, maxItems);
  return (
    <div
      className={
        wideLayout
          ? "min-w-0 columns-1 gap-3 sm:gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
          : "min-w-0 columns-1 gap-3 sm:gap-4 sm:columns-2 lg:columns-3"
      }
    >
      {tiles.map((a, i) => (
        <MasonryReveal
          key={String(a.slug)}
          delay={reduce ? 0 : (i % 6) * 0.035}
          duration={0.65}
          transition={{ ease: editorialEase }}
          className="mb-3 w-full break-inside-avoid sm:mb-4"
        >
          <Link
            href={`/article/${a.slug}`}
            className={cn(
              "group relative block w-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-md transition-[box-shadow,transform] duration-[580ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl",
              TILE_ASPECT,
            )}
          >
            <Image
              src={String(a.featuredImage || images.gallery((i % 6) + 1))}
              alt={resolveArticleFeaturedAlt(a)}
              fill
              className="object-cover transition-transform duration-[1.05s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {String(a.categorySlug || "").replace(/-/g, " ")}
              </p>
              <p className="mt-1 line-clamp-3 font-heading text-base leading-snug sm:text-lg">{String(a.title)}</p>
            </div>
          </Link>
        </MasonryReveal>
      ))}
    </div>
  );
}
