"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function MotionSurface({
  children,
  className,
  delay = 0,
  hoverLift = true,
  hoverShadow = "0 20px 40px -24px rgba(0,0,0,0.25)",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverLift?: boolean;
  hoverShadow?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-36px" }}
      transition={{ duration: 0.48, delay: reduce ? 0 : delay, ease }}
      whileHover={reduce || !hoverLift ? undefined : { y: -3, boxShadow: hoverShadow }}
    >
      {children}
    </motion.div>
  );
}
