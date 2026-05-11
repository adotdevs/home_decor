"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22, margin: "-40px 0px" }}
      transition={
        reduce
          ? undefined
          : {
              duration: 0.55,
              delay,
              ease: [0.22, 1, 0.36, 1],
            }
      }
    >
      {children}
    </motion.div>
  );
}
