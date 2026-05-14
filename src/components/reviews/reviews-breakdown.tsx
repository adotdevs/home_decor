"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ReviewsBreakdown({
  breakdown,
  total,
}: {
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  total: number;
}) {
  const reduce = useReducedMotion();
  const stars: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];

  if (total <= 0) return null;

  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Rating mix</p>
      {stars.map((s) => {
        const n = breakdown[s] ?? 0;
        const pct = total > 0 ? Math.round((n / total) * 100) : 0;
        return (
          <div key={s} className="flex items-center gap-3 text-xs">
            <span className="w-8 tabular-nums text-muted-foreground">{s}★</span>
            <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-300"
                initial={
                  reduce
                    ? { width: `${pct}%` }
                    : { width: pct === 0 ? "0%" : `${Math.max(8, Math.round(pct * 0.88))}%` }
                }
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: s * 0.04 }}
              />
            </div>
            <span className="w-10 text-right tabular-nums text-muted-foreground">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
