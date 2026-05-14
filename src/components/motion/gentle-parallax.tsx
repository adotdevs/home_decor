"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Subtle scroll-linked translate only; children stay fully visible (no opacity gating).
 * Degrades to static layout when reduced motion is requested.
 */
export function GentleParallax({
  children,
  className,
  range = 14,
}: {
  children: ReactNode;
  className?: string;
  /** Peak offset in px (up/down across scroll span). */
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [range * 0.35, -range * 0.35]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
