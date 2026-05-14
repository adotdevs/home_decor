/**
 * Opt-in motion diagnostics (browser console).
 * Set NEXT_PUBLIC_MOTION_DEBUG=1 in .env.local — remove or leave unset in production.
 */
const enabled = process.env.NEXT_PUBLIC_MOTION_DEBUG === "1";

export function motionDebug(tag: string, payload: Record<string, unknown>): void {
  if (!enabled || typeof console === "undefined") return;
  console.info(`[motion:${tag}]`, payload);
}

export function motionWarn(tag: string, message: string, payload?: Record<string, unknown>): void {
  if (!enabled || typeof console === "undefined") return;
  console.warn(`[motion:${tag}] ${message}`, payload ?? "");
}
