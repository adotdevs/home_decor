"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import type { HeroSlideConfig } from "@/config/home-editorial-defaults";
import { DEFAULT_HERO_SLIDES } from "@/config/home-editorial-defaults";
import { editorialEase, motionDurations } from "@/styles/motion";
import { resolveHeroSlideAlt } from "@/lib/image-alt";

const AUTO_MS_DEFAULT = 7500;
const AUTO_MS_REDUCED = 9500;

function interactiveTarget(el: EventTarget | null) {
  return (el as HTMLElement | null)?.closest?.("a, button, input, textarea, select, [role='tab']");
}

type HeroSlidePaneProps = { slide: HeroSlideConfig; idx: number };

function HeroSlidePane({ slide, idx }: HeroSlidePaneProps) {
  const kicker = slide.kicker?.trim() || "Editorial";
  const headline = slide.headline?.trim() || "Ideas worth saving to your boards";
  const dek = slide.dek?.trim() ?? "";
  const detail = slide.detail?.trim() ?? "";

  return (
    <article
      className="flex w-full min-w-0 shrink-0 snap-start snap-always flex-[0_0_100%] flex-col"
      aria-roledescription="slide"
      aria-label={`${kicker}: ${headline}`}
    >
      <div className="relative flex w-full flex-col md:block md:aspect-[2.15/1] lg:aspect-[2.35/1]">
        <div className="relative h-[12.5rem] w-full shrink-0 overflow-hidden sm:h-[14rem] md:absolute md:inset-0 md:h-auto md:min-h-0">
          <Image
            src={slide.src}
            alt={resolveHeroSlideAlt(slide)}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1280px"
            priority={idx === 0}
          />
          <div className="absolute inset-0 bg-neutral-950/15" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 md:hidden"
            aria-hidden
          />
          <div
            className="absolute inset-0 hidden bg-[radial-gradient(ellipse_140%_120%_at_0%_100%,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.45)_38%,transparent_62%)] md:block"
            aria-hidden
          />
          <div
            className="absolute inset-0 hidden bg-gradient-to-t from-black/65 via-transparent to-transparent md:block"
            aria-hidden
          />
        </div>

        <div className="relative z-10 flex min-w-0 flex-col gap-4 bg-neutral-950 px-4 py-4 pb-5 text-white sm:gap-5 sm:px-5 sm:py-5 md:absolute md:inset-0 md:justify-end md:bg-transparent md:p-8 md:pb-24 lg:p-11 lg:pb-28">
          <div className="pointer-events-auto min-w-0 md:max-w-lg lg:max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-white/70 md:text-white/80">{kicker}</p>
            {idx === 0 ? (
              <h1 className="mt-2 max-w-full text-balance break-words font-heading text-[1.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:mt-2.5 sm:text-[1.65rem] md:mt-3 md:max-w-xl md:text-[2.35rem] lg:max-w-2xl lg:text-5xl lg:leading-[1.04] md:[text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_12px_40px_rgba(0,0,0,0.45)]">
                {headline}
              </h1>
            ) : (
              <h2 className="mt-2 max-w-full text-balance break-words font-heading text-[1.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-white sm:mt-2.5 sm:text-[1.65rem] md:mt-3 md:max-w-xl md:text-[2.35rem] lg:max-w-2xl lg:text-5xl lg:leading-[1.04] md:[text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_12px_40px_rgba(0,0,0,0.45)]">
                {headline}
              </h2>
            )}
            {dek ? (
              <p className="mt-2 max-w-full break-words text-sm leading-relaxed text-white/85 md:mt-3 md:max-w-lg md:text-base md:text-white/90 md:[text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                {dek}
              </p>
            ) : null}
            {detail ? (
              <p className="mt-1.5 max-w-full break-words text-sm leading-relaxed text-white/75 sm:mt-2 md:max-w-lg md:text-[0.95rem] md:text-white/82 md:[text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                {detail}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-5 md:mt-7 md:gap-4">
              <Link
                href={slide.href}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-neutral-900 shadow-md transition hover:bg-white/92 md:shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
              >
                Open guide
              </Link>
              <Link
                href="/inspiration/feed"
                className="text-sm font-medium text-white/90 underline decoration-white/40 underline-offset-[6px] transition hover:text-white hover:decoration-white md:[text-shadow:0_1px_3px_rgba(0,0,0,0.9)]"
              >
                Inspiration feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HeroCarousel({ slides }: { slides: HeroSlideConfig[] }) {
  const list = slides.length ? slides : DEFAULT_HERO_SLIDES;
  const listVersion = list.map((s) => `${s.src}\0${s.href}`).join("|");
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const mouseInsideRef = useRef(false);
  const dragActiveRef = useRef(false);
  const focusedInsideRef = useRef(false);
  const [i, setI] = useState(0);
  const dragRef = useRef<{
    startX: number;
    startScroll: number;
    lastX: number;
    lastT: number;
  } | null>(null);
  const dragMovedRef = useRef(false);

  const shouldPauseAuto = useCallback(
    () => mouseInsideRef.current || dragActiveRef.current || focusedInsideRef.current,
    [],
  );

  useEffect(() => {
    indexRef.current = i;
  }, [i]);

  useEffect(() => {
    setI(0);
    const el = scrollRef.current;
    if (el) el.scrollLeft = 0;
  }, [listVersion]);

  const scrollToIndex = useCallback(
    (idx: number, behavior: ScrollBehavior) => {
      const el = scrollRef.current;
      if (!el) return;
      const w = el.clientWidth || 1;
      const clamped = Math.max(0, Math.min(list.length - 1, idx));
      el.scrollTo({ left: clamped * w, behavior });
      setI(clamped);
    },
    [list.length],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const syncFromScroll = () => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setI(Math.max(0, Math.min(list.length - 1, idx)));
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => syncFromScroll());
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", syncFromScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", syncFromScroll);
    };
  }, [list.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 1;
      el.scrollLeft = indexRef.current * w;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const ms = reduce ? AUTO_MS_REDUCED : AUTO_MS_DEFAULT;
    const id = window.setInterval(() => {
      if (shouldPauseAuto()) return;
      const el = scrollRef.current;
      if (!el) return;
      const w = el.clientWidth || 1;
      const cur = Math.round(el.scrollLeft / w);
      const next = (cur + 1) % list.length;
      el.scrollTo({ left: next * w, behavior: reduce ? "auto" : "smooth" });
      setI(next);
    }, ms);
    return () => window.clearInterval(id);
  }, [reduce, list.length, shouldPauseAuto]);

  const resolveDragSnapTarget = useCallback(
    (scrollLeft: number, clientWidth: number, swipeDx: number, velX: number) => {
      const n = list.length;
      const w = Math.max(clientWidth, 1);
      const cur = scrollLeft / w;
      /** Low distance gate so one deliberate swipe (~48–60px or ~9%) advances one slide. */
      const distanceT = Math.max(48, Math.min(60, w * 0.09));
      /** Quick flick snaps one slide regardless of absolute distance */
      const velT = 0.35;

      let t = Math.round(cur);
      if (velX < -velT || swipeDx >= distanceT) {
        t = Math.min(n - 1, Math.floor(cur + 0.02) + 1);
      } else if (velX > velT || swipeDx <= -distanceT) {
        t = Math.max(0, Math.ceil(cur - 0.02) - 1);
      }

      return Math.max(0, Math.min(n - 1, t));
    },
    [list.length],
  );

  const finishPointerDrag = useCallback(
    (clientX: number, pointerId: number) => {
      const el = scrollRef.current;
      const d = dragRef.current;
      dragRef.current = null;
      dragActiveRef.current = false;

      try {
        el?.releasePointerCapture(pointerId);
      } catch {
        /* not capturing */
      }

      if (!el || !d) return;

      const w = el.clientWidth || 1;
      const now = performance.now();
      const dt = Math.max(1e-6, now - d.lastT);
      const velX = (clientX - d.lastX) / dt;
      const swipeDx = d.startX - clientX;

      const targetIdx = resolveDragSnapTarget(el.scrollLeft, w, swipeDx, velX);
      const dest = targetIdx * w;
      const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

      if (Math.abs(el.scrollLeft - dest) > 2) el.scrollTo({ left: dest, behavior });
      setI(targetIdx);
    },
    [reduce, resolveDragSnapTarget],
  );

  const onRegionBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (!next || !e.currentTarget.contains(next)) focusedInsideRef.current = false;
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-5 sm:px-5 sm:pt-7 md:px-8 md:pt-10 lg:px-12 lg:pt-12">
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-neutral-950 shadow-[0_24px_80px_-28px_rgba(0,0,0,0.55)]"
        initial={reduce ? false : { y: 28, scale: 0.93 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: reduce ? 0 : motionDurations.entrance, ease: editorialEase }}
        onMouseEnter={() => {
          mouseInsideRef.current = true;
        }}
        onMouseLeave={() => {
          mouseInsideRef.current = false;
        }}
      >
        <div
          ref={scrollRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured guides"
          tabIndex={0}
          className={[
            "flex w-full min-w-0 cursor-grab touch-pan-x select-none overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing",
            "snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
            "[&::-webkit-scrollbar]:hidden",
          ].join(" ")}
          onFocusCapture={() => {
            focusedInsideRef.current = true;
          }}
          onBlurCapture={onRegionBlur}
          onKeyDown={(e) => {
            const el = scrollRef.current;
            if (!el) return;
            const w = el.clientWidth || 1;
            const cur = Math.round(el.scrollLeft / w);
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              scrollToIndex(cur - 1, reduce ? "auto" : "smooth");
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              scrollToIndex(cur + 1, reduce ? "auto" : "smooth");
            } else if (e.key === "Home") {
              e.preventDefault();
              scrollToIndex(0, reduce ? "auto" : "smooth");
            } else if (e.key === "End") {
              e.preventDefault();
              scrollToIndex(list.length - 1, reduce ? "auto" : "smooth");
            }
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if (interactiveTarget(e.target)) return;
            const el = scrollRef.current;
            if (!el) return;
            const now = performance.now();
            dragRef.current = {
              startX: e.clientX,
              startScroll: el.scrollLeft,
              lastX: e.clientX,
              lastT: now,
            };
            dragMovedRef.current = false;
            dragActiveRef.current = true;
            el.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            const el = scrollRef.current;
            if (!d || !el) return;
            const dx = e.clientX - d.startX;
            if (Math.abs(dx) > 10) dragMovedRef.current = true;
            el.scrollLeft = d.startScroll - dx;
            d.lastX = e.clientX;
            d.lastT = performance.now();
          }}
          onPointerUp={(e) => {
            finishPointerDrag(e.clientX, e.pointerId);
          }}
          onPointerCancel={(e) => {
            finishPointerDrag(e.clientX, e.pointerId);
          }}
          onClickCapture={(e) => {
            if (!dragMovedRef.current) return;
            e.preventDefault();
            e.stopPropagation();
            dragMovedRef.current = false;
          }}
        >
          {list.map((s, idx) => (
            <HeroSlidePane key={`${s.src}-${idx}`} slide={s} idx={idx} />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center pb-1 md:bottom-8 md:right-9 md:left-auto md:justify-end md:pb-0 lg:bottom-9 lg:right-11"
          role="presentation"
        >
          <div className="pointer-events-auto flex shrink-0 justify-center gap-2" role="tablist" aria-label="Hero slides">
            {list.map((s, idx) => (
              <button
                key={`dot-${s.src}-${idx}`}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={`${s.kicker ?? "Slide"}, slide ${idx + 1} of ${list.length}`}
                onClick={() => scrollToIndex(idx, reduce ? "auto" : "smooth")}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 md:drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] ${idx === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/55"}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
