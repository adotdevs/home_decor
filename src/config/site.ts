/** Site name, description, seasons, and OG defaults: edit in Admin → Site & seasons (Mongo). Fallbacks in `config/site-defaults.ts`. */

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
  { name: "Kitchen & Table", slug: "kitchen-and-table", subcategories: ["kitchen-accessories", "crockery-and-cutlery", "glassware", "mugs", "trays-and-trolleys", "placemats", "table-runners", "table-accessories"] },
  { name: "Decoration", slug: "decoration", subcategories: ["lamps", "vases", "pots-and-planters", "baskets-and-boxes", "photo-frames", "bookends", "sculpture-decor", "scented-candles", "lanterns-and-candles"] },
  { name: "Wall Decor", slug: "wall-decor", subcategories: ["wall-canvas-art", "mosaic-wall-art"] },
  { name: "Kids Ideas", slug: "kids-ideas", subcategories: ["bedroom", "bed-sheets", "lamps", "fun-and-play", "accessories"] },
] as const;
