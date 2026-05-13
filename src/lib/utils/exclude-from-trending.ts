/**
 * Shared rules for “exclude from trending” — avoids JS pitfalls like Boolean("false") === true
 * and matches Mongo-friendly truthy forms.
 */
export function parseExcludeFromTrendingFlag(raw: unknown): boolean {
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const s = raw.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return false;
}

export function isArticleExcludedFromTrending(value: unknown): boolean {
  return parseExcludeFromTrendingFlag(value);
}
