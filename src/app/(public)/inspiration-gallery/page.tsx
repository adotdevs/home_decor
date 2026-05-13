import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { localAssets } from "@/config/local-assets";
import { getMergedGalleryItems } from "@/services/gallery-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const items = await getMergedGalleryItems();
  const ogImage = items[0]?.src ?? localAssets[0].src;
  const title = "Inspiration Gallery — Real Home Decor Photos & Interior Ideas";
  const description =
    "Browse our curated gallery of real interior design photos spanning living rooms, kitchens, bedrooms, bathrooms, wall decor, and entryways. Filter by room to find your perfect style.";
  return {
    title,
    description,
    alternates: { canonical: "/inspiration-gallery" },
    openGraph: {
      title: "Inspiration Gallery — Real Home Decor Photos",
      description:
        "Explore hundreds of real interior design photos. Filter by living, kitchen, bedroom, bathroom, wall decor, and entryway for instant style inspiration.",
      images: [ogImage],
    },
  };
}

export default async function InspirationGalleryPage() {
  const galleryItems = await getMergedGalleryItems();
  const b = await getResolvedSiteBranding();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "Inspiration Gallery", path: "/inspiration-gallery" },
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
          <span className="text-foreground">Inspiration Gallery</span>
        </nav>

        <header className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">Visual inspiration</p>
            <h1 className="mt-2 font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Inspiration Gallery
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Real rooms from our published guides plus curated photography. Browse{" "}
              <strong className="font-medium text-foreground">{galleryItems.length}+</strong> interior photos — filter
              by room. Images from articles link back to the full story.
            </p>
          </div>
          <aside className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-semibold">How to use this gallery</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Do not save only the prettiest photo. Save the reason it works: the repeated wood tone, the way a lamp
              lowers the light, the scale of art over furniture, or the quiet color that ties the room together. Those
              are the details you can recreate without copying a room exactly.
            </p>
          </aside>
        </header>

        <GalleryGrid items={galleryItems} />

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            [
              "Living rooms",
              "Look for sofa scale, lamp height, rug reach, and whether the coffee table has both function and breathing room.",
            ],
            [
              "Kitchens",
              "Notice how boards, ceramics, glassware, and lighting create warmth without stealing working counter space.",
            ],
            [
              "Walls & entryways",
              "Study sightlines: a mirror, console, bench, or framed piece should greet you before the smaller styling details.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-heading text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 px-8 py-12 text-center dark:from-amber-950/30 dark:to-rose-950/30">
          <h2 className="font-heading text-2xl font-semibold">Want more curated inspiration every week?</h2>
          <p className="mt-3 text-muted-foreground">
            Join 12,000+ readers who get our seasonal decor edits straight to their inbox.
          </p>
          <Link
            href="/newsletter"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-neutral-900 px-7 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90"
          >
            Subscribe free
          </Link>
        </section>
      </main>
    </>
  );
}
