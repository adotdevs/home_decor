/** Targeted cluster stories for topical hubs — merged in `seed-articles/library` (seed script only). */
export const topicClusterArticles = [
  {
    title: "Ramadan tables that glow: candle math, metal warmth, and family-scale serving",
    slug: "ramadan-table-glow-editorial",
    excerpt:
      "If you only remember one thing: light should come from the table plane, not the ceiling. Here’s how we build depth for suhoor calm and iftar cheer.",
    featuredImage: "/images/heroes/dining-table.jpg",
    categorySlug: "kitchen-and-table",
    subcategorySlug: "table-runners",
    tags: ["Ramadan decor", "table styling", "mood lighting", "festive tables"],
    contentBlocks: [
      { type: "heading" as const, content: "Start with the runner, not the centerpiece", level: 2 },
      {
        type: "paragraph" as const,
        content:
          "A runner or tablecloth gives you a field to arrange everything else. We prefer something washable and slightly textured so glassware does not skate, and candle drips do not become a crisis.",
      },
      {
        type: "paragraph" as const,
        content:
          "If you are short on width, run two parallel runners with a low bowl or bread board between — it reads intentional and buys you space for dates, water, and small plates.",
      },
      { type: "heading" as const, content: "Height in threes, never in a straight highway", level: 2 },
      {
        type: "paragraph" as const,
        content:
          "Think triangle composition: one tall moment (thin branches or a fruit stack), one mid (candles in varied holders), one low (a linen napkin stack). The eye travels instead of slamming into a single tall vase.",
      },
    ],
    faq: [
      {
        question: "How many candles are too many?",
        answer:
          "More than three identical heights in a row reads like a boutique window. Vary holder materials (glass, brass, ceramic) and keep flame paths clear from low branches.",
      },
    ],
    internalLinks: ["/category/kitchen-and-table", "/inspiration/feed"],
    authorName: "Sofia El-Amin",
    authorSlug: "sofia-el-amin",
    publishedAt: new Date(Date.now() - 400 * 86400000),
    popularityScore: 93,
    readingTime: 11,
  },
  {
    title: "Japandi in real homes: the five mistakes we undo on every consult",
    slug: "japandi-mistakes-real-homes",
    excerpt:
      "The mood is not ‘buy beige’ — it is tension between rough and smooth, warm and cool, empty and held. These are the patterns we fix first.",
    featuredImage: "/images/categories/decor-vignette.jpg",
    categorySlug: "decoration",
    subcategorySlug: "decor-accessories",
    tags: ["Japandi interiors", "organic modern", "quiet luxury", "layered neutrals"],
    contentBlocks: [
      { type: "heading" as const, content: "Mistake 1: one wood tone everywhere", level: 2 },
      {
        type: "paragraph" as const,
        content:
          "Japandi needs grain contrast. Pair pale oak with something ashier or a single walnut moment — otherwise the room feels like a showroom vignette instead of a collected home.",
      },
      { type: "heading" as const, content: "Mistake 2: skipping the shadow line", level: 2 },
      {
        type: "paragraph" as const,
        content:
          "Negative space is not emptiness — it is a place for shadow. Leave breathing room between objects: a shelf with forty percent open space reads far more expensive than one packed tight.",
      },
    ],
    faq: [
      {
        question: "Can Japandi include steel or black?",
        answer:
          "Yes — in thin profiles. Think pencil-thin frames and hardware, not chunky industrial legs. Black works best as punctuation.",
      },
    ],
    internalLinks: ["/category/decoration", "/latest"],
    authorName: "Maren Okada",
    authorSlug: "maren-okada",
    publishedAt: new Date(Date.now() - 401 * 86400000),
    popularityScore: 91,
    readingTime: 10,
  },
];
