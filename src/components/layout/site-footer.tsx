"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryTreeTop } from "@/services/category-service";
import { SiteLogo } from "@/components/layout/site-logo";

const PINTEREST_URL = "https://pinterest.com";
const INSTAGRAM_URL = "https://instagram.com";

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 0C5.372 0 0 5.372 0 12c0 5.083 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.44.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export function SiteFooter({
  siteName,
  siteDescription,
  categoryTree,
  footerMiniNewsletterLine,
  footerSubscribeButtonLabel,
  footerEmailPlaceholder,
}: {
  siteName: string;
  siteDescription: string;
  categoryTree: CategoryTreeTop[];
  footerMiniNewsletterLine: string;
  footerSubscribeButtonLabel: string;
  footerEmailPlaceholder: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-card dark:border-white/[0.06]">
      {/* Mini newsletter row */}
      <div className="border-b border-black/[0.06] bg-gradient-to-r from-amber-50 to-rose-50 dark:border-white/[0.06] dark:from-amber-950/30 dark:to-rose-950/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 md:px-8">
          <p className="text-sm font-medium text-foreground">{footerMiniNewsletterLine}</p>
          {status === "success" ? (
            <p className="text-sm font-medium text-green-600">You&rsquo;re subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footerEmailPlaceholder}
                className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="h-10 rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
              >
                {status === "loading" ? "…" : footerSubscribeButtonLabel}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:gap-12">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="inline-block transition opacity-100 hover:opacity-90">
            <SiteLogo siteName={siteName} className="w-[min(100%,200px)]" />
          </Link>
          <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-muted-foreground">
            {siteDescription}
          </p>
          {/* <div className="mt-5 flex gap-3">
            <a
              href={PINTEREST_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-rose-500 hover:text-rose-500"
            >
              <PinterestIcon />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-amber-500 hover:text-amber-500"
            >
              <InstagramIcon />
            </a>
          </div> */}
        </div>

        {/* Explore */}
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Explore
          </h5>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              { href: "/latest", label: "Latest ideas" },
              { href: "/trending", label: "Trending" },
              { href: "/inspiration/feed", label: "Inspiration feed" },
              { href: "/inspiration-gallery", label: "Gallery" },
              { href: "/search", label: "Search" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Rooms */}
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Rooms
          </h5>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {categoryTree.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="transition hover:text-foreground"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Company
          </h5>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              { href: "/about", label: "About us" },
              { href: "/contact", label: "Contact" },
              { href: "/newsletter", label: "Newsletter" },
              { href: "/inspiration/seasonal/spring-refresh", label: "Seasonal guides" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 md:px-8">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/cookie-policy" className="hover:text-foreground">Cookie policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
