"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { images } from "@/config/images";
import { siteConfig } from "@/config/site";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 26, stiffness: 320 },
  },
};

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-6 pt-5 sm:px-5 sm:pb-8 sm:pt-7 md:px-8 md:pb-12 md:pt-10">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-black/5 shadow-[0_25px_60px_-18px_rgba(28,25,23,0.35)] sm:rounded-[1.75rem] md:rounded-[2.5rem]">
        {/* min-height on small screens avoids an overly short hero */}
        <div className="relative w-full max-md:min-h-[min(72vh,520px)] md:aspect-[21/9] lg:aspect-[21/8]">
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.06 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end max-md:pb-[env(safe-area-inset-bottom,0px)] md:max-w-2xl md:p-14 lg:max-w-[42rem] lg:p-16">
            <motion.div
              className="px-5 pb-7 pt-10 sm:px-7 sm:pb-8 sm:pt-14 md:px-0 md:pb-0 md:pt-0"
              variants={container}
              initial={reduce ? "show" : "hidden"}
              animate="show"
            >
              <motion.p variants={item} className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-xs sm:tracking-[0.32em]">
                Pinterest-style decor studio
              </motion.p>
              <motion.h1
                variants={item}
                className="mt-3 max-w-[18ch] font-heading text-[2rem] font-semibold leading-[1.08] tracking-tight text-white drop-shadow-md sm:mt-4 sm:max-w-none sm:text-4xl md:mt-5 md:text-5xl lg:text-6xl xl:text-7xl"
              >
                The home you want is built in layers — we show you how.
              </motion.h1>
              <motion.p variants={item} className="mt-4 max-w-xl text-sm leading-relaxed text-white/92 sm:text-base md:mt-5 md:text-lg">
                {siteConfig.description}
              </motion.p>
              <motion.div variants={item} className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:mt-8 md:gap-3">
                <motion.div whileHover={reduce ? undefined : { scale: 1.02 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                  <Link
                    href="/inspiration/feed"
                    className="inline-flex w-full min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-colors hover:bg-white/95 sm:w-auto"
                  >
                    Browse inspiration feed
                  </Link>
                </motion.div>
                <motion.div whileHover={reduce ? undefined : { scale: 1.02 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
                  <Link
                    href="/latest"
                    className="inline-flex w-full min-h-11 items-center justify-center rounded-full border border-white/45 bg-white/12 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:w-auto"
                  >
                    Latest editorials
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
