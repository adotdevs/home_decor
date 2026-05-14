"use client";

import { motion, useReducedMotion } from "framer-motion";

const PALETTES: [string, string, string][] = [
  ["#f472b6", "#c084fc", "#a78bfa"],
  ["#fb923c", "#f472b6", "#818cf8"],
  ["#34d399", "#2dd4bf", "#38bdf8"],
  ["#fcd34d", "#fb7185", "#c084fc"],
  ["#93c5fd", "#a5b4fc", "#e879f9"],
  ["#fdba74", "#f9a8d4", "#7dd3fc"],
  ["#6ee7b7", "#86efac", "#67e8f9"],
  ["#e9d5ff", "#fbcfe8", "#fecaca"],
];

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export function GeneratedReviewAvatar({
  username,
  styleIndex,
  size = 48,
  className = "",
}: {
  username: string;
  styleIndex: number;
  size?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const idx = ((styleIndex % PALETTES.length) + PALETTES.length) % PALETTES.length;
  const [a, b, c] = PALETTES[idx];
  const ini = initials(username);

  return (
    <motion.div
      className={`relative shrink-0 overflow-hidden rounded-2xl shadow-md ring-2 ring-white/60 dark:ring-white/10 ${className}`}
      style={{ width: size, height: size }}
      whileHover={reduce ? undefined : { scale: 1.04 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={
          reduce
            ? undefined
            : {
                background: [
                  `linear-gradient(135deg, ${a}, ${b} 45%, ${c})`,
                  `linear-gradient(225deg, ${b}, ${c} 40%, ${a})`,
                  `linear-gradient(135deg, ${a}, ${b} 45%, ${c})`,
                ],
              }
        }
        transition={{ duration: 12, repeat: reduce ? 0 : Infinity, ease: "linear" }}
        style={{
          background: `linear-gradient(135deg, ${a}, ${b} 45%, ${c})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      <span
        className="relative z-10 flex h-full w-full items-center justify-center font-heading text-[0.62em] font-semibold tracking-tight text-white drop-shadow-md"
        style={{ fontSize: size * 0.36 }}
      >
        {ini}
      </span>
    </motion.div>
  );
}
