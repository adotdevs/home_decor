"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearNonEssentialClientStorage } from "@/lib/consent/clear-client-storage";
import {
  CONSENT_COOKIE_NAME,
  type ConsentPayload,
  parseConsentCookie,
  serializeConsent,
} from "@/lib/consent/shared";

function readBrowserConsent(): ConsentPayload | null {
  if (typeof document === "undefined") return null;
  try {
    const all = document.cookie.split("; ");
    for (const p of all) {
      const i = p.indexOf("=");
      if (i === -1) continue;
      const name = p.slice(0, i);
      if (name !== CONSENT_COOKIE_NAME) continue;
      return parseConsentCookie(decodeURIComponent(p.slice(i + 1)));
    }
  } catch {
    /* ignore */
  }
  return null;
}

function persistCookie(payload: ConsentPayload): void {
  if (typeof document === "undefined") return;
  const secure = globalThis.location?.protocol === "https:";
  const val = serializeConsent(payload);
  document.cookie = `${CONSENT_COOKIE_NAME}=${val}; Path=/; Max-Age=${60 * 60 * 24 * 395}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

type ConsentContextValue = {
  /** User has not stored a choice yet (no `hd_consent_v1` cookie). */
  pending: boolean;
  analytics: boolean;
  ads: boolean;
  acceptAll: () => void;
  essentialOnly: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: ConsentPayload | null;
}) {
  const router = useRouter();
  const [local, setLocal] = useState<ConsentPayload | null>(initial);

  useEffect(() => {
    setLocal(initial);
  }, [initial]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = readBrowserConsent();
    if (c) setLocal(c);
  }, []);

  const acceptAll = useCallback(() => {
    const payload: ConsentPayload = { v: 1, analytics: true, ads: true, t: Date.now() };
    persistCookie(payload);
    setLocal(payload);
    router.refresh();
  }, [router]);

  const essentialOnly = useCallback(() => {
    clearNonEssentialClientStorage();
    const payload: ConsentPayload = { v: 1, analytics: false, ads: false, t: Date.now() };
    persistCookie(payload);
    setLocal(payload);
    router.refresh();
  }, [router]);

  const value = useMemo((): ConsentContextValue => {
    const analytics = local?.analytics === true;
    const ads = local?.ads === true;
    return {
      pending: !local,
      analytics,
      ads,
      acceptAll,
      essentialOnly,
    };
  }, [local, acceptAll, essentialOnly]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    return {
      pending: true,
      analytics: false,
      ads: false,
      acceptAll: () => {},
      essentialOnly: () => {},
    };
  }
  return ctx;
}
