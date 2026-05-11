"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -64px 0px" }}
      transition={{
        duration: reduce ? 0 : 0.72,
        delay: reduce ? 0 : delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
