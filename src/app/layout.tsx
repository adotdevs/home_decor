import type { Metadata } from "next";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { AdSlot } from "@/components/ads/ad-slot";
import { buildMetadata } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const b = await getResolvedSiteBranding();
  return await buildMetadata({
    title: `${b.name} | Premium Interior Inspiration`,
    description: b.description,
    path: "/",
    keywords: ["home decor ideas", "interior design inspiration", "luxury decor"],
  });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const b = await getResolvedSiteBranding();
  const baseUrl = b.url.replace(/\/$/, "");
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: b.name,
    url: baseUrl,
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: b.name,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="en" className={`${heading.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <NextTopLoader
          color="oklch(0.46 0.08 65)"
          height={2}
          showSpinner={false}
          shadow={false}
          zIndex={9999}
        />
        <JsonLd data={orgSchema} />
        <JsonLd data={websiteSchema} />
        <SiteHeader siteName={b.name} />
        <Suspense fallback={null}>
          <div className="mx-auto max-w-7xl min-w-0 overflow-x-clip px-4 pb-2 pt-1 sm:px-5 md:px-8">
            <AdSlot placement="header" />
          </div>
        </Suspense>
        <div className="min-h-[70vh] min-w-0 overflow-x-clip pb-24 md:pb-8">{children}</div>
        <SiteFooter siteName={b.name} siteDescription={b.description} />
        <Suspense fallback={null}>
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-background/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
            <div className="mx-auto max-w-7xl min-w-0 overflow-x-hidden">
              <AdSlot placement="sticky-mobile" className="min-w-0" />
            </div>
          </div>
        </Suspense>
      </body>
    </html>
  );
}
