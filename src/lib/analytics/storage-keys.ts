/** Visitor persists across tabs (localStorage). */
export const ANALYTICS_VISITOR_KEY = "hd_analytics_vid";
export const ANALYTICS_VISITOR_COOKIE = "hd_analytics_vid";

/** Tab-scoped session (sessionStorage). */
export const ANALYTICS_SESSION_KEY = "hd_analytics_sid";
export const ANALYTICS_LAST_ENGAGED_AT_KEY = "hd_analytics_last_engaged_at";
/** Captured once per session: external document.referrer at first paint after session creation */
export const ANALYTICS_DOC_REF_KEY = "hd_analytics_doc_referrer";
/** JSON: { pathname, search } landing snapshot for attribution */
export const ANALYTICS_LANDING_KEY = "hd_analytics_landing";

export const CLIENT_GEO_CACHE_KEY = "hd_analytics_geo_v1";
