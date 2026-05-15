"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/consent/consent-context";

/**
 * Loads the official AdSense loader only after ads consent — required for EEA/UK personalisation rules
 * and aligns with Google Publisher policies when paired with a consent signal.
 */
export function AdsenseLoader() {
  const pathname = usePathname();
  const { ads } = useConsent();
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();

  if (pathname?.startsWith("/admin")) return null;
  if (!ads || !client?.startsWith("ca-pub-")) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
