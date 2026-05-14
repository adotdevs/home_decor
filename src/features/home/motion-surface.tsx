"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { editorialEase } from "@/styles/motion";

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
    <RevealOnScroll
      className={className}
      delay={delay}
      duration={0.72}
      whileHover={
        reduce || !hoverLift
          ? undefined
          : { y: -2, boxShadow: hoverShadow, transition: { duration: 0.35, ease: editorialEase } }
      }
    >
      {children}
    </RevealOnScroll>
  );
}
