import { legacyEditorialArticles } from "@/data/legacy-editorial";
import { buildCatalogArticles } from "@/data/seed-articles/build-catalog";
import { topicClusterArticles } from "@/data/topic-cluster-articles";
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

/** Full static fallback library: flagship editorials + topical clusters + one playbook per remaining subcategory. */
export const seedArticles = [...legacyWithMeta, ...topicClusterArticles, ...catalogFiltered];

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

/** In-memory search when Mongo is empty or unreachable. */
export function searchSeedArticles(
  q: string,
  opts?: { limit?: number; skip?: number; categorySlug?: string; tagSlug?: string },
): typeof seedArticles {
  const limit = Math.min(Math.max(opts?.limit ?? 30, 1), 60);
  const skip = Math.max(opts?.skip ?? 0, 0);
  const raw = q.trim().toLowerCase();
  if (!raw) return [];

  const terms = raw.split(/\s+/).filter(Boolean);
  const cat = opts?.categorySlug?.toLowerCase();
  const tag = opts?.tagSlug?.replace(/-/g, " ").toLowerCase();

  const scored = seedArticles
    .map((a) => {
      const title = String(a.title || "").toLowerCase();
      const excerpt = String(a.excerpt || "").toLowerCase();
      const ttags = (a.tags || []).map((x) => x.toLowerCase());
      const cslug = String(a.categorySlug || "").toLowerCase();
      const sub = String(a.subcategorySlug || "").toLowerCase();

      if (cat && cslug !== cat) return { a, score: -1 };
      if (tag && !ttags.some((t) => t.includes(tag) || tag.includes(t))) return { a, score: -1 };

      let score = 0;
      for (const term of terms) {
        if (!term) continue;
        if (title.includes(term)) score += 12;
        if (ttags.some((t) => t.includes(term))) score += 8;
        if (excerpt.includes(term)) score += 5;
        if (cslug.includes(term) || sub.includes(term)) score += 4;
      }
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || (y.a.popularityScore || 0) - (x.a.popularityScore || 0));

  return scored.slice(skip, skip + limit).map((x) => x.a);
}

export function suggestSeedTitles(prefix: string, limit = 8): string[] {
  const p = prefix.trim().toLowerCase();
  if (p.length < 2) return [];
  const titles = new Set<string>();
  for (const a of seedArticles) {
    const t = String(a.title || "");
    if (t.toLowerCase().includes(p)) titles.add(t);
    for (const tag of a.tags || []) {
      if (tag.toLowerCase().startsWith(p)) titles.add(tag);
    }
    if (titles.size >= limit) break;
  }
  return [...titles].slice(0, limit);
}
