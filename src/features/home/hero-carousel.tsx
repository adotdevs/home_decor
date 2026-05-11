"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { images } from "@/config/images";
import { editorialEase, motionDurations } from "@/styles/motion";

const textEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const slides = [
  {
    src: images.heroes.editorialLiving,
    alt: "Sunlit living room with layered neutral decor",
    href: "/category/decoration",
    kicker: "Living",
    headline: "Layered neutrals, quiet depth",
    dek: "Seating, light, and layout ideas edited for saves — and for real life.",
  },
  {
    src: images.heroes.luxeBedroom,
    alt: "Serene bedroom with soft textiles",
    href: "/category/bedroom",
    kicker: "Bedroom",
    headline: "Soft structure, better rest",
    dek: "Bedding, drapery, and texture mixes that feel calm — never staged.",
  },
  {
    src: images.heroes.openKitchen,
    alt: "Bright kitchen with natural materials",
    href: "/category/kitchen-and-table",
    kicker: "Kitchen & table",
    headline: "Honest materials, daily ritual",
    dek: "Table moments, surfaces, and styling notes for hosts who sweat the details.",
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
    <section className="relative mx-auto max-w-7xl px-4 pt-5 sm:px-5 sm:pt-7 md:px-8 md:pt-10 lg:px-12 lg:pt-12">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] border border-black/5 shadow-[0_28px_64px_-20px_rgba(28,25,23,0.42)] sm:rounded-3xl sm:aspect-[10/11] md:aspect-[2.2/1] lg:aspect-[2.35/1]">
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
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 1280px"
              priority={idx === 0}
            />
            {/* Readability at top for copy; lighter toward bottom so photography breathes */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/[0.22] to-black/15 md:from-black/55 md:via-black/10 md:to-transparent" />
          </motion.div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-6 sm:px-6 sm:pt-7 md:px-9 md:pt-8 lg:px-11 lg:pt-10">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={slide.src}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.38, ease: textEase }}
              className="pointer-events-auto max-w-[min(100%,26rem)] rounded-2xl border border-white/[0.14] bg-black/22 px-5 py-5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-[14px] sm:max-w-lg sm:rounded-[1.35rem] sm:px-6 sm:py-6 md:max-w-xl md:px-8 md:py-7"
            >
              <span className="inline-flex items-center rounded-full border border-white/18 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/92 sm:text-[11px] sm:tracking-[0.26em]">
                {slide.kicker}
              </span>
              <h1 className="mt-3.5 font-heading text-[1.55rem] font-medium leading-[1.12] tracking-[-0.02em] text-white sm:mt-4 sm:text-3xl sm:leading-[1.1] md:mt-5 md:text-4xl md:leading-[1.08] lg:text-[2.5rem]">
                {slide.headline}
              </h1>
              <p className="mt-2.5 border-l-2 border-white/25 pl-3.5 text-[0.8125rem] leading-relaxed text-white/[0.88] sm:mt-3 sm:text-[0.9375rem] md:max-w-md md:text-base">
                {slide.dek}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <Link
                  href={slide.href}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/96 active:scale-[0.99]"
                >
                  Explore this edit
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/inspiration/feed"
                    className="inline-flex min-h-9 items-center rounded-full border border-white/35 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/95 transition hover:border-white/50 hover:bg-white/10 sm:text-[13px] sm:normal-case sm:tracking-normal"
                  >
                    Inspiration feed
                  </Link>
                  <Link
                    href="/latest"
                    className="inline-flex min-h-9 items-center rounded-full border border-transparent px-4 py-2 text-xs font-semibold text-white/90 underline decoration-white/35 underline-offset-[5px] transition hover:text-white hover:decoration-white/80 sm:text-[13px]"
                  >
                    Latest stories
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-6 md:bottom-7"
          role="tablist"
          aria-label="Hero slides"
        >
          {slides.map((s, idx) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Slide ${idx + 1}: ${s.kicker}`}
              className={`group relative h-2 rounded-full transition-[width,background-color] duration-300 ease-out ${idx === i ? "w-9 bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]" : "w-2 bg-white/40 hover:bg-white/65"}`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
