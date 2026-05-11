/** Editorial “shop the look” picks — affiliate-ready labels + internal or external URLs. */
export const shopTheLook = [
  {
    title: "Quiet luxury living",
    caption: "Linen slipcovers, travertine side tables, and matte brass",
    href: "/category/decoration",
    image: "/images/heroes/editorial-living.jpg",
  },
  {
    title: "Mediterranean kitchen",
    caption: "Open shelving, zellige tile mood, and sculptural wood",
    href: "/category/kitchen-and-table",
    image: "/images/heroes/open-kitchen.jpg",
  },
  {
    title: "Bedroom calm",
    caption: "Layered neutrals, low walnut, and paper lighting",
    href: "/category/bedroom",
    image: "/images/heroes/luxe-bedroom.jpg",
  },
  {
    title: "Spa bath edit",
    caption: "Stone trays, folded textiles, and warm metals",
    href: "/category/bathroom",
    image: "/images/heroes/spa-bathroom.jpg",
  },
] as const;

/** Mood / style clusters → canonical topic hubs under /topics/[slug]. */
export const topicHubs = [
  {
    slug: "japandi-interiors",
    title: "Japandi interiors",
    dek: "Where Japanese restraint meets Scandinavian warmth — calm wood, paper light, and negative space that breathes.",
    query: "Japandi calm wood",
    faq: [
      {
        question: "What defines Japandi style?",
        answer:
          "A blend of Japanese minimalism and Scandinavian warmth: natural materials, muted palettes, functional furniture, and tactile textiles without clutter.",
      },
      {
        question: "How do I start without renovating?",
        answer:
          "Edit surfaces first — swap in linen, swap hardware to matte black or brass, introduce one sculptural wood piece, and keep walls softly tonal.",
      },
    ],
  },
  {
    slug: "neutral-bedrooms",
    title: "Neutral bedrooms",
    dek: "Layered creams and warm greys that feel expensive because they feel intentional — not because they’re beige by default.",
    query: "neutral bedroom layered",
    faq: [
      {
        question: "How do I keep neutrals from feeling flat?",
        answer:
          "Mix three tones, vary texture (matte paint vs. nubby wool vs. smooth metal), and add one deep accent like chocolate wood or olive in art.",
      },
    ],
  },
  {
    slug: "small-space-styling",
    title: "Small-space styling",
    dek: "Rental-friendly and apartment-smart layouts that still photograph like a magazine spread.",
    query: "small-space styling",
    faq: [
      {
        question: "What is the first small-space upgrade?",
        answer:
          "Lighting hierarchy — a floor lamp + table lamp + candle tray reads as 'designed' faster than any new sofa.",
      },
    ],
  },
  {
    slug: "ramadan-table-eid",
    title: "Ramadan & Eid table styling",
    dek: "Warm metallics, low candlelight, and family-scale tablescapes that feel ceremonial without looking like a party shop.",
    query: "table styling festive",
    faq: [
      {
        question: "How do I build a layered tablescape?",
        answer:
          "Start with a runner or cloth base, add height with fruit or florals at varied levels, tuck tea lights in safe glass, and keep serving pieces within arm’s reach.",
      },
    ],
  },
  {
    slug: "nursery-ideas",
    title: "Nursery ideas",
    dek: "Soft palettes, washable layers, and lighting that supports midnight feeds without harsh downlights.",
    query: "nursery kids room",
    faq: [
      {
        question: "What should I invest in first for a nursery?",
        answer:
          "A quality blackout solution, a comfortable glider, and dimmable warm lighting — everything else can evolve as your routine does.",
      },
    ],
  },
  {
    slug: "scandinavian-design",
    title: "Scandinavian design",
    dek: "Light woods, honest materials, and hygge through textiles rather than kitsch.",
    query: "Scandinavian light wood",
    faq: [
      {
        question: "Is Scandinavian only white walls?",
        answer:
          "No — contemporary Scandi often layers warm white with oat, sage, or pine tones; contrast comes from black window frames or lighting.",
      },
    ],
  },
] as const;

export type TopicHubSlug = (typeof topicHubs)[number]["slug"];

export function getTopicHub(slug: string) {
  return topicHubs.find((h) => h.slug === slug);
}
