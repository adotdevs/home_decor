"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { RevealOnScroll, type RevealOnScrollProps } from "@/components/motion/reveal-on-scroll";
import {
  defaultRevealDuration,
  editorialEase,
  polishPreReveal,
  polishSettled,
  safeHiddenFade,
  safeHiddenFadeUp,
  safeHiddenScale,
  safeVisible,
  viewportPresets,
} from "@/lib/motion/presets";
import { staggerContainerVariants, staggerItemFadeUp } from "@/lib/motion/variants";

/** Safe vertical fade: opacity stays 1; refines y/scale only. */
export function SafeFade({
  children,
  delay = 0,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & { children: ReactNode; delay?: number }) {
  return (
    <RevealOnScroll offscreen={{ ...safeHiddenFade, y: 4 }} onscreen={{ ...polishSettled }} delay={delay} {...props}>
      {children}
    </RevealOnScroll>
  );
}

/** Alias: same as SafeFade — kept for copy clarity. */
export function SafeReveal(props: Parameters<typeof SafeFade>[0]) {
  return <SafeFade {...props} />;
}

/** @deprecated Prefer SafeFade — “FadeIn” historically implied opacity gating; this implementation is safe. */
export function FadeIn(props: Parameters<typeof SafeFade>[0]) {
  return <SafeFade {...props} />;
}

export function FadeUp({
  children,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & { children: ReactNode }) {
  return (
    <RevealOnScroll offscreen={{ ...safeHiddenFadeUp }} onscreen={{ ...safeVisible }} {...props}>
      {children}
    </RevealOnScroll>
  );
}

export function SafeScale({
  children,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & { children: ReactNode }) {
  return (
    <RevealOnScroll offscreen={{ ...safeHiddenScale }} onscreen={{ ...polishSettled }} {...props}>
      {children}
    </RevealOnScroll>
  );
}

export function ScaleIn(props: Parameters<typeof SafeScale>[0]) {
  return <SafeScale {...props} />;
}

type SlideDir = "left" | "right";

/** Horizontal slide only — full opacity throughout. */
export function SafeSlide({
  children,
  direction = "left",
  distance = 14,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & {
  children: ReactNode;
  direction?: SlideDir;
  distance?: number;
}) {
  const x0 = direction === "left" ? -distance : distance;
  return (
    <RevealOnScroll
      offscreen={{ opacity: 1, x: x0, y: 0, scale: 1 }}
      onscreen={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      {...props}
    >
      {children}
    </RevealOnScroll>
  );
}

export function SlideIn(props: Parameters<typeof SafeSlide>[0]) {
  return <SafeSlide {...props} />;
}

export function MasonryReveal({
  children,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen" | "viewportMargin"> & { children: ReactNode }) {
  return (
    <RevealOnScroll
      viewportMargin={viewportPresets.masonry}
      viewportAmount={0.015}
      duration={defaultRevealDuration * 0.9}
      offscreen={{ ...polishPreReveal, y: 5 }}
      onscreen={{ ...polishSettled }}
      {...props}
    >
      {children}
    </RevealOnScroll>
  );
}

/** Stagger container — children use EditorialStaggerItem / StaggerItem. */
export function EditorialStagger({
  children,
  className,
  stagger = 0.048,
  delayChildren = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants(reduce, stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

export function EditorialStaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div className={className} variants={staggerItemFadeUp(reduce)}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer(props: Parameters<typeof EditorialStagger>[0]) {
  return <EditorialStagger {...props} />;
}

/** @deprecated Alias of EditorialStaggerItem */
export const StaggerItem = EditorialStaggerItem;

export function SoftHover({
  children,
  className,
  hoverLift = true,
  hoverShadow = "0 20px 44px -28px rgba(0,0,0,0.22)",
  ...rest
}: Omit<HTMLMotionProps<"div">, "whileHover"> & {
  hoverLift?: boolean;
  hoverShadow?: string;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div
      className={className}
      whileHover={
        reduce || !hoverLift
          ? undefined
          : { y: -2, boxShadow: hoverShadow, transition: { duration: 0.35, ease: editorialEase } }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function HoverCardAnimation(props: Parameters<typeof SoftHover>[0]) {
  return <SoftHover {...props} />;
}
