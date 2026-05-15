import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import {
  getNewsletterQuotesByReviewIds,
  getNewsletterSocialProofQuotes,
} from "@/services/review-service";
import { connectDb } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";
import { NewsletterSubscribeBlock } from "@/components/newsletter/newsletter-subscribe-block";
import { SiteLogo } from "@/components/layout/site-logo";
import { getNewsletterMarketingMerged } from "@/services/site-page-marketing-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getNewsletterMarketingMerged()]);
  return buildMetadata({
    title: `${m.metaTitle} — ${b.name}`,
    description: m.metaDescription,
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
  const [branding, editorial, mk] = await Promise.all([
    getResolvedSiteBranding(),
    getHomeEditorialResolved(),
    getNewsletterMarketingMerged(),
  ]);

  const quotesFromIds =
    mk.featuredReviewIds?.length > 0 ? await getNewsletterQuotesByReviewIds(mk.featuredReviewIds) : [];

  const quotes = quotesFromIds.length > 0 ? quotesFromIds : await getNewsletterSocialProofQuotes(3);

  let subscriberCount = 0;
  try {
    await connectDb();
    subscriberCount = await NewsletterSubscriber.countDocuments({ isActive: true });
  } catch {
    subscriberCount = 0;
  }

  const highlight = subscriberHighlight(subscriberCount);
  const siteName = branding.name;

  const HI_MARK = "\uE000";
  const heroLead = highlight
    ? mk.heroLeadWithHighlight.replaceAll("{highlight}", HI_MARK).replaceAll("{siteName}", siteName)
    : mk.heroLeadWithoutHighlight.replaceAll("{siteName}", siteName);
  const heroLeadChunks = highlight ? heroLead.split(HI_MARK) : [heroLead];

  const bottomPromptTemplate = highlight ? mk.bottomPromptWithHighlight : mk.bottomPromptWithoutHighlight;
  const bottomPrompt = bottomPromptTemplate.replaceAll("{highlight}", highlight ?? "").replaceAll("{siteName}", siteName);

  const peekFromInner = mk.peekEmailFromBody.replaceAll("{siteName}", siteName);

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
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              style={{display:'flex'}}
              className="inline-block rounded-2xl bg-white/95 px-5 py-3 shadow-md flex justify-center transition hover:bg-white"
            >
              <SiteLogo siteName={siteName} className="w-[min(100%,200px)]" />
            </Link>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">{mk.heroEyebrow}</p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{mk.heroTitle}</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            {highlight ? (
              <>
                {heroLeadChunks[0]}
                <strong className="font-semibold text-white">{highlight}</strong>
                {heroLeadChunks.slice(1).join("")}
              </>
            ) : (
              heroLeadChunks[0]
            )}
          </p>

          <NewsletterSubscribeBlock />

          <p className="mt-4 text-xs text-white/40">{mk.footerDisclaimer}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:px-8">
        <div className="mb-10 max-w-xl">
          <h2 className="font-heading text-3xl font-semibold">{mk.benefitsSectionTitle}</h2>
          <p className="mt-3 text-muted-foreground">{mk.benefitsSectionIntro}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mk.benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-20 dark:bg-neutral-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-10 max-w-xl">
            <h2 className="font-heading text-3xl font-semibold">{mk.peekSectionTitle}</h2>
            <p className="mt-3 text-muted-foreground">{mk.peekSectionIntro}</p>
          </div>
          <div className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl dark:bg-neutral-900">
            <div className="border-b border-border bg-neutral-950 px-6 py-4">
              <p className="text-[11px] text-white/60">
                {mk.peekEmailFromPrefix}{" "}
                <span className="text-white/80">{peekFromInner}</span>
              </p>
              <p className="text-[11px] text-white/60">
                {mk.peekEmailSubjectPrefix}{" "}
                <span className="font-semibold text-amber-400">{mk.peekEmailSubjectHighlight}</span>
              </p>
            </div>
            <div className="p-6">
              <p className="font-heading text-xl font-semibold text-foreground">{mk.peekInnerTitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mk.peekInnerBody}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {mk.peekImages.map((img, i) => (
                  <div key={`${img.src}-${i}`} className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                    <Image
                      src={img.src}
                      alt={img.alt || "Newsletter preview"}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-center">
                <span className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
                  {mk.peekReadFullCta}
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
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">{mk.reviewsFallbackCopy}</p>
        )}

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">{bottomPrompt}</p>
          <Link
            href="#newsletter-top"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            {mk.bottomSubscribeCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
