"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FeaturedRail({ articles }: { articles: Array<Record<string, unknown>> }) {
  const reduce = useReducedMotion();
  if (!articles.length) return null;

  return (
    <div
      className="no-scrollbar -mx-px flex min-w-0 w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-2"
      style={{ scrollPaddingInline: "1rem" }}
    >
      {articles.slice(0, 6).map((a, i) => (
        <motion.div
          key={String(a.slug)}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px", amount: 0.15 }}
          transition={{ duration: 0.68, delay: reduce ? 0 : i * 0.045, ease }}
          className="w-[min(21rem,calc(100vw-2.5rem))] shrink-0 snap-center sm:w-[min(22rem,calc(100vw-3rem))] md:w-[340px]"
        >
          <Link
            href={`/article/${a.slug}`}
            className="group block overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
                alt={String(a.title)}
                fill
                className="object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/62" />
              <p className="absolute bottom-3 left-3 right-3 font-heading text-xl leading-snug text-white drop-shadow-sm">
                {String(a.title)}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
