"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useConsent } from "@/components/consent/consent-context";
import { shouldSkipClientAnalytics } from "@/lib/analytics/client-filter";
import {
  ANALYTICS_DOC_REF_KEY,
  ANALYTICS_LANDING_KEY,
  ANALYTICS_LAST_ENGAGED_AT_KEY,
  ANALYTICS_SESSION_KEY,
  ANALYTICS_VISITOR_COOKIE,
  ANALYTICS_VISITOR_KEY,
  CLIENT_GEO_CACHE_KEY,
} from "@/lib/analytics/storage-keys";
import type { IngestAttribution } from "@/services/analytics-ingest-service";

const SESSION_IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MIN_MS = 55 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const FLUSH_INTERVAL_MS = 4000;
const PAGE_VIEW_DEDUPE_MS = 4500;
const CLICK_DEDUPE_MS = 1200;
const BATCH_MAX = 12;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* private mode */
  }
}

function ssGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function ssSet(key: string, val: string): void {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    /* private mode */
  }
}

function ssRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readVidCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const all = document.cookie.split("; ");
    for (const p of all) {
      const i = p.indexOf("=");
      if (i === -1) continue;
      const k = p.slice(0, i);
      if (k !== ANALYTICS_VISITOR_COOKIE) continue;
      const v = decodeURIComponent(p.slice(i + 1));
      return v.length >= 8 ? v : null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeVidCookie(vid: string): void {
  try {
    if (typeof document === "undefined") return;
    const secure = globalThis.location?.protocol === "https:";
    document.cookie = `${ANALYTICS_VISITOR_COOKIE}=${encodeURIComponent(vid)}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`;
  } catch {
    /* ignore */
  }
}

function sendPresence(visitorKey: string, sessionKey: string): void {
  if (typeof document === "undefined") return;
  if (document.visibilityState !== "visible") return;
  void fetch("/api/analytics/presence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorKey, sessionKey, visible: true }),
    keepalive: true,
  }).catch(() => {});
}

type ClientGeoPayload = {
  country: string;
  city: string;
  region: string;
  timezone: string;
};

const clientGeoCache: { v: ClientGeoPayload | null } = { v: null };

type Queued = {
  type: "session_start" | "page_view" | "click" | "search" | "article_time";
  path?: string;
  ts?: number;
  articleSlug?: string;
  categorySlug?: string;
  href?: string;
  clickKind?: string;
  linkText?: string;
  searchQuery?: string;
  resultCount?: number;
  dwellMs?: number;
  scrollMaxPct?: number;
  pageTitle?: string;
  idempotencyKey?: string;
};

function pathMeta(pathname: string): { articleSlug?: string; categorySlug?: string } {
  const mArticle = /^\/article\/([^/]+)/.exec(pathname);
  if (mArticle) return { articleSlug: decodeURIComponent(mArticle[1]!) };
  const mCat = /^\/category\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  if (mCat) {
    return { categorySlug: decodeURIComponent(mCat[1]!) };
  }
  return {};
}

function readAttributionPayload(): IngestAttribution | null {
  if (typeof window === "undefined") return null;
  const siteHost = window.location.hostname;
  const docRef = ssGet(ANALYTICS_DOC_REF_KEY) ?? "";
  const rawLand = ssGet(ANALYTICS_LANDING_KEY);
  let pathname = window.location.pathname;
  let search = window.location.search || "";
  if (rawLand) {
    try {
      const j = JSON.parse(rawLand) as { pathname?: string; search?: string };
      if (typeof j.pathname === "string") pathname = j.pathname;
      if (typeof j.search === "string") search = j.search;
    } catch {
      /* ignore */
    }
  }
  if (!siteHost) return null;
  const landingSearch = search.startsWith("?") ? search.slice(1) : search;
  return {
    documentReferrer: docRef,
    landingPathname: pathname,
    landingSearch,
    siteHost,
  };
}

function captureNewSessionContext(): void {
  if (typeof window === "undefined") return;
  ssSet(ANALYTICS_DOC_REF_KEY, document.referrer || "");
  ssSet(
    ANALYTICS_LANDING_KEY,
    JSON.stringify({ pathname: window.location.pathname, search: window.location.search || "" }),
  );
}

function flushQueue(visitorKey: string, sessionKey: string, referrer: string, queue: Queued[]): void {
  if (!queue.length) return;
  const batch = queue.splice(0, BATCH_MAX);
  const geo = clientGeoCache.v;
  const attribution = readAttributionPayload();
  const body = JSON.stringify({
    visitorKey,
    sessionKey,
    referrer: referrer || "",
    ...(attribution ? { attribution } : {}),
    ...(geo?.country ? { clientGeo: geo } : {}),
    events: batch,
  });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/ingest", blob);
    return;
  }
  void fetch("/api/analytics/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Side-effect only — does not wrap the tree so Suspense never blocks page render.
 */
export function AnalyticsProvider() {
  const { analytics: consentAnalytics } = useConsent();
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const queryKey = sp?.toString() ?? "";

  const queueRef = useRef<Queued[]>([]);
  const visitorRef = useRef<string>("");
  const sessionRef = useRef<string>("");
  const lastClickSigRef = useRef<{ sig: string; t: number } | null>(null);
  const articleEnterRef = useRef<{ slug: string; t: number } | null>(null);
  const scrollMaxRef = useRef<number>(0);
  const lastHbAtRef = useRef<number>(0);
  const listenersBoundRef = useRef(false);

  const isAdmin = pathname.startsWith("/admin");
  const skip = isAdmin || shouldSkipClientAnalytics() || !consentAnalytics;

  const fullPath = useMemo(() => (queryKey ? `${pathname}?${queryKey}` : pathname), [pathname, queryKey]);

  const ensureVisitorKey = useCallback((): string => {
    let vid = lsGet(ANALYTICS_VISITOR_KEY);
    if (!vid || vid.length < 8) {
      vid = readVidCookie();
    }
    if (!vid || vid.length < 8) {
      vid = uuid();
    }
    lsSet(ANALYTICS_VISITOR_KEY, vid);
    writeVidCookie(vid);
    visitorRef.current = vid;
    return vid;
  }, []);

  const getOrCreateBrowserSession = useCallback((): { sessionKey: string; isNew: boolean } => {
    const now = Date.now();
    let sid = ssGet(ANALYTICS_SESSION_KEY);
    const lastEng = ssGet(ANALYTICS_LAST_ENGAGED_AT_KEY);
    const lastTs = lastEng ? Number(lastEng) : 0;

    const idleExpired = lastTs > 0 && now - lastTs > SESSION_IDLE_MS;
    const invalid = !sid || sid.length < 8;

    if (invalid || idleExpired) {
      sid = uuid();
      ssSet(ANALYTICS_SESSION_KEY, sid);
      ssRemove(ANALYTICS_LAST_ENGAGED_AT_KEY);
      captureNewSessionContext();
      sessionRef.current = sid;
      return { sessionKey: sid, isNew: true };
    }
    const activeSid = sid as string;
    sessionRef.current = activeSid;
    return { sessionKey: activeSid, isNew: false };
  }, []);

  const recordEngagement = useCallback((): void => {
    ssSet(ANALYTICS_LAST_ENGAGED_AT_KEY, String(Date.now()));
  }, []);

  const sessionReferrer = useCallback((): string => ssGet(ANALYTICS_DOC_REF_KEY) || "", []);

  const scheduleFlush = useCallback(() => {
    if (skip) return;
    const vk = visitorRef.current || ensureVisitorKey();
    const sk = sessionRef.current;
    if (!sk) return;
    flushQueue(vk, sk, sessionReferrer(), queueRef.current);
  }, [ensureVisitorKey, sessionReferrer, skip]);

  const shouldSkipPageView = useCallback((pathKey: string): boolean => {
    const now = Date.now();
    const storageKey = `hd_analytics_pv:${pathKey}`;
    try {
      const prev = ssGet(storageKey);
      if (prev && now - Number(prev) < PAGE_VIEW_DEDUPE_MS) return true;
      ssSet(storageKey, String(now));
    } catch {
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    if (skip) return;
    try {
      const raw = localStorage.getItem(CLIENT_GEO_CACHE_KEY);
      if (raw) {
        const j = JSON.parse(raw) as Partial<ClientGeoPayload>;
        if (typeof j.country === "string" && j.country.length === 2) {
          clientGeoCache.v = {
            country: j.country.toUpperCase(),
            city: typeof j.city === "string" ? j.city : "",
            region: typeof j.region === "string" ? j.region : "",
            timezone: typeof j.timezone === "string" ? j.timezone : "",
          };
          return;
        }
      }
    } catch {
      /* ignore */
    }

    void fetch("/api/analytics/client-geo")
      .then((r) => r.json())
      .then((data: { ok?: boolean; country?: string; city?: string; region?: string; timezone?: string }) => {
        if (!data?.country || String(data.country).length !== 2) return;
        const snap: ClientGeoPayload = {
          country: String(data.country).toUpperCase(),
          city: data.city ? String(data.city) : "",
          region: data.region ? String(data.region) : "",
          timezone: data.timezone ? String(data.timezone) : "",
        };
        clientGeoCache.v = snap;
        try {
          localStorage.setItem(CLIENT_GEO_CACHE_KEY, JSON.stringify(snap));
        } catch {
          /* private mode */
        }
      })
      .catch(() => {});
  }, [skip]);

  useEffect(() => {
    if (skip) return;
    if (listenersBoundRef.current) return;
    listenersBoundRef.current = true;

    const tick = window.setInterval(() => {
      scheduleFlush();
    }, FLUSH_INTERVAL_MS);

    const onVisibilityFlush = () => {
      if (document.visibilityState === "hidden") scheduleFlush();
    };

    const onPageHide = () => scheduleFlush();

    document.addEventListener("visibilitychange", onVisibilityFlush);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      listenersBoundRef.current = false;
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibilityFlush);
      window.removeEventListener("pagehide", onPageHide);
      scheduleFlush();
    };
  }, [skip, scheduleFlush]);

  useEffect(() => {
    if (skip) return;
    let iv: number | null = null;

    const pulse = () => {
      const now = Date.now();
      if (now - lastHbAtRef.current < HEARTBEAT_MIN_MS) return;
      lastHbAtRef.current = now;
      const vk = visitorRef.current || ensureVisitorKey();
      const sk = sessionRef.current;
      if (vk && sk) sendPresence(vk, sk);
    };

    iv = window.setInterval(pulse, HEARTBEAT_INTERVAL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") pulse();
    };
    document.addEventListener("visibilitychange", onVis);
    const boot = window.setTimeout(pulse, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (iv != null) window.clearInterval(iv);
      window.clearTimeout(boot);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [skip, ensureVisitorKey]);

  useEffect(() => {
    if (skip) return;
    /** Spec / browsers may use `prerender`; lib.dom typing can lag. */
    if (typeof document !== "undefined" && String(document.visibilityState) === "prerender") return;
    if (shouldSkipPageView(fullPath)) return;

    ensureVisitorKey();
    const now = Date.now();
    const { sessionKey, isNew } = getOrCreateBrowserSession();
    const visitorKey = visitorRef.current;

    const meta = pathMeta(pathname);
    const prevArticle = articleEnterRef.current;
    if (prevArticle && prevArticle.slug !== meta.articleSlug) {
      const dwell = now - prevArticle.t;
      if (dwell > 2000) {
        queueRef.current.push({
          type: "article_time",
          path: `/article/${prevArticle.slug}`,
          articleSlug: prevArticle.slug,
          dwellMs: dwell,
          scrollMaxPct: scrollMaxRef.current,
          ts: now,
        });
      }
    }
    scrollMaxRef.current = 0;
    if (meta.articleSlug) {
      articleEnterRef.current = { slug: meta.articleSlug, t: now };
    } else {
      articleEnterRef.current = null;
    }

    const idempotencyKey = `${sessionKey}|pv|${fullPath}|${Math.floor(now / PAGE_VIEW_DEDUPE_MS)}`;
    const pageTitle = typeof document !== "undefined" ? document.title : "";

    if (isNew) {
      queueRef.current.push({
        type: "session_start",
        path: fullPath,
        ts: now,
        pageTitle,
        ...pathMeta(pathname),
      });
    }

    queueRef.current.push({
      type: "page_view",
      path: fullPath,
      ts: now,
      pageTitle,
      idempotencyKey,
      ...pathMeta(pathname),
    });

    recordEngagement();

    if (queueRef.current.length >= BATCH_MAX) {
      flushQueue(visitorKey, sessionKey, sessionReferrer(), queueRef.current);
    }
  }, [
    skip,
    pathname,
    queryKey,
    fullPath,
    ensureVisitorKey,
    getOrCreateBrowserSession,
    recordEngagement,
    shouldSkipPageView,
    sessionReferrer,
  ]);

  useEffect(() => {
    if (skip) return;
    const meta = pathMeta(pathname);
    if (!meta.articleSlug) return;
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((el.scrollTop / max) * 100);
      scrollMaxRef.current = Math.max(scrollMaxRef.current, pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, skip]);

  useEffect(() => {
    if (skip) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;

      const trackedAnchor = t?.closest?.(
        'a[href]:not([href^="#"])',
      ) as HTMLAnchorElement | null;
      const trackedButton = trackedAnchor
        ? null
        : (t?.closest?.(
            "button[data-analytics-kind], [role='button'][data-analytics-kind], [data-analytics-click]",
          ) as HTMLElement | null);

      let href = "";
      let linkText = "";
      let clickKind = "internal_nav";

      if (trackedAnchor) {
        href = trackedAnchor.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
        linkText = (trackedAnchor.textContent || "").trim().slice(0, 200);
        const explicit = trackedAnchor.closest("[data-analytics-kind]")?.getAttribute("data-analytics-kind");
        if (explicit) clickKind = explicit;
        const isExternal =
          /^https?:\/\//i.test(href) && typeof window !== "undefined" && !href.startsWith(window.location.origin);
        if (isExternal) clickKind = "external";
      } else if (trackedButton) {
        clickKind = trackedButton.getAttribute("data-analytics-kind") || "cta";
        href = trackedButton.getAttribute("data-analytics-href") || trackedButton.getAttribute("href") || "";
        linkText = (trackedButton.textContent || "").trim().slice(0, 200);
      } else {
        return;
      }

      const sig = `${clickKind}|${href}|${linkText.slice(0, 40)}`;
      const ts = Date.now();
      const dup =
        lastClickSigRef.current &&
        lastClickSigRef.current.sig === sig &&
        ts - lastClickSigRef.current.t < CLICK_DEDUPE_MS;
      if (dup) return;
      lastClickSigRef.current = { sig, t: ts };

      ensureVisitorKey();
      const { sessionKey } = getOrCreateBrowserSession();
      const visitorKey = visitorRef.current;
      if (!sessionKey) return;

      recordEngagement();
      queueRef.current.push({
        type: "click",
        path: pathname,
        href,
        clickKind,
        linkText,
        ts,
      });
      if (queueRef.current.length >= BATCH_MAX) {
        flushQueue(visitorKey, sessionKey, sessionReferrer(), queueRef.current);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, ensureVisitorKey, getOrCreateBrowserSession, recordEngagement, sessionReferrer, skip]);

  return null;
}
