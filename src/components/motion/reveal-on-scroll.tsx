"use client";

import type { MutableRefObject, ReactNode } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
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
 * resetting when a parent re-renders (inline style objects used to break transitions).
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
  const [fastKick, setFastKick] = useState(false);
  const [lateKick, setLateKick] = useState(false);

  const offKey = JSON.stringify(offscreen ?? null);
  const onKey = JSON.stringify(onscreen ?? null);
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

  const motionTransition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0 : duration,
      delay: prefersReducedMotion ? 0 : delay,
      ease: editorialEase,
      ...transition,
    }),
    [prefersReducedMotion, duration, delay, transition],
  );

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
