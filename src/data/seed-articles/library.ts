/**
 * One-time / CLI seed payload: builds the full article set for MongoDB.
 * Do not import from Next.js routes, layouts, or services — only from `src/scripts/seed.ts`.
 */
import { legacyEditorialArticles } from "@/data/legacy-editorial";
import { buildCatalogArticles } from "@/data/seed-articles/build-catalog";
import { topicClusterArticles } from "@/data/topic-cluster-articles";

const legacyPairs = new Set(
  legacyEditorialArticles.map((a) => `${a.categorySlug}|${a.subcategorySlug}`),
);

const catalogFiltered = buildCatalogArticles().filter(
  (a) => !legacyPairs.has(`${a.categorySlug}|${a.subcategorySlug}`),
);

type SeedArticle =
  | (typeof legacyEditorialArticles)[number]
  | (typeof topicClusterArticles)[number]
  | ReturnType<typeof buildCatalogArticles>[number];

const editorialExpansion = [
  {
    type: "heading" as const,
    level: 2,
    content: "The design mood to aim for",
  },
  {
    type: "paragraph" as const,
    content:
      "A room with editorial polish is not perfect; it is resolved. The colors feel related, the lighting is layered, and every visible object has either a function, a texture, or a little emotional weight. Before shopping, decide what the space should feel like at the exact time of day you use it most. Morning rooms can take cleaner contrast. Evening rooms need warmth, lower light, and softer edges.",
  },
  {
    type: "heading" as const,
    level: 2,
    content: "A color palette that photographs beautifully",
  },
  {
    type: "paragraph" as const,
    content:
      "For a Pinterest-friendly look, build the palette in three quiet layers: a breathable base, a natural mid-tone, and one grounding accent. Think warm white with oat and walnut, stone with sage and brushed nickel, or plaster with camel and blackened bronze. The accent should appear at least twice so it feels intentional, but not so often that it becomes a theme.",
  },
  {
    type: "heading" as const,
    level: 3,
    content: "The palette test editors use",
  },
  {
    type: "list" as const,
    content:
      "Take one photo in morning light and one at night with lamps on\nRemove any color that only looks good in one of those photos\nRepeat the strongest accent in a small, medium, and tiny dose\nKeep bright seasonal color in textiles, flowers, or art so it can rotate",
  },
  {
    type: "heading" as const,
    level: 2,
    content: "Furniture and styling choices that feel expensive",
  },
  {
    type: "paragraph" as const,
    content:
      "Scale is the quiet signature of luxury interiors. A larger lamp, a fuller curtain, a deeper tray, or art hung at the correct height will often look more refined than several small accessories. If a surface feels busy, remove the smallest two items and replace them with one object that has height, texture, or negative space around it.",
  },
  {
    type: "quote" as const,
    content:
      "The rooms people save are rarely the most decorated rooms. They are the rooms where the eye knows exactly where to rest.",
  },
  {
    type: "heading" as const,
    level: 2,
    content: "How to make the idea work in a real home",
  },
  {
    type: "paragraph" as const,
    content:
      "The difference between inspiration and execution is maintenance. Choose fabrics that can be cleaned, finishes that forgive fingerprints, and storage that lives near the mess it solves. A beautiful basket in the wrong room is still visual clutter; a modest one placed exactly where life piles up can make the whole space feel calmer.",
  },
  {
    type: "heading" as const,
    level: 2,
    content: "Final styling note",
  },
  {
    type: "paragraph" as const,
    content:
      "Let the room evolve slowly. Add one layer, live with it for a week, then decide what the room is asking for next. The most authentic homes do not look installed in a day; they feel assembled with attention, memory, and small acts of care.",
  },
];

function enrichArticleContent<T extends SeedArticle>(article: T, i: number): T {
  const contentBlocks =
    article.contentBlocks.length >= 10 ? article.contentBlocks : [...article.contentBlocks, ...editorialExpansion];
  const baseFaq = article.faq || [];
  const articleMeta = article as T & {
    publishedAt?: Date;
    popularityScore?: number;
    readingTime?: number;
    internalLinks?: string[];
    status?: "published";
  };
  const faq = [
    ...baseFaq,
    {
      question: "How do I make this idea feel less generic?",
      answer:
        "Use the principle, not the exact product list. Keep the palette and composition logic, then add one piece that reflects your home: a family photograph, handmade ceramic, vintage textile, local craft, or object from travel.",
    },
    {
      question: "What is the most budget-friendly way to start?",
      answer:
        "Change the layer that affects the most surface area first: lighting temperature, curtains, bedding, towel color, table linens, or a single oversized piece of art. Small accessories should come after the room has a clear foundation.",
    },
    {
      question: "How can I make the look more Pinterest-ready?",
      answer:
        "Style in odd numbers, vary height, hide packaging, and photograph in indirect natural light or warm lamp light. Pinterest-friendly rooms usually have one obvious focal moment and enough empty space around it.",
    },
  ].slice(0, 6);

  return {
    ...article,
    status: "status" in article ? article.status : "published",
    contentBlocks,
    faq,
    internalLinks: Array.from(
      new Set([
        ...(articleMeta.internalLinks || []),
        `/category/${article.categorySlug}`,
        article.subcategorySlug ? `/category/${article.categorySlug}/${article.subcategorySlug}` : "",
        "/inspiration/feed",
        "/inspiration-gallery",
        "/newsletter",
      ].filter(Boolean)),
    ),
    publishedAt: articleMeta.publishedAt ?? new Date(Date.now() - (320 + i) * 86400000),
    popularityScore: articleMeta.popularityScore ?? 95 - i * 2,
    readingTime: Math.max(8, Math.ceil(JSON.stringify(contentBlocks).split(/\s+/).length / 180)),
  };
}

const legacyWithMeta = legacyEditorialArticles.map((a, i) =>
  enrichArticleContent(
    {
      ...a,
      publishedAt: new Date(Date.now() - (320 + i) * 86400000),
      popularityScore: 95 - i * 2,
    },
    i,
  ),
);

/** Flagship editorials + topical clusters + one playbook per remaining subcategory — for Mongo seed only. */
export function buildSeedArticlesForDatabase(): SeedArticle[] {
  return [
    ...legacyWithMeta,
    ...topicClusterArticles.map((a, i) => enrichArticleContent(a, i + legacyWithMeta.length)),
    ...catalogFiltered.map((a, i) =>
      enrichArticleContent(a, i + legacyWithMeta.length + topicClusterArticles.length),
    ),
  ];
}
