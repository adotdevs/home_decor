"use client";

import type { MutableRefObject, ReactNode } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  defaultRevealDuration,
  defaultRevealFallbackMs,
  editorialEase,
  type MotionViewportMargin,
  safeHiddenFadeUp,
  safeVisible,
  viewportPresets,
} from "@/lib/motion/presets";

export type RevealOnScrollProps = Omit<HTMLMotionProps<"div">, "initial" | "animate"> & {
  children: ReactNode;
  /** Pre-reveal pose — keep opacity > ~0.85 so content is never “gone”. Named `offscreen` to avoid clashing with the HTML `hidden` attribute on motion props. */
  offscreen?: Record<string, number>;
  onscreen?: Record<string, number>;
  delay?: number;
  duration?: number;
  viewportMargin?: MotionViewportMargin;
  /** Lower = easier to trigger (handles clipped columns / horizontal rails). */
  viewportAmount?: number | "some" | "all";
  fallbackMs?: number;
};

/**
 * Intersection-based reveal + time fallback: if IO never fires, still animates to visible.
 * Reduced motion: immediate full visibility, no scroll dependence.
 */
export const RevealOnScroll = forwardRef<HTMLDivElement, RevealOnScrollProps>(function RevealOnScroll(
  {
    children,
    offscreen = { ...safeHiddenFadeUp },
    onscreen = { ...safeVisible },
    delay = 0,
    duration = defaultRevealDuration,
    viewportMargin = viewportPresets.default,
    viewportAmount = 0.02,
    fallbackMs = defaultRevealFallbackMs,
    transition,
    ...rest
  },
  forwardedRef,
) {
  const prefersReducedMotion = useReducedMotion() === true;
  const localRef = useRef<HTMLDivElement>(null);
  const inView = useInView(localRef, {
    once: true,
    margin: viewportMargin,
    amount: viewportAmount,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setTimeout(() => setTimedOut(true), fallbackMs);
    return () => window.clearTimeout(id);
  }, [prefersReducedMotion, fallbackMs]);

  const isRevealed = prefersReducedMotion || inView || timedOut;

  function setRefs(node: HTMLDivElement | null) {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node;
  }

  return (
    <motion.div
      ref={setRefs}
      initial={false}
      animate={prefersReducedMotion || isRevealed ? { ...onscreen } : { ...offscreen }}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: editorialEase,
        ...transition,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
