"use client";

import type { MutableRefObject, ReactNode } from "react";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { motionDebug } from "@/lib/motion/motion-debug";
import { useMotionHydrationProbe } from "@/lib/motion/use-motion-hydration-probe";
import {
  defaultRevealDuration,
  defaultRevealFallbackMs,
  defaultRevealFastPolishMs,
  editorialEase,
  polishPreReveal,
  polishSettled,
  type MotionViewportMargin,
  viewportPresets,
} from "@/lib/motion/presets";

/** Cap debug ingest: many RevealOnScroll instances mount on the home page. */
let revealDbgMountSeq = 0;
let revealDbgFlipSeq = 0;
const REVEAL_DBG_MOUNT_CAP = 14;
const REVEAL_DBG_FLIP_CAP = 36;

export type RevealOnScrollProps = Omit<HTMLMotionProps<"div">, "initial" | "animate"> & {
  children: ReactNode;
  /**
   * Slight pre-polish pose — must stay fully opaque (opacity 1). Reframed from “offscreen”:
   * animation only refines transform; it never gates visibility.
   */
  offscreen?: Record<string, number>;
  onscreen?: Record<string, number>;
  delay?: number;
  duration?: number;
  viewportMargin?: MotionViewportMargin;
  /** Lower = easier to trigger (horizontal rails). */
  viewportAmount?: number | "some" | "all";
  /** Force settled polish quickly so UX never depends on IntersectionObserver alone. */
  fastPolishMs?: number;
  /** Diagnostic + last-resort polish timer. */
  fallbackMs?: number;
};

function mergePolish(
  base: Record<string, number>,
  override?: Record<string, number>,
): Record<string, number> {
  const o = { ...base, ...override };
  if (o.opacity != null && o.opacity < 0.96) {
    o.opacity = 1;
  }
  return o;
}

/**
 * Visible-first scroll enhancement: default state is always opaque (opacity 1 small transform).
 * IntersectionObserver only accelerates “settled” polish; fast fallback guarantees it regardless of IO.
 *
 * `animate` uses stable object identities from useMemo so Framer Motion can tween instead of
 * resetting when a parent re-renders. `motionTransition` is keyed by JSON.stringify(transition)
 * so inline `transition={{ ease }}` does not create a new object identity every render.
 */
export const RevealOnScroll = forwardRef<HTMLDivElement, RevealOnScrollProps>(function RevealOnScroll(
  {
    children,
    offscreen,
    onscreen,
    delay = 0,
    duration = defaultRevealDuration,
    viewportMargin = viewportPresets.default,
    viewportAmount = 0.02,
    fastPolishMs = defaultRevealFastPolishMs,
    fallbackMs = defaultRevealFallbackMs,
    transition,
    ...rest
  },
  forwardedRef,
) {
  const prefersReducedMotion = useReducedMotion() === true;
  useMotionHydrationProbe("RevealOnScroll");
  const localRef = useRef<HTMLDivElement>(null);
  const inView = useInView(localRef, {
    once: true,
    margin: viewportMargin,
    amount: viewportAmount,
  });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const [fastKick, setFastKick] = useState(false);
  const [lateKick, setLateKick] = useState(false);
  const prevShowSettledRef = useRef<boolean | null>(null);

  const offKey = JSON.stringify(offscreen ?? null);
  const onKey = JSON.stringify(onscreen ?? null);
  /** Parent `transition={{ ease }}` must not change identity every render or Framer restarts tweens. */
  const transitionStableKey = JSON.stringify(transition ?? null);
  const preStyle = useMemo(() => mergePolish(polishPreReveal, offscreen), [offKey, offscreen]);
  const settledStyle = useMemo(() => mergePolish(polishSettled, onscreen), [onKey, onscreen]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setTimeout(() => {
      setFastKick(true);
      motionDebug("RevealOnScroll", { phase: "fastPolish", fastPolishMs });
    }, fastPolishMs);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, fastPolishMs]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setTimeout(() => {
      setLateKick(true);
      if (!inView) {
        motionDebug("RevealOnScroll", {
          note: "intersection not yet true at fallbackMs (expected after fastPolish)",
          fallbackMs,
        });
      }
    }, fallbackMs);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, fallbackMs, inView]);

  useEffect(() => {
    if (inView) motionDebug("RevealOnScroll", { phase: "inView" });
  }, [inView]);

  const showSettled = prefersReducedMotion || inView || fastKick || lateKick;

  // #region agent log
  const dbgMountId = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (dbgMountId.current === null) {
      dbgMountId.current = ++revealDbgMountSeq;
    }
    if ((dbgMountId.current ?? 0) > REVEAL_DBG_MOUNT_CAP) return;
    const mountId = dbgMountId.current;
    const el = localRef.current;
    const transformAtLayout = el ? window.getComputedStyle(el).transform : "no-el";
    fetch("http://127.0.0.1:7705/ingest/38df8013-2756-4c23-b7bd-fa85f11e429e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7f7211" },
      body: JSON.stringify({
        sessionId: "7f7211",
        hypothesisId: "H1",
        location: "reveal-on-scroll.tsx:layoutMount",
        message: "RevealOnScroll first layout",
        data: {
          dbgRun: "post-hero-xform",
          mountId,
          inView,
          fastKick,
          lateKick,
          showSettled,
          prefersReducedMotion,
          duration,
          fastPolishMs,
          pre: { y: preStyle.y, scale: preStyle.scale },
          settled: { y: settledStyle.y, scale: settledStyle.scale },
          isRailPose: offKey.includes("0.92"),
          transformAtLayout,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    const raf = requestAnimationFrame(() => {
      const el2 = localRef.current;
      fetch("http://127.0.0.1:7705/ingest/38df8013-2756-4c23-b7bd-fa85f11e429e", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7f7211" },
        body: JSON.stringify({
          sessionId: "7f7211",
          hypothesisId: "H5",
          location: "reveal-on-scroll.tsx:afterRAF",
          message: "RevealOnScroll rAF1 transform",
          data: {
            dbgRun: "post-hero-xform",
            mountId,
            transform: el2 ? window.getComputedStyle(el2).transform : "no-el",
            showSettled,
            inView,
            fastKick,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  // #endregion

  // #region agent log
  useEffect(() => {
    const prev = prevShowSettledRef.current;
    prevShowSettledRef.current = showSettled;
    if (prev === null) return;
    if (prev === showSettled) return;
    if (revealDbgFlipSeq >= REVEAL_DBG_FLIP_CAP) return;
    revealDbgFlipSeq += 1;
    fetch("http://127.0.0.1:7705/ingest/38df8013-2756-4c23-b7bd-fa85f11e429e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "7f7211" },
      body: JSON.stringify({
        sessionId: "7f7211",
        hypothesisId: "H3",
        location: "reveal-on-scroll.tsx:showSettledFlip",
        message: "showSettled changed",
        data: {
          dbgRun: "post-hero-xform",
          mountId: dbgMountId.current,
          from: prev,
          to: showSettled,
          inView,
          fastKick,
          lateKick,
          prefersReducedMotion,
          isRailPose: offKey.includes("0.92"),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [showSettled, inView, fastKick, lateKick, prefersReducedMotion, offKey]);
  // #endregion

  const motionTransition = useMemo(() => {
    return {
      duration: prefersReducedMotion ? 0 : duration,
      delay: prefersReducedMotion ? 0 : delay,
      ease: editorialEase,
      ...(transition ?? {}),
    };
  }, [prefersReducedMotion, duration, delay, transitionStableKey]);

  function setRefs(node: HTMLDivElement | null) {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node;
  }

  const animateTarget = showSettled ? settledStyle : preStyle;

  return (
    <motion.div
      ref={setRefs}
      initial={false}
      animate={animateTarget}
      transition={motionTransition}
      style={{ willChange: prefersReducedMotion ? undefined : "transform" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
