import slugify from "slugify";
import readingTime from "reading-time";

export function toSlug(value: string) { return slugify(value, { lower: true, strict: true, trim: true }); }
export function estimateReadingTime(text: string) { return Math.max(1, Math.ceil(readingTime(text).minutes)); }