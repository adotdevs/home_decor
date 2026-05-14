import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { getNewsletterSocialProofQuotes } from "@/services/review-service";
import { connectDb } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { NewsletterSubscribeBlock } from "@/components/newsletter/newsletter-subscribe-block";

export const dynamic = "force-dynamic";

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

export async function generateMetadata(): Promise<Metadata> {
  const b = await getResolvedSiteBranding();
  return buildMetadata({
    title: `Newsletter — ${b.name}`,
    description:
      "Weekly editorial decor inspiration, seasonal guides, and Pinterest-worthy room ideas in your inbox.",
    path: "/newsletter",
  });
}

function subscriberHighlight(n: number): string | null {
  if (n < 12) return null;
  if (n < 1000) return `${n}+`;
  const rounded = Math.max(1000, Math.floor(n / 1000) * 1000);
  return `${new Intl.NumberFormat("en-US").format(rounded)}+`;
}

export default async function NewsletterPage() {
  const [branding, editorial, quotes] = await Promise.all([
    getResolvedSiteBranding(),
    getHomeEditorialResolved(),
    getNewsletterSocialProofQuotes(3),
  ]);

  let subscriberCount = 0;
  try {
    await connectDb();
    subscriberCount = await NewsletterSubscriber.countDocuments({ isActive: true });
  } catch {
    subscriberCount = 0;
  }

  const highlight = subscriberHighlight(subscriberCount);
  const siteName = branding.name;

  return (
    <main>
      <section
        id="newsletter-top"
        className="relative overflow-hidden bg-neutral-950 px-6 py-24 text-center text-white sm:px-8 sm:py-32"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.18),transparent_65%)]"
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">Weekly editorial</p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Your home, beautifully curated
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            {highlight ? (
              <>
                Join <strong className="font-semibold text-white">{highlight}</strong> readers who get our weekly edit of
                the best interior ideas, seasonal guides, and Pinterest-worthy inspiration straight to their inbox.
              </>
            ) : (
              <>
                Join <strong className="font-semibold text-white">readers of {siteName}</strong> who get our weekly edit
                of the best interior ideas, seasonal guides, and Pinterest-worthy inspiration straight to their inbox.
              </>
            )}
          </p>

          <NewsletterSubscribeBlock />

          <p className="mt-4 text-xs text-white/40">One email per week. Unsubscribe any time. No spam.</p>
        </div>
      </section>

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

      <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-10 max-w-xl">
            <h2 className="font-heading text-3xl font-semibold">A peek inside</h2>
            <p className="mt-3 text-muted-foreground">
              Here&rsquo;s what a typical Friday edit looks like in your inbox.
            </p>
          </div>
          <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl dark:bg-neutral-900">
            <div className="border-b border-border bg-neutral-950 px-6 py-4">
              <p className="text-[11px] text-white/60">
                From: <span className="text-white/80">The {siteName} editors</span>
              </p>
              <p className="text-[11px] text-white/60">
                Subject:{" "}
                <span className="font-semibold text-amber-400">This week&apos;s edit: Japandi meets Boho</span>
              </p>
            </div>
            <div className="p-6">
              <p className="font-heading text-xl font-semibold text-foreground">This week in your home</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Happy Friday! This week we&rsquo;re exploring the beautiful collision of Japandi minimalism and Boho
                warmth — the decorating philosophy that&rsquo;s taking over Pinterest right now. Plus: the 3 lamps that
                make any living room feel cosier, and our editor&rsquo;s pick for the best affordable bedding this season.
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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:px-8">
        <h2 className="mb-10 text-center font-heading text-3xl font-semibold">{editorial.newsletterReadersSayTitle}</h2>
        {quotes.length ? (
          <div className="grid gap-5 sm:grid-cols-3">
            {quotes.map((r) => (
              <blockquote
                key={`${r.byline}-${r.quote.slice(0, 24)}`}
                className="rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground"
              >
                <p>&ldquo;{r.quote}&rdquo;</p>
                <footer className="mt-4 font-medium text-foreground">— {r.byline}</footer>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
            As readers leave feedback on guides across the site, warm notes we can feature here will appear automatically
            — share yours on any article you love.
          </p>
        )}

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            {highlight
              ? `Ready to join ${highlight} subscribers?`
              : "Ready for the weekly edit from our editors?"}
          </p>
          <Link
            href="#newsletter-top"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            Subscribe free — it only takes 10 seconds
          </Link>
        </div>
      </section>
    </main>
  );
}
