"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { useConsent } from "@/components/consent/consent-context";
import { cn } from "@/lib/utils";

/**
 * Full-width consent bar — editorial title, calm copy, clear primary/secondary actions.
 */
export function CookieBanner({ className }: { className?: string }) {
  const pathname = usePathname();
  const { pending, acceptAll, essentialOnly } = useConsent();

  if (pathname?.startsWith("/admin")) return null;
  if (!pending) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[10050] w-full min-w-0",
        className,
      )}
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
    >
      {/* Accent stripe + elevated panel */}
      <div className="pointer-events-auto relative w-full min-w-0 overflow-hidden border-t border-primary/25 bg-card pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_60px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-primary/30 dark:shadow-[0_-24px_64px_-16px_rgba(0,0,0,0.35)]">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 md:px-8 md:pt-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:pb-6">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3 sm:gap-4">
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/50 text-primary shadow-sm"
                  aria-hidden
                >
                  <Cookie className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Privacy
                  </p>
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    We value your privacy
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-[1.65]">
                    We use cookies that are essential for the site to work, and — only with your permission — analytics
                    to improve our editorials and Google-supported ads to fund free content. You can change your mind
                    anytime. Read our{" "}
                    <Link
                      href="/cookie-policy"
                      className="font-medium text-foreground underline decoration-primary/40 underline-offset-[5px] transition hover:decoration-primary"
                    >
                      Cookie policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2.5 border-t border-border/60 pt-1 sm:flex-row sm:items-center sm:justify-end sm:border-t-0 sm:pt-0 lg:w-auto lg:flex-col lg:items-stretch lg:gap-2.5 lg:pt-1">
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 h-11 w-full rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:order-2 sm:w-auto sm:min-w-[160px] lg:order-1 lg:w-full lg:min-w-[200px]"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={essentialOnly}
                className="order-2 h-11 w-full rounded-lg border border-input bg-background px-5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:order-1 sm:w-auto sm:min-w-[160px] lg:order-2 lg:w-full lg:min-w-[200px]"
              >
                Essential cookies only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
