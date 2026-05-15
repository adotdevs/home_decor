/**
 * First-party attribution: referrer URL, landing URL query (UTMs + ad click ids), and site host.
 * Safe to run on server or client (pure string parsing).
 */

export type TrafficSourceCategory =
  | "direct"
  | "google_organic"
  | "google_ads"
  | "bing_organic"
  | "other_search"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "pinterest"
  | "youtube"
  | "linkedin"
  | "reddit"
  | "whatsapp"
  | "email"
  | "referral"
  | "internal";

export type TrafficSourceResult = {
  category: TrafficSourceCategory;
  /** Stable machine-facing token, e.g. google_organic, l.facebook.com */
  detail: string;
  /** human-style medium: organic | cpc | social | email | referral | internal | direct */
  medium: string;
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function resolveSearchEngine(host: string): TrafficSourceCategory | null {
  if (/^google\./.test(host)) return "google_organic";
  if (/^(.+\.)?bing\.com$/.test(host)) return "bing_organic";
  if (/^(.+\.)?duckduckgo\.com$/.test(host)) return "other_search";
  if (/^search\.yahoo\.com$/.test(host) || /^yahoo\.com$/.test(host)) return "other_search";
  if (/^baidu\.com$/.test(host)) return "other_search";
  return null;
}

function resolveSocialFromHost(host: string): TrafficSourceCategory | null {
  if (/(\.|^)facebook\.com$/i.test(host)) return "facebook";
  if (/(\.|^)instagram\.com$/i.test(host)) return "instagram";
  if (host === "t.co" || /(\.|^)x\.com$/i.test(host) || /(\.|^)twitter\.com$/i.test(host)) return "twitter";
  if (/(\.|^)tiktok\.com$/i.test(host)) return "tiktok";
  if (/(\.|^)pinterest\.com$/i.test(host) || host === "pin.it") return "pinterest";
  if (/(\.|^)youtube\.com$/i.test(host) || host === "youtu.be") return "youtube";
  if (/(\.|^)linkedin\.com$/i.test(host)) return "linkedin";
  if (/(\.|^)reddit\.com$/i.test(host)) return "reddit";
  if (/(\.|^)whatsapp\.com$/i.test(host)) return "whatsapp";
  return null;
}

function parseLanding(landingUrl: string): URL | null {
  if (!landingUrl?.trim()) return null;
  try {
    return new URL(landingUrl);
  } catch {
    try {
      return new URL(landingUrl, "https://placeholder.invalid");
    } catch {
      return null;
    }
  }
}

/** Normalize utm_source tokens like "ig", "fb", "meta_ads". */
function categoryFromUtm(utmSource: string, utmMedium: string): TrafficSourceResult | null {
  const s = utmSource.toLowerCase();
  const m = utmMedium.toLowerCase();
  if (!s) return null;

  if (m === "email" || s === "email" || s.includes("newsletter") || s.includes("mailchimp") || s.includes("sendgrid")) {
    return { category: "email", detail: "utm_email", medium: "email" };
  }

  if (
    s.includes("facebook") ||
    s.includes("fb") ||
    s === "meta" ||
    s.includes("instagram") ||
    s.includes("igshopping") ||
    s.includes("paid_meta")
  ) {
    const ig = s.includes("instagram") || s === "ig" || s.includes("igshopping");
      return { category: ig ? "instagram" : "facebook", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("tiktok") || s.includes("tt")) {
    return { category: "tiktok", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("pinterest") || s === "pin") {
    return { category: "pinterest", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("google") && (m === "cpc" || m === "ppc" || m === "paid")) {
    return { category: "google_ads", detail: "utm_google_ads", medium: "cpc" };
  }

  if (s.includes("twitter") || s.includes("x.com") || s === "tw") {
    return { category: "twitter", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("linkedin")) {
    return { category: "linkedin", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("youtube") || s === "yt") {
    return { category: "youtube", detail: "utm_social", medium: m || "social" };
  }

  if (s.includes("whatsapp") || s === "wa") {
    return { category: "whatsapp", detail: "utm_messaging", medium: m || "social" };
  }

  return null;
}

export type GetTrafficSourceInput = {
  /** `document.referrer` at tab entry (external or empty). */
  documentReferrer: string;
  /** Full URL of the first page in this tab session, e.g. https://shop.com/pr?utm=... */
  landingUrl: string;
  /** Current site hostname without port, e.g. www.example.com */
  siteHost: string;
};

/**
 * Professional first-touch / session attribution from referrer + landing query + click ids.
 */
export function getTrafficSource(input: GetTrafficSourceInput): TrafficSourceResult {
  const { documentReferrer, landingUrl, siteHost } = input;
  const site = siteHost.replace(/^www\./i, "").toLowerCase();
  const land = parseLanding(landingUrl);
  const qs = land?.searchParams;

  const gclid = qs?.get("gclid");
  const fbclid = qs?.get("fbclid");
  const ttclid = qs?.get("ttclid");
  const utmSource = (qs?.get("utm_source") || "").trim();
  const utmMedium = (qs?.get("utm_medium") || "").trim();

  if (gclid) return { category: "google_ads", detail: "gclid", medium: "cpc" };
  if (fbclid) return { category: "facebook", detail: "fbclid", medium: "cpc" };
  if (ttclid) return { category: "tiktok", detail: "ttclid", medium: "cpc" };

  const fromUtm = categoryFromUtm(utmSource, utmMedium);
  if (fromUtm) return fromUtm;

  if (utmMedium === "organic" && utmSource.includes("google")) {
    return { category: "google_organic", detail: "utm_organic", medium: "organic" };
  }

  const ref = (documentReferrer || "").trim();
  if (!ref) {
    return { category: "direct", detail: "none", medium: "none" };
  }

  let refHost = hostOf(ref);
  if (refHost.startsWith("www.")) refHost = refHost.slice(4);

  if (site && refHost && refHost === site) {
    return { category: "internal", detail: "same_site", medium: "internal" };
  }

  const se = resolveSearchEngine(refHost);
  if (se) {
    const medium = land?.pathname?.includes("/aclk") || land?.search?.includes("adurl=") ? "cpc" : "organic";
    if (se === "google_organic" && medium === "cpc") {
      return { category: "google_ads", detail: refHost, medium: "cpc" };
    }
    return { category: se, detail: refHost, medium: "organic" };
  }

  const social = resolveSocialFromHost(refHost);
  if (social) return { category: social, detail: refHost, medium: "social" };

  return { category: "referral", detail: refHost || "unknown", medium: "referral" };
}

export type ParsedMarketingParams = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  gclid: string;
  fbclid: string;
  ttclid: string;
};

export function parseMarketingParamsFromUrl(landingUrl: string): ParsedMarketingParams {
  const blank = {
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    gclid: "",
    fbclid: "",
    ttclid: "",
  };
  const u = parseLanding(landingUrl);
  if (!u) return blank;
  const q = u.searchParams;
  return {
    utmSource: (q.get("utm_source") || "").slice(0, 256),
    utmMedium: (q.get("utm_medium") || "").slice(0, 256),
    utmCampaign: (q.get("utm_campaign") || "").slice(0, 256),
    utmTerm: (q.get("utm_term") || "").slice(0, 256),
    utmContent: (q.get("utm_content") || "").slice(0, 512),
    gclid: (q.get("gclid") || "").slice(0, 256),
    fbclid: (q.get("fbclid") || "").slice(0, 256),
    ttclid: (q.get("ttclid") || "").slice(0, 256),
  };
}

/** @deprecated Prefer getTrafficSource — kept for incremental migration */
export function classifyTrafficSourceLegacy(referrerUrl: string | null | undefined): string {
  const r = getTrafficSource({
    documentReferrer: referrerUrl || "",
    landingUrl: "",
    siteHost: "",
  });
  if (r.category === "google_organic" || r.category === "google_ads") return "google";
  if (r.category === "referral") return "referral";
  if (
    r.category === "facebook" ||
    r.category === "instagram" ||
    r.category === "tiktok" ||
    r.category === "twitter" ||
    r.category === "linkedin" ||
    r.category === "reddit" ||
    r.category === "pinterest" ||
    r.category === "youtube"
  ) {
    return "social";
  }
  if (r.category === "bing_organic" || r.category === "other_search") return "search_other";
  if (r.category === "direct" || r.category === "internal") return "direct";
  return "referral";
}
