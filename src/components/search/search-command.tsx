"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export function SearchCommand() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), reduce ? 0 : 200);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open, reduce]);

  useEffect(() => {
    const trimmed = q.trim();
    if (!open || trimmed.length < 2) return;
    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?suggest=1&q=${encodeURIComponent(trimmed)}`, { signal: ac.signal });
        const data = (await res.json()) as { suggestions?: string[] };
        setSuggestions(data.suggestions || []);
        setActive(0);
      } catch {
        setSuggestions([]);
      }
    }, 180);
    return () => {
      ac.abort();
      window.clearTimeout(t);
    };
  }, [q, open]);

  function go(term: string) {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    setOpen(false);
    setQ("");
    setSuggestions([]);
  }

  const trimmedQ = q.trim();
  const visibleSuggestions = open && trimmedQ.length >= 2 ? suggestions : [];
  const maxIdx = Math.max(0, visibleSuggestions.length - 1);
  const safeActive = Math.min(active, maxIdx);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, maxIdx));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const pick = (visibleSuggestions[safeActive] || q).trim();
      if (pick) go(pick);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden min-w-0 items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground shadow-sm md:flex md:max-w-[220px]"
        aria-label="Open search"
      >
        <Search className="h-4 w-4 shrink-0 opacity-60" />
        <span className="truncate">Search…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border bg-muted px-1.5 text-[10px] lg:inline">/</kbd>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.2, ease }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
              aria-label="Close search"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : 12 }}
              transition={{ duration: reduce ? 0.01 : 0.32, ease }}
              className="fixed left-2 right-2 top-[8vh] z-[100] mx-auto max-h-[85vh] max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl md:left-1/2 md:w-full md:-translate-x-1/2"
            >
              <div className="flex min-w-0 items-center gap-2 border-b border-border px-3 py-2" onKeyDown={onKeyDown}>
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search stories, rooms, moods…"
                  className="min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="max-h-[min(52vh,440px)] overflow-y-auto overflow-x-hidden p-2">
                {visibleSuggestions.map((s, i) => (
                  <li key={s}>
                    <button
                      type="button"
                      className={`w-full max-w-full rounded-xl px-4 py-3 text-left text-sm break-words ${i === safeActive ? "bg-muted font-medium" : "hover:bg-muted/60"}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(s)}
                    >
                      {s}
                    </button>
                  </li>
                ))}
                {!visibleSuggestions.length && q.length >= 2 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">Press Enter to search the full library</li>
                ) : null}
                {q.length < 2 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">Type at least 2 characters for suggestions</li>
                ) : null}
              </ul>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
