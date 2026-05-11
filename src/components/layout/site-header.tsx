"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { categoryTree } from "@/config/site";
import { cn } from "@/lib/utils";
import { SearchCommand } from "@/components/search/search-command";

const nav = [
  ["Latest", "/latest"],
  ["Trending", "/trending"],
  ["Feed", "/inspiration/feed"],
  ["Gallery", "/inspiration-gallery"],
  ["Tags", "/tags"],
  ["Newsletter", "/newsletter"],
] as const;

const panelEase = [0.16, 1, 0.3, 1] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const t = window.setTimeout(() => first?.focus(), reduce ? 0 : 320);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, reduce]);

  const linkDesktop = (href: string) =>
    cn(
      "transition-colors",
      isActivePath(pathname, href) ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  const linkMobile = (href: string) =>
    cn(
      "block rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-muted",
      isActivePath(pathname, href) ? "bg-muted text-foreground" : "text-foreground",
    );

  return (
    <header className="sticky top-0 z-[200] border-b border-black/5 bg-background/95 shadow-sm">
      <div className="relative z-[210] mx-auto flex h-14 max-w-7xl min-w-0 items-center justify-between gap-3 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:h-16 sm:px-5 md:px-8">
        <Link href="/" className="relative flex min-w-0 shrink-0 items-center">
          <Image
            src="/logo.svg"
            alt="Luxe Home Decor Ideas"
            width={160}
            height={32}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav className="hidden min-w-0 items-center gap-6 text-sm md:flex lg:gap-7" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={linkDesktop(href)}>
              {label}
            </Link>
          ))}
          <div className="relative group">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                pathname.startsWith("/category") ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-expanded={false}
              aria-haspopup="true"
            >
              Rooms
              <ChevronDown className="h-3.5 w-3.5 opacity-70" strokeWidth={2} aria-hidden />
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-56 overflow-y-auto rounded-xl border border-border bg-popover p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
              {categoryTree.map((cat) => (
                <div key={cat.slug} className="border-b border-border/60 py-2 last:border-0">
                  <Link href={`/category/${cat.slug}`} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                    {cat.name}
                  </Link>
                  <ul className="mt-1 max-h-36 overflow-y-auto pl-2">
                    {cat.subcategories.slice(0, 8).map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/category/${cat.slug}/${sub}`}
                          className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {sub.replace(/-/g, " ")}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <Link href="/search" className={linkDesktop("/search")}>
            Search
          </Link>
          <SearchCommand />
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
            ref={menuButtonRef}
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

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    type="button"
                    key="mobile-nav-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0.01 : 0.28, ease: panelEase }}
                    className="fixed inset-x-0 bottom-0 top-14 z-[160] bg-black/45 backdrop-blur-[2px] sm:top-16 md:hidden"
                    aria-label="Close menu"
                    onClick={close}
                  />
                  <motion.nav
                    ref={panelRef}
                    key="mobile-nav-panel"
                    id="mobile-nav"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                      type: "tween",
                      duration: reduce ? 0.01 : 0.4,
                      ease: panelEase,
                    }}
                    className="fixed bottom-0 right-0 top-14 z-[170] flex w-[min(100%,22rem)] flex-col border-l border-border bg-background shadow-[-12px_0_48px_rgba(0,0,0,0.12)] sm:top-16 md:hidden"
                  >
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                      <span className="font-heading text-lg font-semibold tracking-tight">Browse</span>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Close menu"
                        onClick={close}
                      >
                        <X className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pb-safe">
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
                          <Link href={href} className={linkMobile(href)} onClick={close}>
                            {label}
                          </Link>
                        </motion.div>
                      ))}

                      <div className="pt-2">
                        <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Shop by room
                        </p>
                        <div className="space-y-1">
                          {categoryTree.map((cat) => (
                            <details key={cat.slug} className="group rounded-xl border border-transparent open:border-border open:bg-muted/30">
                              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                                <span>{cat.name}</span>
                                <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden />
                              </summary>
                              <ul className="max-h-48 space-y-0.5 overflow-y-auto border-t border-border/60 px-2 pb-2 pt-1">
                                <li>
                                  <Link
                                    href={`/category/${cat.slug}`}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-muted"
                                    onClick={close}
                                  >
                                    All {cat.name.toLowerCase()}
                                  </Link>
                                </li>
                                {cat.subcategories.map((sub) => (
                                  <li key={sub}>
                                    <Link
                                      href={`/category/${cat.slug}/${sub}`}
                                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                      onClick={close}
                                    >
                                      {sub.replace(/-/g, " ")}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          ))}
                        </div>
                      </div>

                      <Link href="/search" className={linkMobile("/search")} onClick={close}>
                        Search
                      </Link>
                      <Link
                        href="/admin/login"
                        className="mt-2 block rounded-xl px-4 py-3.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={close}
                      >
                        Admin
                      </Link>
                    </div>
                  </motion.nav>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </header>
  );
}
