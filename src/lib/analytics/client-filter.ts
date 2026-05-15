/**
 * Client-side guard: production analytics only, no localhost / dev noise / automation.
 */

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|telegrambot|lighthouse|pagespeed|chrome-lighthouse|google page speed|gtmetrix|uptimerobot|pingdom|statuscake|newrelic|synthetics|prerender|headlesschrome|phantomjs|scrapy|python-requests|^curl\/|wget|^java\//i;

export function isLikelyBotClient(): boolean {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  if (!ua || ua.length < 10) return true;
  return BOT_UA.test(ua);
}

/**
 * Skip recording when true. Override with NEXT_PUBLIC_ANALYTICS_DEBUG=true.
 */
export function shouldSkipClientAnalytics(): boolean {
  if (typeof window === "undefined") return true;
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") return false;
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "true") return true;
  if (process.env.NODE_ENV === "development") return true;
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return true;
  if (isLikelyBotClient()) return true;
  return false;
}
