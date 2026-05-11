"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { images } from "@/config/images";
import { editorialEase, motionDurations } from "@/styles/motion";

const textEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const AUTO_MS_DEFAULT = 7500;
const AUTO_MS_REDUCED = 9500;

const slides = [
  {
    src: images.heroes.editorialLiving,
    alt: "Sunlit living room with layered neutral decor",
    href: "/category/decoration",
    kicker: "Living",
    headline: "Rooms that feel lived in, still editorial",
    dek: "Light, seating, and quiet contrast — ideas you can copy without a full reno.",
    detail:
      "Browse layouts that balance negative space with tactile pieces: rugs that anchor the floor plan, lamps that draw the eye, and a sofa line that still leaves room for circulation.",
  },
  {
    src: images.heroes.luxeBedroom,
    alt: "Serene bedroom with soft textiles",
    href: "/category/bedroom",
    kicker: "Bedroom",
    headline: "Calm layers for real sleep",
    dek: "Bedding, drapes, and tones that stay soft after laundry day, not just install day.",
    detail:
      "We favor breathable layers you can refresh seasonally, blackout solutions that still feel romantic, and nightstand setups with cord discipline — small edits that read luxe on camera and off.",
  },
  {
    src: images.heroes.openKitchen,
    alt: "Bright kitchen with natural materials",
    href: "/category/kitchen-and-table",
    kicker: "Kitchen & table",
    headline: "Tables worth lingering at",
    dek: "Serveware, surfaces, and styling notes for hosts who care about the Tuesday night meal, too.",
    detail:
      "From counter vignettes that survive coffee spills to table stories built on mix-and-match ceramics, these guides prioritize function first — then the polish that makes guests linger.",
  },
] as const;

export function HeroCarousel() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);

  const tick = useCallback(() => {
    setI((v) => (v + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (autoPaused) return;
    const ms = reduce ? AUTO_MS_REDUCED : AUTO_MS_DEFAULT;
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
  }, [autoPaused, reduce, tick]);

  const onCarouselBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (!next || !e.currentTarget.contains(next)) setAutoPaused(false);
  }, []);

  const slide = slides[i];

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-5 sm:px-5 sm:pt-7 md:px-8 md:pt-10 lg:px-12 lg:pt-12">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-black/[0.06] bg-neutral-950 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.55)] sm:aspect-[5/6] md:aspect-[2.15/1] lg:aspect-[2.4/1]"
        onMouseEnter={() => setAutoPaused(true)}
        onMouseLeave={() => setAutoPaused(false)}
        onFocusCapture={() => setAutoPaused(true)}
        onBlurCapture={onCarouselBlur}
      >
        {slides.map((s, idx) => (
          <motion.div
            key={s.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: idx === i ? 1 : 0, scale: idx === i ? 1 : 1.03 }}
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
            {/* Base tone — keeps photos from reading too "hot" against white type */}
            <div className="absolute inset-0 bg-neutral-950/15" aria-hidden />
            {/* Mobile: headline sits top — lift a top scrim */}
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_120%_85%_at_50%_0%,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.35)_42%,transparent_68%)] md:hidden"
              aria-hidden
            />
            {/* Desktop + fallback: weight bottom-left where copy + CTAs sit */}
            <div
              className="absolute inset-0 hidden bg-[radial-gradient(ellipse_140%_120%_at_0%_100%,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.45)_38%,transparent_62%)] md:block"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25 md:bg-gradient-to-t md:from-black/65 md:via-transparent md:to-transparent"
              aria-hidden
            />
          </motion.div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-5 sm:p-7 md:flex-row md:items-end md:p-9 lg:p-11">
          <div className="pointer-events-auto md:max-w-lg md:pb-0 lg:max-w-xl">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={slide.src}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: reduce ? 0 : 0.45, ease: textEase }}
                aria-live="polite"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-white/80">{slide.kicker}</p>
                <h1 className="mt-3 max-w-xl font-heading text-[1.875rem] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:mt-4 sm:text-4xl sm:leading-[1.06] md:text-[2.35rem] lg:max-w-2xl lg:text-5xl lg:leading-[1.04] [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_12px_40px_rgba(0,0,0,0.45)]">
                  {slide.headline}
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/90 sm:mt-4 sm:max-w-md sm:text-[0.95rem] md:max-w-lg md:text-base [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                  {slide.dek}
                </p>
                <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/82 sm:max-w-md sm:text-[0.9375rem] md:max-w-lg md:text-[0.95rem] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                  {slide.detail}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
                  <Link
                    href={slide.href}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-neutral-900 shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition hover:bg-white/92"
                  >
                    Open guide
                  </Link>
                  <Link
                    href="/inspiration/feed"
                    className="text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] underline decoration-white/50 underline-offset-[6px] transition hover:text-white hover:decoration-white"
                  >
                    Inspiration feed
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="pointer-events-auto flex justify-center gap-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] md:absolute md:bottom-8 md:right-9 md:justify-end lg:bottom-9 lg:right-11"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((s, idx) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`${s.kicker}, slide ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 ${idx === i ? "w-8 bg-white" : "w-2 bg-white/35 hover:bg-white/55"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
