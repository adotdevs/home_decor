"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";

const baseLinks: [string, string][] = [
  ["Dashboard", "/admin"],
  ["Site & seasons", "/admin/site"],
  ["Homepage & featured", "/admin/homepage"],
  ["Trending", "/admin/trending"],
  ["Contact", "/admin/contact-submissions"],
  ["Analytics", "/admin/analytics"],
  ["Search analytics", "/admin/search-analytics"],
  ["Articles", "/admin/articles"],
  ["Reviews", "/admin/reviews"],
  ["Create", "/admin/articles/create"],
  ["Categories", "/admin/categories"],
  ["Ads", "/admin/ads"],
  ["SEO", "/admin/seo"],
  ["Public pages", "/admin/pages"],
  ["Media", "/admin/media"],
  ["Users", "/admin/users"],
];

const ownerLinks: [string, string][] = [["Data & retention", "/admin/owner/retention"]];

function NavLinks({ showOwnerNav, onNavigate }: { showOwnerNav: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  function row(label: string, href: string) {
    const active =
      href === "/admin"
        ? pathname === "/admin" || pathname === "/admin/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={`block cursor-pointer rounded-lg px-3 py-2 transition ${
          active ? "bg-primary/10 font-medium text-primary" : "text-foreground/90 hover:bg-muted hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav className="space-y-1 text-sm">
      {baseLinks.map(([label, href]) => row(label, href))}
      {showOwnerNav ? (
        <>
          <p className="mb-2 mt-6 text-xs uppercase tracking-[0.15em] text-muted-foreground">Platform owner</p>
          {ownerLinks.map(([label, href]) => row(label, href))}
        </>
      ) : null}
    </nav>
  );
}

export function AdminShell({
  children,
  showOwnerNav = false,
  siteName,
}: {
  children: React.ReactNode;
  showOwnerNav?: boolean;
  siteName: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile top bar — fixed so it stays on scroll */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-card px-3 shadow-sm sm:px-4 md:hidden">
        <Link
          href="/admin"
          className="flex min-w-0 shrink items-center"
          onClick={() => setOpen(false)}
        >
          <SiteLogo siteName={siteName} className="h-8 w-auto max-w-[140px] object-contain object-left" />
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="cursor-pointer rounded-lg p-2 text-foreground hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Backdrop */}
      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-6 px-3 pb-4 pt-14 sm:px-4 md:grid md:grid-cols-[220px_1fr] md:gap-6 md:px-6 md:py-6">
        <aside
          className={`
            fixed left-0 z-50 flex w-[min(100%,280px)] flex-col transform border-r bg-card shadow-lg transition-transform duration-200 ease-out
            top-14 h-[calc(100dvh-3.5rem)]
            md:relative md:top-auto md:z-0 md:h-fit md:w-full md:translate-x-0 md:overflow-visible md:rounded-2xl md:border md:shadow-sm
            ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Mobile: second bar — stays visible while nav scrolls; no logo */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-3 md:hidden">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              className="cursor-pointer rounded-lg p-1.5 text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop / tablet: logo + label (hidden on small mobile drawer) */}
          <div className="hidden flex-col md:flex md:shrink-0 md:border-0 md:p-4">
            <Link href="/admin" className="mb-4 block" onClick={() => setOpen(false)}>
              <SiteLogo siteName={siteName} className="w-full max-w-[180px]" />
            </Link>
            <p className="mb-1 text-xs uppercase tracking-[0.15em] text-muted-foreground">Admin</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:flex-none md:overflow-visible md:p-4">
            <NavLinks showOwnerNav={showOwnerNav} onNavigate={() => setOpen(false)} />
          </div>
        </aside>

        <main className="min-w-0 focus:outline-none md:pt-0">{children}</main>
      </div>
    </div>
  );
}
