/** Local image paths (files under /public/images). Attribution: photos sourced via scripts/download-unsplash-images.mjs — Unsplash License. */
export const images = {
  heroes: {
    editorialLiving: "/images/heroes/editorial-living.jpg",
    luxeBedroom: "/images/heroes/luxe-bedroom.jpg",
    openKitchen: "/images/heroes/open-kitchen.jpg",
    spaBathroom: "/images/heroes/spa-bathroom.jpg",
    diningTable: "/images/heroes/dining-table.jpg",
  },
  categories: {
    bedroom: "/images/categories/bedroom-living.jpg",
    bathroom: "/images/categories/bathroom-detail.jpg",
    kitchen: "/images/categories/kitchen-light.jpg",
    decoration: "/images/categories/decor-vignette.jpg",
    wallDecor: "/images/categories/wall-art-room.jpg",
    kids: "/images/categories/kids-color.jpg",
  },
  seasonal: {
    spring: "/images/seasonal/spring-light.jpg",
    summer: "/images/seasonal/summer-terrace.jpg",
    autumn: "/images/seasonal/autumn-warm.jpg",
    winter: "/images/seasonal/winter-cozy.jpg",
  },
  gallery: (i: number) => `/images/gallery/masonry-${String(i).padStart(2, "0")}.jpg`,
} as const;

/** Category index / homepage cards — matches `categoryTree` slugs. */
export function categoryHeroImage(categorySlug: string): string {
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

export function seasonalHeroImage(key: "spring" | "summer" | "autumn" | "winter"): string {
  return images.seasonal[key];
}

export const ogDefault = "/images/heroes/editorial-living.jpg";
