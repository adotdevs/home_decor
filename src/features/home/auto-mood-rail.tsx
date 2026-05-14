"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { editorialEase } from "@/styles/motion";
import { resolveArticleFeaturedAlt } from "@/lib/image-alt";

export function AutoMoodRail({
  title,
  dek,
  articles,
}: {
  title: string;
  dek: string;
  articles: Array<Record<string, unknown>>;
}) {
  const reduce = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduce || articles.length < 2) return;
    const id = window.setInterval(() => setOffset((o) => (o + 1) % articles.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce, articles.length]);

  if (!articles.length) return null;
  const a = articles[offset % articles.length];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{dek}</p>
        </div>
      </div>
      <motion.div
        key={String(a.slug)}
        initial={reduce ? false : { opacity: 0.92, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: editorialEase }}
        className="mt-8"
      >
        <Link
          href={`/article/${a.slug}`}
          className="group relative block overflow-hidden rounded-3xl border border-black/5 bg-card shadow-lg"
        >
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <Image
              src={String(a.featuredImage || "/images/heroes/editorial-living.jpg")}
              alt={resolveArticleFeaturedAlt(a)}
              fill
              className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.03]"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <p className="font-heading text-2xl text-white md:text-4xl">{String(a.title)}</p>
              <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">{String(a.excerpt || "").slice(0, 180)}…</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
