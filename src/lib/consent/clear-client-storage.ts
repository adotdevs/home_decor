import {
  ANALYTICS_DOC_REF_KEY,
  ANALYTICS_LANDING_KEY,
  ANALYTICS_LAST_ENGAGED_AT_KEY,
  ANALYTICS_SESSION_KEY,
  ANALYTICS_VISITOR_COOKIE,
  ANALYTICS_VISITOR_KEY,
  CLIENT_GEO_CACHE_KEY,
} from "@/lib/analytics/storage-keys";

/** Clears first-party analytics identifiers when the user declines non-essential cookies. */
export function clearNonEssentialClientStorage(): void {
  try {
    localStorage.removeItem(ANALYTICS_VISITOR_KEY);
    localStorage.removeItem(CLIENT_GEO_CACHE_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(ANALYTICS_SESSION_KEY);
    sessionStorage.removeItem(ANALYTICS_LAST_ENGAGED_AT_KEY);
    sessionStorage.removeItem(ANALYTICS_DOC_REF_KEY);
    sessionStorage.removeItem(ANALYTICS_LANDING_KEY);
  } catch {
    /* ignore */
  }
  try {
    if (typeof document === "undefined") return;
    const secure = globalThis.location?.protocol === "https:";
    document.cookie = `${ANALYTICS_VISITOR_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`;
  } catch {
    /* ignore */
  }
}
