export function normalizeSearchQuery(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}
