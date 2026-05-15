import type { Metadata } from "next";
import Link from "next/link";
import { getLegalTermsMarketingMerged } from "@/services/site-page-marketing-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getLegalTermsMarketingMerged()]);
  return {
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const m = await getLegalTermsMarketingMerged();

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

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          {m.termsFooterLead}{" "}
          <Link href="/contact" className="font-medium text-amber-600 hover:underline">
            {m.termsFooterLinkLabel}
          </Link>{" "}
          {m.termsFooterTrail}
        </p>
      </div>
    </main>
  );
}
