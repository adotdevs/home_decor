import { editorialEase, motionDurations } from "@/styles/motion";

export { editorialEase, motionDurations };

/** Never go below this for UI that must stay perceptibly visible. */
export const SAFE_OPACITY_FLOOR = 0.96;

/**
 * "Before polish" pose — always fully opaque so overflow/clipping and IO never hide content.
 * Motion is transform-only (slight y + scale). Avoid large y to reduce clipping under overflow-y-hidden rails.
 */
/** Strong enough to read on a real display; still “invisible-safe” (opacity 1). */
export const polishPreReveal = { opacity: 1, y: 11, scale: 0.988 } as const;

/** Settled editorial pose — full clarity. */
export const polishSettled = { opacity: 1, y: 0, scale: 1 } as const;

/** @deprecated Use polishPreReveal — kept for compatibility */
export const safeHiddenFade = { opacity: 1, y: 8, scale: 0.99 } as const;
/** @deprecated Use polishPreReveal */
export const safeHiddenFadeUp = { opacity: 1, y: 11, scale: 0.988 } as const;
/** @deprecated Use polishPreReveal */
export const safeHiddenScale = { opacity: 1, y: 9, scale: 0.987 } as const;
/** @deprecated Use polishSettled */
export const safeVisible = { opacity: 1, y: 0, scale: 1 } as const;

/** Expanded IO root margins — helps columns / rails; enhancement only, not required for visibility. */
export const viewportPresets = {
  default: "80px 80px 12% 80px",
  masonry: "100px 60px 18% 60px",
  rail: "100px 120px 18% 120px",
} as const;

export type MotionViewportMargin = (typeof viewportPresets)[keyof typeof viewportPresets];

/** After this, force “settled” polish so scroll IO is never required. */
export const defaultRevealFastPolishMs = 420;

/** Long fallback — logs in debug mode if still not in view. */
export const defaultRevealFallbackMs = 2600;

export const defaultRevealDuration = motionDurations.entrance;
