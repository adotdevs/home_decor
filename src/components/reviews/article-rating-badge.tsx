"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ArticleRatingBadge({
  average = 0,
  count = 0,
  className,
  dense,
}: {
  average?: number;
  count?: number;
  className?: string;
  dense?: boolean;
}) {
  const reduce = useReducedMotion();
  const show = count > 0 && average > 0;
  const rounded = Math.round(average * 10) / 10;

  if (!show) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-2 py-0.5 text-xs shadow-sm backdrop-blur-sm dark:bg-white/5 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
        dense && "gap-1 px-1.5 py-0",
        className,
      )}
      initial={reduce ? false : { opacity: 0.94, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="flex items-center gap-0.5 text-amber-500">
        <Star className="h-3 w-3 fill-amber-400" strokeWidth={0} aria-hidden />
        <span className="font-semibold tabular-nums text-foreground">{rounded}</span>
      </span>
      <span className="text-muted-foreground">({count})</span>
    </motion.div>
  );
}
