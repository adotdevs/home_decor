import { legacyEditorialArticles } from "@/data/legacy-editorial";
import { buildCatalogArticles } from "@/data/seed-articles/build-catalog";
import { toSlug } from "@/lib/utils/content";

const legacyPairs = new Set(
  legacyEditorialArticles.map((a) => `${a.categorySlug}|${a.subcategorySlug}`),
);

const catalogFiltered = buildCatalogArticles().filter(
  (a) => !legacyPairs.has(`${a.categorySlug}|${a.subcategorySlug}`),
);

const legacyWithMeta = legacyEditorialArticles.map((a, i) => ({
  ...a,
  publishedAt: new Date(Date.now() - (320 + i) * 86400000),
  popularityScore: 95 - i * 2,
  readingTime: Math.max(6, Math.ceil(a.contentBlocks.length * 1.2)),
}));

/** Full static fallback library: flagship editorials + one playbook per remaining subcategory. */
export const seedArticles = [...legacyWithMeta, ...catalogFiltered];

export function allSeedTags(): string[] {
  const s = new Set<string>();
  for (const a of seedArticles) {
    for (const t of a.tags || []) s.add(t);
  }
  return [...s].sort((a, b) => a.localeCompare(b));
}

export function articlesByTagSlug(tagSlug: string) {
  const normalized = tagSlug.replace(/-/g, " ").toLowerCase();
  return seedArticles.filter((a) =>
    (a.tags || []).some((t) => {
      const tl = t.toLowerCase();
      return tl === normalized || toSlug(t) === tagSlug || tl.includes(normalized);
    }),
  );
}

export function tagToPathSlug(tagLabel: string) {
  return toSlug(tagLabel);
}
