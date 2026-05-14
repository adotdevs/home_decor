import slugify from "slugify";
import readingTime from "reading-time";

export function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export function estimateReadingTime(text: string) {
  return Math.max(1, Math.ceil(readingTime(text).minutes));
}

type BlockLike = { type?: string; content?: string; alt?: string };

/** Concatenate article body text from structured blocks (paragraphs, headings, quotes, lists; image alt only). */
export function plainTextFromContentBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const parts: string[] = [];
  for (const raw of blocks) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as BlockLike;
    const t = String(row.type || "").toLowerCase();
    const c = typeof row.content === "string" ? row.content.trim() : "";
    if (t === "image") {
      const alt = typeof row.alt === "string" ? row.alt.trim() : "";
      if (alt) parts.push(alt);
      continue;
    }
    if (c) parts.push(c);
  }
  return parts.join("\n\n");
}

export function plainTextFromFaq(faq: unknown): string {
  if (!Array.isArray(faq)) return "";
  const parts: string[] = [];
  for (const raw of faq) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as { question?: string; answer?: string };
    const q = String(o.question ?? "").trim();
    const a = String(o.answer ?? "").trim();
    if (q) parts.push(q);
    if (a) parts.push(a);
  }
  return parts.join("\n\n");
}

/**
 * Minutes to read from real article content (blocks + FAQ), then title/excerpt, then stored readingTime.
 */
export function readingMinutesForArticle(parts: {
  contentBlocks?: unknown;
  faq?: unknown;
  excerpt?: string;
  title?: string;
  readingTime?: number;
}): number {
  const fromBlocks = plainTextFromContentBlocks(parts.contentBlocks);
  const fromFaq = plainTextFromFaq(parts.faq);
  const body = [fromBlocks, fromFaq].filter(Boolean).join("\n\n").trim();
  if (body.length > 0) {
    return estimateReadingTime(body);
  }
  const teaser = [parts.title, parts.excerpt].filter(Boolean).join("\n\n").trim();
  if (teaser.length > 0) {
    return estimateReadingTime(teaser);
  }
  if (typeof parts.readingTime === "number" && Number.isFinite(parts.readingTime) && parts.readingTime > 0) {
    return Math.max(1, Math.round(parts.readingTime));
  }
  return 1;
}