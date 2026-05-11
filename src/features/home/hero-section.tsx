"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { images } from "@/config/images";
import { siteConfig } from "@/config/site";

/** Editorial / product-style easing (smooth deceleration, no bounce) */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.052, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease },
  },
};

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-5 sm:pb-8 sm:pt-7 md:px-12 md:pb-14 md:pt-12 lg:px-16 lg:pb-16 lg:pt-14 xl:px-20">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-black/5 shadow-[0_25px_60px_-18px_rgba(28,25,23,0.35)] sm:rounded-[1.75rem] md:rounded-[2.75rem] lg:rounded-[2.85rem]">
        {/* Desktop: slightly taller than 21/9 so headline + deck + CTAs never clip under overflow-hidden */}
        <div className="relative w-full max-md:min-h-[min(72vh,520px)] md:aspect-[2/1]">
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.035, opacity: 0.92 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 1.85, ease }}
          >
            <Image
              src={images.heroes.editorialLiving}
              alt="Sunlit living room with layered neutral decor and sculptural lighting"
              fill
              priority
              className="object-cover object-center md:object-[center_42%]"
              sizes="(max-width: 768px) 100vw, 1280px"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/35 to-black/15 md:bg-gradient-to-r md:from-black/60 md:via-black/28 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent md:bg-gradient-to-br md:from-transparent" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex max-w-full flex-col justify-end max-md:pb-[env(safe-area-inset-bottom,0px)] md:inset-x-0 md:max-w-none md:items-stretch md:justify-end lg:max-w-none">
            <motion.div
              className="pointer-events-auto max-w-full px-5 pb-7 pt-10 sm:px-7 sm:pb-8 sm:pt-14 md:px-12 md:pb-12 md:pt-10 lg:px-16 lg:pb-14 lg:pt-12 xl:px-20 xl:pb-16"
              variants={container}
              initial={reduce ? "show" : "hidden"}
              animate="show"
            >
              <motion.p
                variants={item}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs sm:tracking-[0.32em]"
              >
                Pinterest-style decor studio
              </motion.p>
              <motion.h1
                variants={item}
                className="mt-3 max-w-[min(22ch,calc(100vw-2rem))] font-heading text-[2rem] font-semibold leading-[1.12] tracking-tight text-white drop-shadow-md sm:mt-4 sm:max-w-xl sm:text-4xl sm:leading-[1.1] md:mt-5 md:max-w-3xl md:text-5xl md:leading-[1.08] lg:max-w-4xl lg:text-6xl lg:leading-[1.06] xl:max-w-5xl xl:text-7xl"
              >
                The home you want is built in layers — we show you how.
              </motion.h1>
              <motion.p
                variants={item}
                className="mt-4 max-w-xl text-sm leading-relaxed text-white/92 sm:text-base md:mt-5 md:text-lg lg:max-w-2xl"
              >
                {siteConfig.description}
              </motion.p>
              <motion.div variants={item} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:mt-9 md:gap-4">
                <Link
                  href="/inspiration/feed"
                  className="inline-flex w-full min-h-11 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-[transform,box-shadow,background-color] duration-300 ease-out hover:bg-white/98 hover:shadow-[0_12px_36px_rgba(0,0,0,0.18)] active:scale-[0.99] sm:w-auto"
                >
                  Browse inspiration feed
                </Link>
                <Link
                  href="/latest"
                  className="inline-flex w-full min-h-11 items-center justify-center rounded-full border border-white/45 bg-white/12 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition-[transform,background-color,border-color] duration-300 ease-out hover:border-white/55 hover:bg-white/18 active:scale-[0.99] sm:w-auto"
                >
                  Latest editorials
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
