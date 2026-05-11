"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setP(height > 0 ? Math.min(100, Math.round((scrollTop / height) * 100)) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 w-full bg-muted"
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-primary transition-[width] duration-150 ease-out" style={{ width: `${p}%` }} />
    </div>
  );
}
