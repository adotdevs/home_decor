"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { images } from "@/config/images";
import { siteConfig } from "@/config/site";
import { editorialEase, motionDurations } from "@/styles/motion";

const slides = [
  {
    src: images.heroes.editorialLiving,
    alt: "Sunlit living room with layered neutral decor",
    title: "Living — layered light",
    href: "/category/decoration",
  },
  {
    src: images.heroes.luxeBedroom,
    alt: "Serene bedroom with soft textiles",
    title: "Bedroom — soft structure",
    href: "/category/bedroom",
  },
  {
    src: images.heroes.openKitchen,
    alt: "Bright kitchen with natural materials",
    title: "Kitchen — honest materials",
    href: "/category/kitchen-and-table",
  },
] as const;

export function HeroCarousel() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [reduce]);

  const slide = slides[i];

  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-5 sm:pb-8 sm:pt-7 md:px-8 md:pb-12 md:pt-10">
      <header className="mx-auto max-w-4xl text-center md:text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-xs sm:tracking-[0.32em]">
          Pinterest-style decor studio
        </p>
        <h1 className="mt-3 font-heading text-[2rem] font-semibold leading-[1.12] tracking-tight sm:text-4xl sm:leading-[1.1] md:mt-4 md:text-5xl md:leading-[1.08] lg:text-6xl lg:leading-[1.06]">
          The home you want is built in layers — we show you how.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-5 md:text-lg md:leading-relaxed">
          {siteConfig.description}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap md:mt-8 md:justify-start">
          <Link
            href="/inspiration/feed"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 active:scale-[0.99]"
          >
            Browse inspiration feed
          </Link>
          <Link
            href="/latest"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-[0.99]"
          >
            Latest editorials
          </Link>
        </div>
      </header>

      <div className="relative mt-8 md:mt-10 lg:mt-12">
        <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-black/5 shadow-xl md:aspect-[2.35/1]">
          {slides.map((s, idx) => (
            <motion.div
              key={s.src}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: idx === i ? 1 : 0, scale: idx === i ? 1 : 1.04 }}
              transition={{ duration: reduce ? 0 : motionDurations.carousel, ease: editorialEase }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1280px"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            </motion.div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-6 md:flex-row md:items-end md:justify-between md:p-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/85">Room focus</p>
              <p className="mt-2 font-heading text-2xl text-white md:text-4xl">{slide.title}</p>
            </div>
            <Link
              href={slide.href}
              className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-white/95"
            >
              Explore the room
            </Link>
          </div>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
