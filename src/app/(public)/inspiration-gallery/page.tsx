import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { localAssets } from "@/config/local-assets";
import { getMergedGalleryItems } from "@/services/gallery-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { getInspirationGalleryMarketingMerged } from "@/services/site-page-marketing-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [items, m] = await Promise.all([getMergedGalleryItems(), getInspirationGalleryMarketingMerged()]);
  const ogImage = items[0]?.src ?? localAssets[0].src;
  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: { canonical: "/inspiration-gallery" },
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      images: [ogImage],
    },
  };
}

export default async function InspirationGalleryPage() {
  const [galleryItems, b, m] = await Promise.all([
    getMergedGalleryItems(),
    getResolvedSiteBranding(),
    getInspirationGalleryMarketingMerged(),
  ]);

  const heroDescription = m.heroDescriptionTemplate.replaceAll("{count}", String(galleryItems.length));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: m.breadcrumbCurrentLabel, path: "/inspiration-gallery" },
          ],
          b.url,
        )}
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{m.breadcrumbCurrentLabel}</span>
        </nav>

        <header className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">{m.heroEyebrow}</p>
            <h1 className="mt-2 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              {m.h1}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{heroDescription}</p>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold">{m.howToTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.howToBody}</p>
          </aside>
        </header>

        <GalleryGrid items={galleryItems} />

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {m.roomBlurbs.map((blurb) => (
            <div key={blurb.title} className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-heading text-xl font-semibold">{blurb.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{blurb.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 px-8 py-12 text-center dark:from-amber-950/30 dark:to-rose-950/30">
          <h2 className="font-heading text-2xl font-semibold">{m.bottomCtaTitle}</h2>
          <p className="mt-3 text-muted-foreground">{m.bottomCtaBody}</p>
          <Link
            href="/newsletter"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
          >
            {m.bottomCtaButtonLabel}
          </Link>
        </section>
      </main>
    </>
  );
}
