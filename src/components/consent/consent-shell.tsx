"use client";

import type { ReactNode } from "react";
import { AdsenseLoader } from "@/components/consent/adsense-loader";
import { ConsentProvider } from "@/components/consent/consent-context";
import { CookieBanner } from "@/components/consent/cookie-banner";
import type { ConsentPayload } from "@/lib/consent/shared";

export function ConsentShell({
  initial,
  children,
}: {
  initial: ConsentPayload | null;
  children: ReactNode;
}) {
  return (
    <ConsentProvider initial={initial}>
      {children}
      <CookieBanner />
      <AdsenseLoader />
    </ConsentProvider>
  );
}
