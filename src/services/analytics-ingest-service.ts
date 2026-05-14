import { connectDb } from "@/lib/db";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import {
  browserOsFromUa,
  classifyTrafficSource,
  deviceTypeFromUa,
  geoFromRequestHeaders,
  isLikelyBotUserAgent,
  referrerHostFromUrl,
  clientIpFromHeaders,
} from "@/lib/analytics/request-meta";
import type { GeoHeaders } from "@/lib/analytics/request-meta";
import { resolveGeoForIngest } from "@/lib/analytics/ip-geo-lookup";
import type { AnalyticsEventType } from "@/models/AnalyticsEvent";

const MAX_BATCH = 40;
const MAX_EVENTS_PER_VISITOR_HOUR = 400;

export type IngestClientEvent = {
  type: AnalyticsEventType;
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

export type IngestBody = {
  visitorKey: string;
  sessionKey: string;
  referrer?: string;
  /** Cached from GET /api/analytics/client-geo (localStorage); used when CDN has no geo headers */
  clientGeo?: {
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  };
  events: IngestClientEvent[];
};

function sanitizeStr(s: unknown, max = 2048): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F]/g, " ")
    .trim()
    .slice(0, max);
}

function sanitizePath(p: unknown): string {
  const s = sanitizeStr(p, 512);
  if (!s || !s.startsWith("/")) return "/";
  return s;
}

/** Trusted shape from our client-geo route; two-letter country required */
function sanitizeClientGeo(raw: unknown): GeoHeaders | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const letters = sanitizeStr(o.country, 8).toUpperCase().replace(/[^A-Z]/g, "");
  const country = letters.length === 2 ? letters : "";
  if (!country) return null;
  return {
    country,
    city: sanitizeStr(o.city, 120),
    region: sanitizeStr(o.region, 120),
    timezone: sanitizeStr(o.timezone, 80),
  };
}

export async function ingestAnalyticsBatch(
  body: IngestBody,
  headers: Headers,
): Promise<{ ok: true; accepted: number } | { ok: false; status: number; error: string }> {
  const visitorKey = sanitizeStr(body.visitorKey, 80);
  const sessionKey = sanitizeStr(body.sessionKey, 80);
  if (!visitorKey || !sessionKey || visitorKey.length < 8 || sessionKey.length < 8) {
    return { ok: false, status: 400, error: "Invalid session identifiers" };
  }

  const ua = headers.get("user-agent") || "";
  if (isLikelyBotUserAgent(ua)) {
    return { ok: true, accepted: 0 };
  }

  const rawEvents = Array.isArray(body.events) ? body.events.slice(0, MAX_BATCH) : [];
  if (!rawEvents.length) {
    return { ok: false, status: 400, error: "No events" };
  }

  await connectDb();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await AnalyticsEvent.countDocuments({
    visitorKey,
    serverReceivedAt: { $gte: hourAgo },
  });
  if (recentCount > MAX_EVENTS_PER_VISITOR_HOUR) {
    return { ok: false, status: 429, error: "Rate limit exceeded" };
  }

  const headerGeo = geoFromRequestHeaders(headers);
  const clientGeoSan = sanitizeClientGeo(body.clientGeo);
  const clientIp = clientIpFromHeaders(headers);

  let geo: GeoHeaders;
  if (headerGeo.country) {
    geo = headerGeo;
  } else if (clientGeoSan) {
    geo = {
      country: clientGeoSan.country,
      city: clientGeoSan.city,
      region: clientGeoSan.region,
      timezone: clientGeoSan.timezone || headerGeo.timezone,
    };
  } else {
    geo = await resolveGeoForIngest(headerGeo, clientIp);
  }

  const dev = deviceTypeFromUa(ua);
  const { browser, os } = browserOsFromUa(ua);
  const ref = sanitizeStr(body.referrer, 2048);
  const trafficSource = classifyTrafficSource(ref || undefined);
  const refHost = referrerHostFromUrl(ref || undefined);

  const now = new Date();
  const docs = rawEvents.map((ev) => {
    const path = sanitizePath(ev.path);
    const occurredAt = ev.ts && Number.isFinite(ev.ts) ? new Date(Math.min(Date.now(), ev.ts)) : now;
    return {
      type: ev.type,
      visitorKey,
      sessionKey,
      path,
      articleSlug: ev.articleSlug ? sanitizeStr(ev.articleSlug, 200) : undefined,
      categorySlug: ev.categorySlug ? sanitizeStr(ev.categorySlug, 200) : undefined,
      href: ev.href ? sanitizeStr(ev.href, 2048) : "",
      clickKind: ev.clickKind ? sanitizeStr(ev.clickKind, 64) : "",
      linkText: ev.linkText ? sanitizeStr(ev.linkText, 300) : "",
      searchQuery: ev.searchQuery ? sanitizeStr(ev.searchQuery, 400) : "",
      resultCount:
        typeof ev.resultCount === "number" ? Math.max(0, Math.floor(ev.resultCount)) : undefined,
      dwellMs: typeof ev.dwellMs === "number" ? Math.max(0, Math.floor(ev.dwellMs)) : undefined,
      scrollMaxPct:
        typeof ev.scrollMaxPct === "number"
          ? Math.max(0, Math.min(100, Math.floor(ev.scrollMaxPct)))
          : undefined,
      country: geo.country,
      city: geo.city,
      region: geo.region,
      timezone: geo.timezone,
      deviceType: dev,
      browser,
      os,
      trafficSource,
      referrerHost: refHost,
      occurredAt,
      serverReceivedAt: now,
    };
  });

  await AnalyticsEvent.insertMany(docs, { ordered: false });

  const hadSessionStart = docs.some((d) => d.type === "session_start");
  const pageIncs = docs.filter((d) => d.type === "page_view").length;
  const clickIncs = docs.filter((d) => d.type === "click").length;
  const lastPath = docs[docs.length - 1]?.path || "/";
  const firstPath = docs[0]?.path || "/";

  if (hadSessionStart) {
    await AnalyticsSession.findOneAndUpdate(
      { sessionKey },
      {
        $setOnInsert: {
          visitorKey,
          sessionKey,
          startedAt: now,
          entryPath: firstPath,
          referrer: ref,
          referrerHost: refHost,
          trafficSource,
          country: geo.country,
          city: geo.city,
          region: geo.region,
          timezone: geo.timezone,
          deviceType: dev,
          browser,
          os,
          userAgent: ua.slice(0, 512),
          isBounce: true,
          pageViews: 0,
          clicks: 0,
        },
        $set: { lastActivityAt: now, exitPath: lastPath },
        $inc: { pageViews: pageIncs, clicks: clickIncs },
      },
      { upsert: true },
    );
  } else {
    const updated = await AnalyticsSession.findOneAndUpdate(
      { sessionKey },
      {
        $set: { lastActivityAt: now, exitPath: lastPath },
        $inc: { pageViews: pageIncs, clicks: clickIncs },
      },
      { new: true },
    );
    if (!updated) {
      await AnalyticsSession.create({
        visitorKey,
        sessionKey,
        startedAt: now,
        lastActivityAt: now,
        entryPath: firstPath,
        exitPath: lastPath,
        pageViews: pageIncs,
        clicks: clickIncs,
        referrer: ref,
        referrerHost: refHost,
        trafficSource,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        timezone: geo.timezone,
        deviceType: dev,
        browser,
        os,
        userAgent: ua.slice(0, 512),
        isBounce: pageIncs <= 1,
      });
    }
  }

  const snap = await AnalyticsSession.findOne({ sessionKey }).select("pageViews").lean();
  if (snap && (snap.pageViews ?? 0) > 1) {
    await AnalyticsSession.updateOne({ sessionKey }, { $set: { isBounce: false } });
  }

  return { ok: true, accepted: docs.length };
}
