"use client";

import { Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StarDisplay({
  rating,
  max = 5,
  size = "sm",
  interactive = false,
  onChange,
  className,
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (n: number) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dims = size === "lg" ? "h-7 w-7" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.min(max, Math.max(0, Math.round(rating)));

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rounded} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const on = i < rounded;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              "relative rounded p-0.5 text-amber-400 transition",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default",
            )}
          >
            <Star
              className={cn(dims, on ? "fill-amber-400" : "fill-transparent")}
              strokeWidth={1.35}
              stroke="currentColor"
            />
            {interactive && !reduce ? (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-md bg-amber-400/15"
                initial={false}
                whileHover={{ opacity: 1 }}
                style={{ opacity: 0 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
