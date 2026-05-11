"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { images } from "@/config/images";

const heights = ["h-56", "h-72", "h-64", "h-80", "h-60", "h-72"];
const ease = [0.22, 1, 0.36, 1] as const;

export function MasonryFeed({ articles, maxItems = 12 }: { articles: Array<Record<string, unknown>>; maxItems?: number }) {
  const reduce = useReducedMotion();
  const tiles = articles.slice(0, maxItems);
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {tiles.map((a, i) => (
        <motion.div
          key={String(a.slug)}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: (i % 8) * 0.04, ease }}
          className={`mb-4 break-inside-avoid ${heights[i % heights.length]}`}
        >
          <Link
            href={`/article/${a.slug}`}
            className="group relative block h-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-md transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-xl"
          >
            <Image
              src={String(a.featuredImage || images.gallery((i % 6) + 1))}
              alt={String(a.title)}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {String(a.categorySlug || "").replace(/-/g, " ")}
              </p>
              <p className="mt-1 font-heading text-lg leading-snug">{String(a.title)}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
