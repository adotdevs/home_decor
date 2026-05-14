/**
 * IP → geo enrichment when platform headers omit country (e.g. local dev).
 * Uses https://ipwho.is/ (free HTTPS JSON API, no API key).
 * Results are cached per IP to limit external calls and latency.
 */
import type { GeoHeaders } from "@/lib/analytics/request-meta";

const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE = 8_000;
const FETCH_TIMEOUT_MS = 2500;

type CacheEntry = { expiresAt: number; data: GeoHeaders };

const cache = new Map<string, CacheEntry>();

function isLookupDisabled(): boolean {
  return process.env.IP_GEO_LOOKUP_DISABLED === "1" || process.env.IP_GEO_LOOKUP_DISABLED === "true";
}

/** Skip link-local / private / loopback — not meaningful for public geo APIs */
export function isNonRoutableClientIp(ip: string): boolean {
  const s = ip.trim().toLowerCase();
  if (!s) return true;
  if (s === "::1") return true;
  if (s.startsWith("127.")) return true;
  if (s.startsWith("10.")) return true;
  if (s.startsWith("192.168.")) return true;
  if (s.startsWith("169.254.")) return true;
  if (s.startsWith("fe80:") || s.startsWith("fc") || s.startsWith("fd")) return true;
  const m = /^172\.(\d+)\./.exec(s);
  if (m) {
    const oc = Number(m[1]);
    if (oc >= 16 && oc <= 31) return true;
  }
  return false;
}

function pruneCacheIfNeeded() {
  if (cache.size <= MAX_CACHE) return;
  const now = Date.now();
  for (const [k, v] of cache) {
    if (v.expiresAt <= now) cache.delete(k);
    if (cache.size <= MAX_CACHE * 0.85) break;
  }
  if (cache.size > MAX_CACHE) {
    const slice = [...cache.keys()].slice(0, cache.size - MAX_CACHE + 1000);
    for (const k of slice) cache.delete(k);
  }
}

function sanitizePart(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F]/g, " ")
    .trim()
    .slice(0, max);
}

type IpWhoJson = {
  success?: boolean;
  country_code?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: { id?: string };
  message?: string;
};

function mapResponse(json: IpWhoJson): GeoHeaders {
  const rawCode = sanitizePart(json.country_code, 8).toUpperCase().replace(/[^A-Z]/g, "");
  const country = rawCode.length === 2 ? rawCode : "";
  return {
    country,
    city: sanitizePart(json.city, 120),
    region: sanitizePart(json.region, 120),
    timezone: sanitizePart(json.timezone?.id, 80),
  };
}

async function fetchGeoForIp(ip: string): Promise<GeoHeaders | null> {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  let json: IpWhoJson;
  try {
    json = (await res.json()) as IpWhoJson;
  } catch {
    return null;
  }
  if (json.success === false) return null;
  const mapped = mapResponse(json);
  if (!mapped.country && !mapped.city && !mapped.region) return null;
  return mapped;
}

/**
 * If headers already include country (e.g. Vercel), keep them and only reuse timezone
 * from headers. Otherwise resolve via public IP lookup.
 */
export async function resolveGeoForIngest(
  fromHeaders: GeoHeaders,
  clientIp: string,
): Promise<GeoHeaders> {
  if (fromHeaders.country) {
    return {
      country: fromHeaders.country,
      city: fromHeaders.city,
      region: fromHeaders.region,
      timezone: fromHeaders.timezone,
    };
  }

  if (isLookupDisabled() || isNonRoutableClientIp(clientIp)) {
    return {
      country: "",
      city: "",
      region: "",
      timezone: fromHeaders.timezone,
    };
  }

  const ip = clientIp.trim();
  const now = Date.now();
  const hit = cache.get(ip);
  if (hit && hit.expiresAt > now) {
    return {
      ...hit.data,
      timezone: hit.data.timezone || fromHeaders.timezone,
    };
  }

  const lookedUp = await fetchGeoForIp(ip);
  if (!lookedUp) {
    return {
      country: "",
      city: "",
      region: "",
      timezone: fromHeaders.timezone,
    };
  }

  const merged: GeoHeaders = {
    country: lookedUp.country,
    city: lookedUp.city || fromHeaders.city,
    region: lookedUp.region || fromHeaders.region,
    timezone: lookedUp.timezone || fromHeaders.timezone,
  };

  cache.set(ip, { expiresAt: now + CACHE_TTL_MS, data: merged });
  pruneCacheIfNeeded();

  return merged;
}
