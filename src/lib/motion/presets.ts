import { editorialEase, motionDurations } from "@/styles/motion";

export { editorialEase, motionDurations };

/** Slightly dimmed — never fully invisible (accessibility + IO fallbacks). */
export const safeHiddenFade = { opacity: 0.88, y: 10 } as const;
export const safeHiddenFadeUp = { opacity: 0.9, y: 14 } as const;
export const safeHiddenScale = { opacity: 0.9, y: 8, scale: 0.985 } as const;
export const safeVisible = { opacity: 1, y: 0, scale: 1 } as const;

/** Expanded IO root margins so columns / rails still intersect reliably. */
export const viewportPresets = {
  default: "80px 80px 12% 80px",
  masonry: "100px 60px 18% 60px",
  rail: "100px 120px 18% 120px",
} as const;

export type MotionViewportMargin = (typeof viewportPresets)[keyof typeof viewportPresets];

export const defaultRevealFallbackMs = 2600;

export const defaultRevealDuration = motionDurations.entrance;
