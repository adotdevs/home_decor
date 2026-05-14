"use client";

import { useEffect } from "react";
import { motionDebug } from "@/lib/motion/motion-debug";

/**
 * Logs once when client hydration has committed (opt-in via NEXT_PUBLIC_MOTION_DEBUG=1).
 */
export function useMotionHydrationProbe(tag: string): void {
  useEffect(() => {
    motionDebug("hydration", { tag, mounted: true });
  }, [tag]);
}
