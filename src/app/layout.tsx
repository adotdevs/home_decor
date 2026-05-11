import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { AdSlot } from "@/components/ads/ad-slot";
import { buildMetadata } from "@/lib/utils/seo";

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

export const metadata: Metadata = buildMetadata({ title: "Luxe Home Decor Ideas | Premium Interior Inspiration", description: "Explore modern home decor inspiration.", path: "/", keywords: ["home decor ideas", "interior design inspiration", "luxury decor"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Luxe Home Decor Ideas",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  };
  return (
    <html lang="en" className={`${heading.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-background text-foreground">
        <JsonLd data={orgSchema} />
        <SiteHeader />
        <Suspense fallback={null}>
          <div className="mx-auto max-w-7xl px-4 pb-2 pt-1">
            <AdSlot placement="header" />
          </div>
        </Suspense>
        <div className="min-h-[70vh] pb-24 md:pb-8">{children}</div>
        <SiteFooter />
        <Suspense fallback={null}>
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-background/95 p-2 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
            <AdSlot placement="sticky-mobile" />
          </div>
        </Suspense>
      </body>
    </html>
  );
}