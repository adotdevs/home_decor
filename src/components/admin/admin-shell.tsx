"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links: [string, string][] = [
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
  ["Media", "/admin/media"],
  ["Users", "/admin/users"],
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 text-sm">
      {links.map(([label, href]) => {
        const active =
          href === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname === href || pathname.startsWith(`${href}/`);
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
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
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
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4 shadow-sm md:hidden">
        <Link href="/admin" className="cursor-pointer font-heading text-lg font-semibold tracking-tight" onClick={() => setOpen(false)}>
          Admin
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

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 md:grid md:grid-cols-[220px_1fr] md:gap-6 md:px-4 md:py-6">
        <aside
          className={`
            fixed left-0 z-50 w-[min(100%,280px)] transform border-r bg-card p-4 shadow-lg transition-transform duration-200 ease-out
            top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto
            md:relative md:top-auto md:z-0 md:h-fit md:w-full md:translate-x-0 md:overflow-visible md:rounded-2xl md:border md:shadow-sm
            ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <p className="mb-4 hidden text-xs uppercase tracking-[0.15em] text-muted-foreground md:block">Admin</p>
          <p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground md:hidden">Menu</p>
          <NavLinks onNavigate={() => setOpen(false)} />
        </aside>

        <main className="min-w-0 focus:outline-none md:pt-0">{children}</main>
      </div>
    </div>
  );
}
