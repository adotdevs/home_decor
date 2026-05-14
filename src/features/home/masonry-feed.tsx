"use client";

import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { MasonryReveal } from "@/components/motion/wrappers";
import { images } from "@/config/images";
import { editorialEase } from "@/styles/motion";
import { resolveArticleFeaturedAlt } from "@/lib/image-alt";

const heights = ["h-56", "h-72", "h-64", "h-80", "h-60", "h-72"];

export function MasonryFeed({ articles, maxItems = 12 }: { articles: Array<Record<string, unknown>>; maxItems?: number }) {
  const reduce = useReducedMotion();
  const tiles = articles.slice(0, maxItems);
  return (
    <div className="min-w-0 columns-1 gap-4 sm:columns-2 lg:columns-3">
      {tiles.map((a, i) => (
        <MasonryReveal
          key={String(a.slug)}
          delay={reduce ? 0 : (i % 6) * 0.035}
          duration={0.65}
          transition={{ ease: editorialEase }}
          className={`mb-4 break-inside-avoid ${heights[i % heights.length]}`}
        >
          <Link
            href={`/article/${a.slug}`}
            className="group relative block h-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-md transition-[box-shadow,transform] duration-[580ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Image
              src={String(a.featuredImage || images.gallery((i % 6) + 1))}
              alt={resolveArticleFeaturedAlt(a)}
              fill
              className="object-cover transition-transform duration-[1.05s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {String(a.categorySlug || "").replace(/-/g, " ")}
              </p>
              <p className="mt-1 font-heading text-lg leading-snug">{String(a.title)}</p>
            </div>
          </Link>
        </MasonryReveal>
      ))}
    </div>
  );
}
