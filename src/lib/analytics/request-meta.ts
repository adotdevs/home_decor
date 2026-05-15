/** Analytics request / visitor metadata helpers (server-safe). */

import { classifyTrafficSourceLegacy } from "@/lib/analytics/traffic-source";

/** Exclude real in-app browsers; keep aggressive for crawlers & perf tools. */
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|telegrambot|lighthouse|pagespeed|chrome-lighthouse|gtmetrix|uptimerobot|pingdom|statuscake|preview|prerender|headlesschrome|phantomjs|scrapy|python-requests|^curl\/|wget|^java\//i;

export function isLikelyBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || ua.length < 10) return true;
  return BOT_UA.test(ua);
}

/** @deprecated Legacy 6-bucket label; ingest uses full getTrafficSource categories. */
export function classifyTrafficSource(referrerUrl: string | null | undefined): string {
  return classifyTrafficSourceLegacy(referrerUrl);
}

export function referrerHostFromUrl(referrerUrl: string | null | undefined): string {
  if (!referrerUrl) return "";
  try {
    return new URL(referrerUrl).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function deviceTypeFromUa(ua: string | null | undefined): "desktop" | "tablet" | "mobile" {
  if (!ua) return "desktop";
  const u = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|kindle/.test(u)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/.test(u)) return "mobile";
  return "desktop";
}

/** Very light browser / OS hints without extra dependencies */
export function browserOsFromUa(ua: string | null | undefined): { browser: string; os: string } {
  if (!ua) return { browser: "", os: "" };
  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/msie|trident/i.test(ua)) browser = "IE";

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os };
}

export type GeoHeaders = {
  country: string;
  city: string;
  region: string;
  timezone: string;
};

/** Vercel / Cloudflare / generic proxies */
export function geoFromRequestHeaders(headers: Headers): GeoHeaders {
  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "";
  const city =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    "";
  const region =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("cf-region") ||
    "";
  const timezone =
    headers.get("x-vercel-ip-timezone") ||
    headers.get("x-vercel-ip-time-zone") ||
    headers.get("cf-timezone") ||
    "";
  return {
    country: decodeGeoPart(country),
    city: decodeGeoPart(city),
    region: decodeGeoPart(region),
    timezone: decodeGeoPart(timezone),
  };
}

function decodeGeoPart(raw: string): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "";
}
