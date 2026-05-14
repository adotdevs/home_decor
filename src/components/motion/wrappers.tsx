"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { RevealOnScroll, type RevealOnScrollProps } from "@/components/motion/reveal-on-scroll";
import {
  defaultRevealDuration,
  editorialEase,
  safeHiddenFade,
  safeHiddenFadeUp,
  safeHiddenScale,
  safeVisible,
  viewportPresets,
} from "@/lib/motion/presets";
import { staggerContainerVariants, staggerItemFadeUp } from "@/lib/motion/variants";

export function FadeIn({
  children,
  delay = 0,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & { children: ReactNode; delay?: number }) {
  return (
    <RevealOnScroll offscreen={{ ...safeHiddenFade, y: 0 }} onscreen={{ opacity: 1, y: 0, scale: 1 }} delay={delay} {...props}>
      {children}
    </RevealOnScroll>
  );
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

export function ScaleIn({
  children,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & { children: ReactNode }) {
  return (
    <RevealOnScroll offscreen={{ ...safeHiddenScale }} onscreen={{ ...safeVisible }} {...props}>
      {children}
    </RevealOnScroll>
  );
}

type SlideDir = "left" | "right";

export function SlideIn({
  children,
  direction = "left",
  distance = 16,
  ...props
}: Omit<RevealOnScrollProps, "offscreen" | "onscreen"> & {
  children: ReactNode;
  direction?: SlideDir;
  distance?: number;
}) {
  const x0 = direction === "left" ? -distance : distance;
  return (
    <RevealOnScroll
      offscreen={{ opacity: 0.9, x: x0, y: 0, scale: 1 }}
      onscreen={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      {...props}
    >
      {children}
    </RevealOnScroll>
  );
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
      offscreen={{ ...safeHiddenFadeUp }}
      onscreen={{ ...safeVisible }}
      {...props}
    >
      {children}
    </RevealOnScroll>
  );
}

export function StaggerContainer({
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

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.div className={className} variants={staggerItemFadeUp(reduce)}>
      {children}
    </motion.div>
  );
}

export function HoverCardAnimation({
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
