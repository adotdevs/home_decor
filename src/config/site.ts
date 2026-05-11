import { ogDefault } from "@/config/images";

export const siteConfig = {
  name: "Luxe Home Decor Ideas",
  description:
    "Premium Pinterest-style home decor inspiration: editorial guides, room ideas, and styling playbooks for bedrooms, kitchens, baths, and every surface in between.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
  ogImage: ogDefault,
};

export const seasonalInspiration = [
  {
    slug: "spring-refresh",
    name: "Spring refresh",
    description: "Lighter layers, botanical moments, and soft palettes that wake the house gently.",
    imageKey: "spring" as const,
  },
  {
    slug: "summer-light",
    name: "Summer light",
    description: "Breezy textiles, sun-washed neutrals, and tables ready for long evenings.",
    imageKey: "summer" as const,
  },
  {
    slug: "autumn-warmth",
    name: "Autumn warmth",
    description: "Deeper tones, candlelit corners, and plush textures that invite slowing down.",
    imageKey: "autumn" as const,
  },
  {
    slug: "winter-coziness",
    name: "Winter coziness",
    description: "Layered throws, mood lighting, and spaces built for gathering.",
    imageKey: "winter" as const,
  },
] as const;

export const evergreenTags = [
  "layered neutrals",
  "small-space styling",
  "rental-friendly",
  "luxury on a budget",
  "kid-proof design",
  "open-concept",
  "mood lighting",
  "textile mixing",
  "European quiet luxury",
  "California casual",
  "coastal calm",
  "organic modern",
  "heritage details",
  "sustainable swaps",
  "Pinterest-worthy",
] as const;

export const categoryTree = [
  { name: "Bedroom", slug: "bedroom", subcategories: ["duvet-covers", "bedding-sheets", "throws-and-protectors", "kids-bedding", "cushions", "curtains", "floor-mats-and-rugs"] },
  { name: "Bathroom", slug: "bathroom", subcategories: ["bathroom-accessories", "bath-mats", "towels", "baskets", "shower-curtains"] },
  { name: "Kitchen & Table", slug: "kitchen-and-table", subcategories: ["kitchen-accessories", "crockery-and-cutlery", "glassware", "trays-and-trolleys", "placemats", "coffee-tables", "table-clocks", "table-accessories", "shelves-and-storages", "tissue-boxes", "mugs", "ash-trays-and-lighters", "fridge-magnets-and-bag-tags", "table-runners"] },
  { name: "Decoration", slug: "decoration", subcategories: ["lamps", "baskets-and-boxes", "decorative-book-storages", "exclusive-decor", "decor-accessories", "sculpture-decor", "retro-decor-accessories", "bookends", "scented-candles", "lanterns-and-candles", "pots-and-planters", "photo-frames", "vases", "gift-ideas"] },
  { name: "Wall Decor", slug: "wall-decor", subcategories: ["wall-canvas-art", "mosaic-wall-art"] },
  { name: "Kids Ideas", slug: "kids-ideas", subcategories: ["bedroom", "bed-sheets", "lamps", "fun-and-play", "accessories"] },
] as const;