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

const angleByCategory: Record<string, string> = {
  bedroom: "the private, end-of-day room where softness has to earn its place",
  bathroom: "the reset room where practical routines can still feel spa-like",
  "kitchen-and-table": "the gathering zone where utility, appetite, and atmosphere overlap",
  decoration: "the layer that gives a room memory, character, and emotional temperature",
  "wall-decor": "the vertical story that changes how tall, calm, or collected a room feels",
  "kids-ideas": "the family space where play, storage, and personality need to coexist",
};

function paletteForCategory(catSlug: string): string {
  const palettes: Record<string, string> = {
    bedroom: "warm ivory, oat linen, mushroom, antique brass, and one grounding note such as espresso, slate, or faded olive",
    bathroom: "stone white, warm grey, mist blue, brushed nickel, and a small accent of cedar, sage, or smoked glass",
    "kitchen-and-table": "creamware, walnut, old silver, olive green, clear glass, and a quiet hit of black for definition",
    decoration: "plaster, camel, tobacco, bone, aged terracotta, and one richer shade like oxblood, ink, or moss",
    "wall-decor": "chalk white, pale oak, charcoal, linen, sepia, and an aged-gold frame or a matte black edge",
    "kids-ideas": "buttermilk, clay, denim, fern, warm wood, and one joyful color that can change as your child grows",
  };
  return palettes[catSlug] ?? "warm white, pale wood, soft black, stone, and one seasonal accent";
}

function furnitureAdvice(catSlug: string, subPretty: string): string {
  const advice: Record<string, string> = {
    bedroom:
      "Keep the bed visually generous, then let everything else support sleep: a nightstand with storage, a rug that reaches beyond the mattress, and lighting low enough to make evening feel deliberate.",
    bathroom:
      "Treat hard surfaces like furniture. A tray becomes the countertop table, a stool becomes the styling perch, and a towel ladder adds height without stealing floor space.",
    "kitchen-and-table":
      "Let the working pieces be the beautiful pieces: a wooden board left upright, a ceramic crock of tools, glassware arranged by height, and one low lamp or candle moment if the room allows it.",
    decoration:
      "Anchor decorative objects to real furniture lines. A sculptural vase belongs where a console, shelf, or side table can visually hold it; otherwise it floats and starts to feel like clutter.",
    "wall-decor":
      "Measure from the furniture first, not the ceiling. Art should relate to the sofa, console, bed, or bench beneath it, with enough negative space to make the wall feel intentional.",
    "kids-ideas":
      "Buy the long-life furniture in simple shapes, then let personality arrive through washable layers, art rails, hooks, baskets, bedding, and playful lighting.",
  };
  return advice[catSlug] ?? `Let ${subPretty.toLowerCase()} support the room's main function before it tries to decorate it.`;
}

function buildLongForm(catName: string, catSlug: string, subSlug: string, variant = 0): Block[] {
  const subPretty = prettyLabel(subSlug);
  const inset = inlineImageForCategory(catSlug);
  const palette = paletteForCategory(catSlug);
  const furniture = furnitureAdvice(catSlug, subPretty);
  const categoryAngle = angleByCategory[catSlug] ?? "the part of the home where taste becomes a daily ritual";
  return [
    {
      type: "paragraph",
      content: `There is a moment in almost every styling consultation when a client says, “I want this room to feel finished, but not overdone.” That sentence is exactly where ${subPretty.toLowerCase()} starts to matter. In ${catName.toLowerCase()}, ${categoryAngle}, the best ideas are rarely the loudest ones. They are the choices that make everyday living feel more considered: the textile that falls better, the tray that gives small objects a home, the art that finally makes a wall feel resolved.`,
    },
    {
      type: "paragraph",
      content:
        variant === 0
          ? "This guide is written like an editor walking through the room with you: what to keep, what to edit, what to buy slowly, and where a small styling change can create the biggest emotional shift. The goal is a room that photographs beautifully, yes, but more importantly, a room that feels generous when you actually live in it."
          : "Think of this as a Pinterest board translated into real-life decisions. Instead of vague inspiration, you will find specific palette guidance, proportion rules, furniture notes, and small rituals that keep the room feeling elevated after the photo moment has passed.",
    },
    { type: "heading", level: 2, content: `Start with a palette you will not fight` },
    {
      type: "paragraph",
      content: `Choose a quiet base that can move through seasons without demanding a full redesign. For ${subPretty.toLowerCase()}, a reliable palette might include ${palette}. Notice that none of these tones need to shout. They create a low, warm hum under the room, which makes every small decorative choice feel more expensive than it is.`,
    },
    {
      type: "paragraph",
      content:
        "The most common mistake is choosing a color scheme that only works in one type of light. Before buying, look at your palette in morning shade, late afternoon warmth, and evening lamplight. If it still feels calm in all three, it will serve the room longer.",
    },
    { type: "heading", level: 2, content: "Build one focal moment, not ten" },
    {
      type: "paragraph",
      content:
        "When every corner competes, the eye gets tired. Pick a single focal moment — a headboard wall, a tablescape story, a mirror bounce — and let the rest support it. Supporting layers should vary in height and texture so the room still feels styled.",
    },
    {
      type: "paragraph",
      content: `For ${subPretty.toLowerCase()}, the focal moment might be a layered bed, a stone tray, a framed art pairing, a softly lit shelf, or a table set low enough for conversation. What matters is that the moment has a clear edge: you should know where the composition begins and ends.`,
    },
    {
      type: "image",
      content: inset,
      alt: `${subPretty} styling inspiration — layered neutrals and natural texture in a modern home`,
    },
    { type: "heading", level: 2, content: "Texture is what makes the room feel editorial" },
    {
      type: "paragraph",
      content:
        "Pinterest saves often look expensive because they layer textures, not because every item is costly. Put matte against sheen, rough against smooth, crisp against relaxed. Linen beside glazed ceramic, woven cane beside lacquer, velvet beside limewash: these contrasts create the kind of quiet richness that reads immediately in photos and slowly in real life.",
    },
    { type: "heading", level: 3, content: "The three-texture rule" },
    {
      type: "list",
      content:
        "One soft layer that invites touch: linen, boucle, cotton, velvet, or wool\nOne hard layer with weight: stone, ceramic, wood, metal, glass, or plaster\nOne irregular layer that feels collected: vintage frames, handmade bowls, woven baskets, aged brass, or a sculptural branch",
    },
    { type: "heading", level: 2, content: "Furniture and layout decisions that make it work" },
    {
      type: "paragraph",
      content: furniture,
    },
    {
      type: "paragraph",
      content:
        "Before you add decorative detail, walk the room the way you use it. Can doors open fully? Can you put a cup down without moving a stack of books? Can a child, guest, or tired version of you understand where things belong? Luxury is not fragility; it is ease.",
    },
    { type: "heading", level: 2, content: "Shopping like an editor" },
    {
      type: "list",
      content:
        "Keep dimensions on your phone before you browse, especially width, depth, and clearance\nInvest first in the two items you touch daily, not the pieces that only appear in photos\nChoose one imperfect object: patina reads more luxurious than novelty\nAvoid matchy sets; buy tonal cousins instead, so the room feels collected\nAsk whether each new piece adds function, softness, height, light, or memory",
    },
    {
      type: "quote",
      content:
        "The most expensive-looking rooms usually whisper. They do not announce every new season in one glance.",
    },
    { type: "heading", level: 2, content: "A realistic styling formula you can copy" },
    {
      type: "paragraph",
      content: `If you want a simple starting point for ${subPretty.toLowerCase()}, use this formula: one grounding piece, two useful layers, one object with history, and one quiet negative space. The grounding piece creates visual weight. The useful layers make the room function. The object with history keeps it from feeling like a showroom. The negative space gives everything enough room to breathe.`,
    },
    {
      type: "list",
      content:
        "Grounding piece: rug, large tray, framed artwork, substantial lamp, or upholstered headboard\nUseful layers: towel stack, storage basket, table runner, shelf box, bedside bowl, or washable cushion\nObject with history: vintage book, handmade ceramic, inherited frame, market basket, or travel piece\nNegative space: a clear corner of counter, an unfilled shelf bay, a bare strip of wall, or breathing room around a vignette",
    },
    { type: "heading", level: 2, content: "Maintenance is part of the aesthetic" },
    {
      type: "paragraph",
      content: `A room cannot stay “quiet luxury” if every surface is dust-prone or every textile is dry-clean only. Plan three minutes nightly: straighten the hero layer, fluff the throw, wipe the ledge you always touch. Small rituals keep the mood intact without heavy cleaning days.`,
    },
    {
      type: "paragraph",
      content:
        "This is where real homes differ from styled shoots. You need materials that forgive fingerprints, baskets that actually hold the overflow, lighting that flatters at 10 p.m., and finishes that still look intentional when the room is being used. A beautiful home is not a static image; it is a system that resets quickly.",
    },
    { type: "heading", level: 2, content: "Where to go next in your home" },
    {
      type: "paragraph",
      content: `If you are refreshing ${subPretty.toLowerCase()}, consider pairing it with a lighting tweak in the same week — tone shifts read bigger when light does not fight them. Use our internal guides to echo color without repeating shapes.`,
    },
    { type: "heading", level: 2, content: "Final thought" },
    {
      type: "paragraph",
      content: `The best ${subPretty.toLowerCase()} ideas do not make your ${catName.toLowerCase()} look like someone else's Pinterest board. They make your own daily rituals feel more intentional. Start with the palette, edit one focal moment, improve the light, and let the room earn its layers slowly.`,
    },
  ];
}

function buildFaq(subPretty: string, catName: string): { question: string; answer: string }[] {
  return [
    {
      question: `What is the quickest upgrade for ${subPretty.toLowerCase()} without replacing furniture?`,
      answer:
        `Start with the layer you touch or see first. In ${catName.toLowerCase()}, that is often textiles, lighting, or one organising tray. A better pillow insert, a warmer bulb, or a larger bowl for daily objects can shift the whole room before you buy major furniture.`,
    },
    {
      question: "How do I keep decor from feeling cluttered as I add layers?",
      answer:
        "Use containment and breathing room together. Trays, shallow bowls, baskets, and shelves tell the eye where a collection begins and ends. Then leave at least one visible empty surface so the room still feels edited.",
    },
    {
      question: "What mistakes do people make on tight budgets?",
      answer:
        "They buy many small trend pieces instead of one strong foundation piece. Prioritize what you touch, sit on, or see first when you walk in. One substantial lamp or rug usually looks more luxurious than five small novelty objects.",
    },
    {
      question: "How can I make the room feel more Pinterest-worthy without copying a trend exactly?",
      answer:
        "Copy the structure, not the exact products. Notice the palette, the height variation, the amount of negative space, and the lighting direction. Then recreate those principles with pieces that make sense for your home.",
    },
    {
      question: "What should I avoid if I want a luxury magazine look?",
      answer:
        "Avoid perfect matching sets, harsh overhead-only lighting, tiny decor scattered across every surface, and art hung too high. Luxury interiors usually look calm because the scale is confident and the editing is disciplined.",
    },
  ];
}

/** Two long-form editorials per subcategory — pairs with full taxonomy for a complete library. */
export function buildCatalogArticles(): CatalogArticle[] {
  const out: CatalogArticle[] = [];
  let idx = 0;
  const dayMs = 86400000;
  const base = Date.now() - 45 * dayMs;

  for (const cat of categoryTree) {
    for (const sub of cat.subcategories) {
      const subPretty = prettyLabel(sub);
      const variants = [
        {
          slug: `${sub}-designer-styling-ideas`,
          title: `${subPretty} Ideas Designers Use to Make ${cat.name} Feel Collected`,
          excerpt: `A luxury editorial guide to planning ${subPretty.toLowerCase()} with palette discipline, texture, scale, and practical styling rules that make your ${cat.name.toLowerCase()} feel finished.`,
          focus: `${subPretty.toLowerCase()} ideas`,
        },
        {
          slug: `${sub}-pinterest-inspired-decor-guide`,
          title: `Pinterest-Inspired ${subPretty} Styling for a More Expensive-Looking ${cat.name}`,
          excerpt: `How to translate save-worthy ${subPretty.toLowerCase()} inspiration into a real home: refined color palettes, furniture choices, lighting notes, and simple styling formulas.`,
          focus: `Pinterest ${subPretty.toLowerCase()} decor`,
        },
      ];

      variants.forEach((variant, variantIdx) => {
        const author = AUTHORS[idx % AUTHORS.length];
        const featured = categoryFeaturedImage(cat.slug);
        const tags = pickTags(cat.name, sub, idx);
        const popularityScore = 18 + (hashSlug(variant.slug) % 82);
        const publishedAt = new Date(base + idx * (dayMs * 0.42));

        out.push({
          title: variant.title,
          slug: variant.slug,
          excerpt: variant.excerpt,
          featuredImage: featured,
          categorySlug: cat.slug,
          subcategorySlug: sub,
          tags,
          status: "published",
          authorName: author.name,
          authorSlug: author.slug,
          seoTitle: `${subPretty} Decor Ideas | ${cat.name} Styling Guide`,
          seoDescription: variant.excerpt,
          focusKeyword: variant.focus,
          contentBlocks: buildLongForm(cat.name, cat.slug, sub, variantIdx),
          faq: buildFaq(subPretty, cat.name),
          internalLinks: [
            `/category/${cat.slug}`,
            `/category/${cat.slug}/${sub}`,
            `/inspiration/feed`,
            `/inspiration-gallery`,
            `/trending`,
          ],
          publishedAt,
          popularityScore,
        });
        idx++;
      });
    }
  }
  return out;
}
