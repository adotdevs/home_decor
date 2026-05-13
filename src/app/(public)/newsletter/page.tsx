"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

const BENEFITS = [
  {
    title: "Weekly curated edits",
    desc: "Every Friday, a hand-picked selection of the best new decor ideas, room transformations, and styling tips.",
  },
  {
    title: "Seasonal guides first",
    desc: "Be the first to receive our in-depth seasonal guides before they're published on the site.",
  },
  {
    title: "Trending picks & mood boards",
    desc: "Our editors compile the top Pinterest-worthy ideas of the week into a quick, beautiful digest.",
  },
  {
    title: "No spam, ever",
    desc: "We send one email per week, always worth reading. Unsubscribe in one click at any time.",
  },
];

const SOCIAL_PROOF = [
  { name: "Sarah T.", note: "The Friday edit is the highlight of my week. Always so inspiring." },
  { name: "James K.", note: "Finally a newsletter that actually feels like a magazine." },
  { name: "Priya M.", note: "Transformed my living room after the spring refresh guide. Thank you!" },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
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
    <>
      <title>Newsletter — CoreFusion</title>
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-neutral-950 px-6 py-24 text-center text-white sm:px-8 sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.18),transparent_65%)]"
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
              Weekly editorial
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Your home, beautifully curated
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Join <strong className="font-semibold text-white">12,000+</strong> readers who get
              our weekly edit of the best interior ideas, seasonal guides, and Pinterest-worthy
              inspiration straight to their inbox.
            </p>

            {status === "success" ? (
              <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-5">
                <Check className="mx-auto h-8 w-8 text-green-400" />
                <p className="mt-3 font-semibold text-green-300">You&rsquo;re in!</p>
                <p className="mt-1 text-sm text-green-400/80">
                  Check your inbox for a welcome message.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-12 rounded-full bg-amber-500 px-7 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400 disabled:opacity-60"
                >
                  {status === "loading" ? "Joining…" : "Subscribe free"}
                </button>
              </form>
            )}

            {status === "error" && (
              <p className="mt-4 text-sm text-red-400">
                Something went wrong — please try again.
              </p>
            )}

            <p className="mt-4 text-xs text-white/40">
              One email per week. Unsubscribe any time. No spam.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:px-8">
          <div className="mb-10 max-w-xl">
            <h2 className="font-heading text-3xl font-semibold">What you&rsquo;ll get</h2>
            <p className="mt-3 text-muted-foreground">
              Every issue is crafted with the same editorial care we put into our articles.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample preview mockup */}
        <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="mb-10 max-w-xl">
              <h2 className="font-heading text-3xl font-semibold">A peek inside</h2>
              <p className="mt-3 text-muted-foreground">
                Here&rsquo;s what a typical Friday edit looks like in your inbox.
              </p>
            </div>
            <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl dark:bg-neutral-900">
              {/* Mockup email header */}
              <div className="border-b border-border bg-neutral-950 px-6 py-4">
                <p className="text-[11px] text-white/60">
                  From: <span className="text-white/80">hello@corefusion.com</span>
                </p>
                <p className="text-[11px] text-white/60">
                  Subject:{" "}
                  <span className="font-semibold text-amber-400">
                    This week&apos;s edit: Japandi meets Boho
                  </span>
                </p>
              </div>
              <div className="p-6">
                <p className="font-heading text-xl font-semibold text-foreground">
                  This week in your home
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Happy Friday! This week we&rsquo;re exploring the beautiful collision of Japandi
                  minimalism and Boho warmth — the decorating philosophy that&rsquo;s taking over
                  Pinterest right now. Plus: the 3 lamps that make any living room feel cosier, and
                  our editor&rsquo;s pick for the best affordable bedding this season.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    "/images/assets/general/design-interior-light-room-minimal-items.jpg",
                    "/images/assets/general/contemporary-coolness_-a-minimalist-living-room-in-a-navy-and-gray-palette.jpg",
                    "/images/assets/general/top-5-cozy-living-room-decor-ideas-for-a-stylish-comfortable-space.jpg",
                  ].map((src, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                      <Image
                        src={src}
                        alt="Newsletter interior inspiration preview"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-center">
                  <span className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
                    Read full issue →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:px-8">
          <h2 className="mb-10 text-center font-heading text-3xl font-semibold">
            What our readers say
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {SOCIAL_PROOF.map((r) => (
              <blockquote
                key={r.name}
                className="rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground"
              >
                <p>&ldquo;{r.note}&rdquo;</p>
                <footer className="mt-4 font-medium text-foreground">— {r.name}</footer>
              </blockquote>
            ))}
          </div>

          {/* Second CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground">Ready to join 12,000+ subscribers?</p>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
            >
              Subscribe free — it only takes 10 seconds
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
