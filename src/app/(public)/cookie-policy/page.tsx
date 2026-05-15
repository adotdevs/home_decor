import type { Metadata } from "next";
import Link from "next/link";
import { getLegalCookiesMarketingMerged } from "@/services/site-page-marketing-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getLegalCookiesMarketingMerged()]);
  return {
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    alternates: { canonical: "/cookie-policy" },
  };
}

export default async function CookiePolicyPage() {
  const m = await getLegalCookiesMarketingMerged();

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

      <p className="mb-10 leading-relaxed text-muted-foreground">{m.cookieIntro}</p>

      <div className="mb-12 space-y-4">
        {m.cookieTypes.map((ct) => (
          <div key={ct.type} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="font-semibold text-foreground">{ct.type}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  ct.canDisable
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                }`}
              >
                {ct.canDisable ? "Optional" : "Required"}
              </span>
            </div>
            <div className="space-y-2 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{ct.purpose}</p>
              <p className="text-xs text-muted-foreground">
                <strong className="font-medium text-foreground">Examples:</strong> {ct.examples}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {m.sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-lg font-semibold text-foreground">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
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
