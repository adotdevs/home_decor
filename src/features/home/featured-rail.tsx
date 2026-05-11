"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const ease = [0.22, 1, 0.36, 1] as const;

export function FeaturedRail({ articles }: { articles: Array<Record<string, unknown>> }) {
  const reduce = useReducedMotion();
  if (!articles.length) return null;
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      {articles.slice(0, 6).map((a, i) => (
        <motion.div
          key={String(a.slug)}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.52, delay: i * 0.07, ease }}
          className="w-[min(85vw,340px)] shrink-0 snap-center"
        >
          <motion.div whileHover={reduce ? undefined : { y: -4 }} transition={{ type: "spring", damping: 26, stiffness: 320 }}>
            <Link href={`/article/${a.slug}`} className="group block overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition-shadow hover:shadow-xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
                  alt={String(a.title)}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
                  sizes="340px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent transition-opacity group-hover:from-black/65" />
                <p className="absolute bottom-3 left-3 right-3 font-heading text-xl leading-snug text-white drop-shadow-sm">
                  {String(a.title)}
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
