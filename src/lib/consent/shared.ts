/** Single consent cookie — versioned JSON (URL-encoded). */
export const CONSENT_COOKIE_NAME = "hd_consent_v1";

export type ConsentPayload = {
  v: 1;
  analytics: boolean;
  ads: boolean;
  t: number;
};

export function parseConsentCookie(raw: string | undefined | null): ConsentPayload | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  try {
    const j = ((): Partial<ConsentPayload> | null => {
      try {
        return JSON.parse(decodeURIComponent(s)) as Partial<ConsentPayload>;
      } catch {
        try {
          return JSON.parse(s) as Partial<ConsentPayload>;
        } catch {
          return null;
        }
      }
    })();
    if (!j || j.v !== 1) return null;
    return {
      v: 1,
      analytics: Boolean(j.analytics),
      ads: Boolean(j.ads),
      t: typeof j.t === "number" ? j.t : Date.now(),
    };
  } catch {
    return null;
  }
}

export function serializeConsent(payload: Omit<ConsentPayload, "t"> & { t?: number }): string {
  const full: ConsentPayload = {
    v: 1,
    analytics: payload.analytics,
    ads: payload.ads,
    t: payload.t ?? Date.now(),
  };
  return encodeURIComponent(JSON.stringify(full));
}
