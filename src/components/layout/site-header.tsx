"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const nav = [
  ["Latest", "/latest"],
  ["Trending", "/trending"],
  ["Feed", "/inspiration/feed"],
  ["Gallery", "/inspiration-gallery"],
  ["Tags", "/tags"],
  ["Newsletter", "/newsletter"],
] as const;

const panelEase = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-5 md:px-8">
        <Link href="/" className="relative flex shrink-0 items-center">
          <Image
            src="/logo.svg"
            alt="Luxe Home Decor Ideas"
            width={160}
            height={32}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
          <Link href="/search" className="text-muted-foreground transition-colors hover:text-foreground">
            Search
          </Link>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            Search
          </Link>
          <Link
            href="/admin/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Admin
          </Link>
          <button
            type="button"
            className="inline-flex rounded-xl p-2.5 text-foreground hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-6 w-6" strokeWidth={1.75} /> : <Menu className="h-6 w-6" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.28, ease: panelEase }}
              className="fixed inset-x-0 bottom-0 top-14 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                duration: reduce ? 0.01 : 0.4,
                ease: panelEase,
              }}
              className="fixed bottom-0 right-0 top-14 z-[48] flex w-[min(100%,20.5rem)] flex-col border-l border-border bg-background shadow-[-12px_0_48px_rgba(0,0,0,0.12)] md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="font-heading text-lg font-semibold tracking-tight">Browse</span>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pb-safe">
                {nav.map(([label, href], i) => (
                  <motion.div
                    key={href}
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.05 + i * 0.035,
                      duration: 0.38,
                      ease: panelEase,
                    }}
                  >
                    <Link
                      href={href}
                      className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <Link
                  href="/search"
                  className="block rounded-xl px-4 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Search
                </Link>
                <Link
                  href="/admin/login"
                  className="mt-auto block rounded-xl px-4 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
