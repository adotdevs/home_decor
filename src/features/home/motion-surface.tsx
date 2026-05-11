"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MotionSurface({
  children,
  className,
  delay = 0,
  hoverLift = true,
  hoverShadow = "0 20px 44px -28px rgba(0,0,0,0.22)",
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
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -72px 0px", amount: 0.12 }}
      transition={{ duration: 0.72, delay: reduce ? 0 : delay, ease }}
      whileHover={
        reduce || !hoverLift
          ? undefined
          : { y: -2, boxShadow: hoverShadow, transition: { duration: 0.35, ease } }
      }
    >
      {children}
    </motion.div>
  );
}
