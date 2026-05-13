import { ogDefault } from "@/config/images";

/** Fallbacks when DB has no row or fields are empty */
export const DEFAULT_SITE_NAME = "CoreFusion";
export const DEFAULT_SITE_DESCRIPTION =
  "Premium Pinterest-style home decor inspiration: editorial guides, room ideas, and styling playbooks for bedrooms, kitchens, baths, and every surface in between.";

export const DEFAULT_OG_IMAGE = ogDefault;

export function getEnvPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
}

export const SEASONAL_IMAGE_KEYS = ["spring", "summer", "autumn", "winter"] as const;
export type SeasonalImageKey = (typeof SEASONAL_IMAGE_KEYS)[number];

export type DefaultSeasonalItem = {
  slug: string;
  name: string;
  description: string;
  imageKey: SeasonalImageKey;
  articlesTagPath?: string;
};

export const DEFAULT_SEASONAL_ITEMS: DefaultSeasonalItem[] = [
  {
    slug: "spring-refresh",
    name: "Spring refresh",
    description: "Lighter layers, botanical moments, and soft palettes that wake the house gently.",
    imageKey: "spring",
    articlesTagPath: "spring-refresh",
  },
  {
    slug: "summer-light",
    name: "Summer light",
    description: "Breezy textiles, sun-washed neutrals, and tables ready for long evenings.",
    imageKey: "summer",
    articlesTagPath: "summer-light",
  },
  {
    slug: "autumn-warmth",
    name: "Autumn warmth",
    description: "Deeper tones, candlelit corners, and plush textures that invite slowing down.",
    imageKey: "autumn",
    articlesTagPath: "autumn-warmth",
  },
  {
    slug: "winter-coziness",
    name: "Winter coziness",
    description: "Layered throws, mood lighting, and spaces built for gathering.",
    imageKey: "winter",
    articlesTagPath: "winter-coziness",
  },
];
