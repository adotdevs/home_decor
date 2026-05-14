import type { Variants } from "framer-motion";
import { editorialEase, motionDurations } from "@/styles/motion";

/** Editorial stagger: timing only on container; children never drop below full opacity. */
export function staggerContainerVariants(reduce: boolean, stagger = 0.048, delayChildren = 0.06): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  };
}

/** Item: always visible — only light translate; no opacity gating. */
export function staggerItemFadeUp(reduce: boolean): Variants {
  return {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : motionDurations.entrance * 0.85,
        ease: editorialEase,
      },
    },
  };
}
