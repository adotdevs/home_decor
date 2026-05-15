import { cookies } from "next/headers";
import { CONSENT_COOKIE_NAME, type ConsentPayload, parseConsentCookie } from "@/lib/consent/shared";

export async function getServerConsent(): Promise<ConsentPayload | null> {
  const jar = await cookies();
  return parseConsentCookie(jar.get(CONSENT_COOKIE_NAME)?.value);
}

export async function hasAnalyticsConsent(): Promise<boolean> {
  const c = await getServerConsent();
  return c?.analytics === true;
}

export async function hasAdsConsent(): Promise<boolean> {
  const c = await getServerConsent();
  return c?.ads === true;
}
