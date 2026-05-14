"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const VISITOR_KEY = "hd_analytics_vid";
const VISITOR_COOKIE = "hd_analytics_vid";
const SESSION_KEY = "hd_analytics_sid";
const SESSION_EXPIRES_KEY = "hd_analytics_sxp";
/** One-shot geo from GET /api/analytics/client-geo; avoids repeat IP API calls */
const CLIENT_GEO_KEY = "hd_analytics_geo_v1";
const SESSION_IDLE_MS = 30 * 60 * 1000;
/** Keeps lastActivityAt fresh on the server while a tab is visible */
const PRESENCE_INTERVAL_MS = 45 * 1000;
const FLUSH_INTERVAL_MS = 4000;
const PAGE_VIEW_DEDUPE_MS = 3000;
const CLICK_DEDUPE_MS = 800;
const BATCH_MAX = 12;

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* private mode */
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
      if (k !== VISITOR_COOKIE) continue;
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
    document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(vid)}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? "; Secure" : ""}`;
  } catch {
    /* ignore */
  }
}

function sendPresence(visitorKey: string, sessionKey: string): void {
  if (typeof document === "undefined") return;
  const visible = document.visibilityState === "visible";
  void fetch("/api/analytics/presence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorKey, sessionKey, visible }),
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

function flushQueue(
  visitorKey: string,
  sessionKey: string,
  referrer: string,
  queue: Queued[],
): void {
  if (!queue.length) return;
  const batch = queue.splice(0, BATCH_MAX);
  const geo = clientGeoCache.v;
  const body = JSON.stringify({
    visitorKey,
    sessionKey,
    referrer: referrer || "",
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
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const queueRef = useRef<Queued[]>([]);
  const visitorRef = useRef<string>("");
  const sessionRef = useRef<string>("");
  const lastPvRef = useRef<{ path: string; t: number } | null>(null);
  const lastClickRef = useRef<{ href: string; t: number } | null>(null);
  const articleEnterRef = useRef<{ slug: string; t: number } | null>(null);
  const scrollMaxRef = useRef<number>(0);
  const isAdmin = pathname.startsWith("/admin");

  const ensureIds = useCallback(() => {
    let vid = storageGet(VISITOR_KEY);
    if (!vid || vid.length < 8) {
      vid = readVidCookie();
    }
    if (!vid || vid.length < 8) {
      vid = uuid();
    }
    storageSet(VISITOR_KEY, vid);
    writeVidCookie(vid);
    visitorRef.current = vid;

    let sid = storageGet(SESSION_KEY);
    let exp = Number(storageGet(SESSION_EXPIRES_KEY) || "0");
    const now = Date.now();
    if (!sid || sid.length < 8 || now > exp) {
      sid = uuid();
      storageSet(SESSION_KEY, sid);
      exp = now + SESSION_IDLE_MS;
      storageSet(SESSION_EXPIRES_KEY, String(exp));
      sessionRef.current = sid;
      return { visitorKey: vid, sessionKey: sid, isNewSession: true };
    }
    sessionRef.current = sid;
    exp = now + SESSION_IDLE_MS;
    storageSet(SESSION_EXPIRES_KEY, String(exp));
    return { visitorKey: vid, sessionKey: sid, isNewSession: false };
  }, []);

  const scheduleFlush = useCallback(() => {
    if (isAdmin) return;
    const { visitorKey, sessionKey } = ensureIds();
    const ref = typeof document !== "undefined" ? document.referrer : "";
    flushQueue(visitorKey, sessionKey, ref, queueRef.current);
  }, [ensureIds, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    try {
      const raw = localStorage.getItem(CLIENT_GEO_KEY);
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
          localStorage.setItem(CLIENT_GEO_KEY, JSON.stringify(snap));
        } catch {
          /* private mode */
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    const tick = window.setInterval(() => {
      scheduleFlush();
    }, FLUSH_INTERVAL_MS);

    const onHidden = () => scheduleFlush();
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onHidden);
      scheduleFlush();
    };
  }, [isAdmin, scheduleFlush]);

  useEffect(() => {
    if (isAdmin) return;

    const pulse = () => {
      const { visitorKey, sessionKey } = ensureIds();
      sendPresence(visitorKey, sessionKey);
    };

    const iv = window.setInterval(pulse, PRESENCE_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") pulse();
    };
    document.addEventListener("visibilitychange", onVisible);
    const boot = window.setTimeout(pulse, 5000);

    return () => {
      window.clearInterval(iv);
      window.clearTimeout(boot);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAdmin, ensureIds]);

  useEffect(() => {
    if (isAdmin) return;
    const ids = ensureIds();
    const now = Date.now();
    const qs = searchParams?.toString() || "";
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    const dup =
      lastPvRef.current &&
      lastPvRef.current.path === fullPath &&
      now - lastPvRef.current.t < PAGE_VIEW_DEDUPE_MS;
    if (dup) return;

    lastPvRef.current = { path: fullPath, t: now };

    const { visitorKey, sessionKey, isNewSession } = ids;

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

    if (isNewSession) {
      queueRef.current.push({
        type: "session_start",
        path: fullPath,
        ts: now,
        ...pathMeta(pathname),
      });
    }

    queueRef.current.push({
      type: "page_view",
      path: fullPath,
      ts: now,
      ...pathMeta(pathname),
    });

    if (queueRef.current.length >= BATCH_MAX) {
      const ref = typeof document !== "undefined" ? document.referrer : "";
      flushQueue(visitorKey, sessionKey, ref, queueRef.current);
    }
  }, [pathname, searchParams, ensureIds, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
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
  }, [pathname, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;

      const now = Date.now();
      const dup =
        lastClickRef.current &&
        lastClickRef.current.href === href &&
        now - lastClickRef.current.t < CLICK_DEDUPE_MS;
      if (dup) return;
      lastClickRef.current = { href, t: now };

      let clickKind = "internal_nav";
      const explicit = a.closest("[data-analytics-kind]")?.getAttribute("data-analytics-kind");
      if (explicit) clickKind = explicit;

      const isExternal =
        /^https?:\/\//i.test(href) &&
        typeof window !== "undefined" &&
        !href.startsWith(window.location.origin);
      if (isExternal) clickKind = "external";

      const { visitorKey, sessionKey } = ensureIds();
      queueRef.current.push({
        type: "click",
        path: pathname,
        href,
        clickKind,
        linkText: (a.textContent || "").trim().slice(0, 200),
        ts: now,
      });
      if (queueRef.current.length >= BATCH_MAX) {
        const ref = typeof document !== "undefined" ? document.referrer : "";
        flushQueue(visitorKey, sessionKey, ref, queueRef.current);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, ensureIds, isAdmin]);

  return null;
}
