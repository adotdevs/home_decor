import { images } from "@/config/images";
import { evergreenTags, categoryTree } from "@/config/site";

type Block = {
  type: "paragraph" | "heading" | "image" | "quote" | "list";
  content: string;
  level?: number;
  alt?: string;
};

export type CatalogArticle = {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  categorySlug: string;
  subcategorySlug: string;
  tags: string[];
  status: "published";
  authorName: string;
  authorSlug: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  contentBlocks: Block[];
  faq: { question: string; answer: string }[];
  internalLinks: string[];
  publishedAt: Date;
  popularityScore: number;
  readingTime?: number;
};

const AUTHORS = [
  { name: "Clara Whitmore", slug: "clara-whitmore" },
  { name: "Julian Okonkwo", slug: "julian-okonkwo" },
  { name: "Maren Okada", slug: "maren-okada" },
  { name: "Sofia Reyes", slug: "sofia-reyes" },
  { name: "Elena Marchetti", slug: "elena-marchetti" },
] as const;

function categoryFeaturedImage(categorySlug: string): string {
  const map: Record<string, string> = {
    bedroom: images.categories.bedroom,
    bathroom: images.categories.bathroom,
    "kitchen-and-table": images.categories.kitchen,
    decoration: images.categories.decoration,
    "wall-decor": images.categories.wallDecor,
    "kids-ideas": images.categories.kids,
  };
  return map[categorySlug] ?? images.heroes.editorialLiving;
}

function inlineImageForCategory(categorySlug: string): string {
  const pool = [
    "/images/articles/bedding-texture.jpg",
    "/images/articles/coffee-station.jpg",
    "/images/articles/tablescape.jpg",
    "/images/articles/plants-shelf.jpg",
    "/images/articles/candles-mood.jpg",
    "/images/articles/linen-curtains.jpg",
    "/images/articles/throw-blanket.jpg",
  ];
  let h = 0;
  for (let i = 0; i < categorySlug.length; i++) h += categorySlug.charCodeAt(i);
  return pool[h % pool.length];
}

function prettyLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function hashSlug(s: string): number {
  return s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function pickTags(categoryName: string, subSlug: string, idx: number): string[] {
  const h = hashSlug(subSlug + categoryName);
  const season = ["spring refresh", "summer light", "autumn warmth", "winter cozy"][h % 4];
  const e1 = evergreenTags[(h + idx) % evergreenTags.length];
  const e2 = evergreenTags[(h + idx + 3) % evergreenTags.length];
  const local = `${categoryName.toLowerCase()} ideas`;
  return Array.from(new Set([season, e1, e2, local, prettyLabel(subSlug).toLowerCase()])).slice(0, 6);
}

function buildLongForm(catName: string, catSlug: string, subSlug: string): Block[] {
  const subPretty = prettyLabel(subSlug);
  const inset = inlineImageForCategory(catSlug);
  return [
    {
      type: "paragraph",
      content: `There is a moment in almost every consult where someone says, “I want this room to feel finished.” Usually the answer is not another trend cycle — it is depth. ${subPretty} is where that depth quietly shows up: in how layers meet, how materials age, and how you edit what stays in view.`,
    },
    {
      type: "paragraph",
      content: `This guide is written like a styling session. You will get a clear plan, a few non-negotiables, and the kind of realistic compromises that make a ${catName.toLowerCase()} livable, not just photogenic.`,
    },
    { type: "heading", level: 2, content: `Start with a palette you will not fight` },
    {
      type: "paragraph",
      content: `Choose a quiet base that can go warm or cool as seasons change. In ${subPretty.toLowerCase()}, that base might show up as brushed cotton, matte ceramic, or pale wood — materials that absorb light instead of reflecting it harshly.`,
    },
    { type: "heading", level: 2, content: "Build one focal moment, not ten" },
    {
      type: "paragraph",
      content:
        "When every corner competes, the eye gets tired. Pick a single focal moment — a headboard wall, a tablescape story, a mirror bounce — and let the rest support it. Supporting layers should vary in height and texture so the room still feels styled.",
    },
    {
      type: "image",
      content: inset,
      alt: `${subPretty} styling inspiration — layered neutrals and natural texture in a modern home`,
    },
    { type: "heading", level: 2, content: "Shopping like an editor" },
    {
      type: "list",
      content:
        "Keep dimensions on your phone before you browse\nInvest in the two items you touch daily first\nChoose one imperfect object: patina reads more luxurious than novelty\nAvoid matchy sets; buy tonal cousins instead",
    },
    {
      type: "quote",
      content:
        "The most expensive-looking rooms usually whisper. They do not announce every new season in one glance.",
    },
    { type: "heading", level: 2, content: "Maintenance is part of the aesthetic" },
    {
      type: "paragraph",
      content: `A room cannot stay “quiet luxury” if every surface is dust-prone or every textile is dry-clean only. Plan three minutes nightly: straighten the hero layer, fluff the throw, wipe the ledge you always touch. Small rituals keep the mood intact without heavy cleaning days.`,
    },
    { type: "heading", level: 2, content: "Where to go next in your home" },
    {
      type: "paragraph",
      content: `If you are refreshing ${subPretty.toLowerCase()}, consider pairing it with a lighting tweak in the same week — tone shifts read bigger when light does not fight them. Use our internal guides to echo color without repeating shapes.`,
    },
  ];
}

function buildFaq(subPretty: string): { question: string; answer: string }[] {
  return [
    {
      question: `What is the quickest upgrade for ${subPretty.toLowerCase()} without replacing furniture?`,
      answer:
        "Swap textiles first: two new pillow inserts, a throw with better drape, and one upgraded tray or bowl for corralling small items.",
    },
    {
      question: "How do I keep decor from feeling cluttered as I add layers?",
      answer:
        "Use containment: trays, shallow bowls, or one bookshelf moment per wall. If it does not fit the container rule, it waits a month.",
    },
    {
      question: "What mistakes do people make on tight budgets?",
      answer:
        "They buy many small trend pieces instead of one solid foundation piece. Prioritize what you touch, sit on, or see first when you walk in.",
    },
  ];
}

/** One long-form editorial per subcategory — pairs with full taxonomy for a complete library. */
export function buildCatalogArticles(): CatalogArticle[] {
  const out: CatalogArticle[] = [];
  let idx = 0;
  const dayMs = 86400000;
  const base = Date.now() - 200 * dayMs;

  for (const cat of categoryTree) {
    for (const sub of cat.subcategories) {
      const author = AUTHORS[idx % AUTHORS.length];
      const subPretty = prettyLabel(sub);
      const slug = `${sub}-best-ideas-and-styling-playbook`;
      const title = `${subPretty} Ideas That Feel Editorial — Not Trendy`;
      const excerpt = `The luxe way to plan ${subPretty.toLowerCase()} in your ${cat.name.toLowerCase()}: palettes, focal points, and shopping decisions that last.`;
      const focus = `${subPretty.toLowerCase()} decor ideas`;
      const featured = categoryFeaturedImage(cat.slug);
      const tags = pickTags(cat.name, sub, idx);
      const popularityScore = 18 + (hashSlug(slug) % 82);
      const publishedAt = new Date(base + idx * (dayMs * 1.4));

      out.push({
        title,
        slug,
        excerpt,
        featuredImage: featured,
        categorySlug: cat.slug,
        subcategorySlug: sub,
        tags,
        status: "published",
        authorName: author.name,
        authorSlug: author.slug,
        seoTitle: `${subPretty} Decor Ideas | Luxe Home Decor Ideas`,
        seoDescription: excerpt,
        focusKeyword: focus,
        contentBlocks: buildLongForm(cat.name, cat.slug, sub),
        faq: buildFaq(subPretty),
        internalLinks: [
          `/category/${cat.slug}`,
          `/category/${cat.slug}/${sub}`,
          `/inspiration/feed`,
          `/latest`,
        ],
        publishedAt,
        popularityScore,
      });
      idx++;
    }
  }
  return out;
}
