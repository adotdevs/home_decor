"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function FeaturedRail({ articles }: { articles: Array<Record<string, unknown>> }) {
  if (!articles.length) return null;
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
      {articles.slice(0, 6).map((a, i) => (
        <motion.div
          key={String(a.slug)}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="w-[min(85vw,340px)] shrink-0 snap-center"
        >
          <Link href={`/article/${a.slug}`} className="group block overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
                alt={String(a.title)}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="340px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
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
