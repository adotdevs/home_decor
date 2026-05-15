import type { Metadata } from "next";
import Link from "next/link";
import { getLegalPrivacyMarketingMerged } from "@/services/site-page-marketing-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getLegalPrivacyMarketingMerged()]);
  return {
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const m = await getLegalPrivacyMarketingMerged();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{m.pageH1}</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">{m.pageH1}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {m.lastUpdatedLabel}</p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="lead text-muted-foreground">{m.leadParagraph}</p>

        <div className="mt-10 space-y-8">
          {m.sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-heading text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        {m.footerLink1Label?.trim() ? (
          <Link
            href={m.footerLink1Href?.trim() || "#"}
            className="inline-flex h-9 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {m.footerLink1Label}
          </Link>
        ) : null}
        {m.footerLink2Label?.trim() ? (
          <Link
            href={m.footerLink2Href?.trim() || "#"}
            className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            {m.footerLink2Label}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
