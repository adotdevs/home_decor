import { ogDefault } from "@/config/images";
import {
  FALLBACK_SEASONAL_EXTRA_HUB_LINKS,
  FALLBACK_SEASONAL_HUB_LINKS_INTRO,
  FALLBACK_SEASONAL_NEWSLETTER_CTA,
  FALLBACK_SEASONAL_PAGE_INTRO,
  FALLBACK_SEASONAL_STORIES_TITLE,
} from "@/config/seasonal-hub-defaults";

/** Fallbacks when DB has no row or fields are empty */
export const DEFAULT_SITE_NAME = "Core Fusion Infinity";
export const DEFAULT_SITE_DESCRIPTION =
  "Premium Pinterest-style home decor inspiration: editorial guides, room ideas, and styling playbooks for bedrooms, kitchens, baths, and every surface in between.";

export const DEFAULT_OG_IMAGE = ogDefault;

export function getEnvPublicSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
}

export const SEASONAL_IMAGE_KEYS = ["spring", "summer", "autumn", "winter"] as const;
export type SeasonalImageKey = (typeof SEASONAL_IMAGE_KEYS)[number];

/** Hub copy merged with Mongo per slug — empty strings in storage inherit bundled defaults (`seasonal-hub-defaults`). */
export type SeasonalHubPageCopy = {
  /** Main paragraph under the hero description. Placeholders: `{seasonName}`, `{seasonNameLower}` */
  pageIntro?: string;
  storiesSectionTitle?: string;
  newsletterCtaLabel?: string;
  /** Prefix before other seasonal hub links, e.g. "Explore year-round hubs:" */
  hubLinksIntro?: string;
  /** Extra links after other seasons (label + path) */
  extraHubLinks?: { label: string; href: string }[];
};

export type DefaultSeasonalItem = {
  slug: string;
  name: string;
  description: string;
  imageKey: SeasonalImageKey;
  articlesTagPath?: string;
} & SeasonalHubPageCopy;

/** Per-hub marketing defaults for `/inspiration/seasonal/[slug]` (merged at runtime + seed). */
const SEASONAL_HUB_MERGE_DEFAULTS: SeasonalHubPageCopy = {
  pageIntro: FALLBACK_SEASONAL_PAGE_INTRO,
  storiesSectionTitle: FALLBACK_SEASONAL_STORIES_TITLE,
  newsletterCtaLabel: FALLBACK_SEASONAL_NEWSLETTER_CTA,
  hubLinksIntro: FALLBACK_SEASONAL_HUB_LINKS_INTRO,
  extraHubLinks: [...FALLBACK_SEASONAL_EXTRA_HUB_LINKS],
};

export const DEFAULT_SEASONAL_ITEMS: DefaultSeasonalItem[] = [
  {
    slug: "spring-refresh",
    name: "Spring refresh",
    description: "Lighter layers, botanical moments, and soft palettes that wake the house gently.",
    imageKey: "spring",
    articlesTagPath: "spring-refresh",
    ...SEASONAL_HUB_MERGE_DEFAULTS,
  },
  {
    slug: "summer-light",
    name: "Summer light",
    description: "Breezy textiles, sun-washed neutrals, and tables ready for long evenings.",
    imageKey: "summer",
    articlesTagPath: "summer-light",
    ...SEASONAL_HUB_MERGE_DEFAULTS,
  },
  {
    slug: "autumn-warmth",
    name: "Autumn warmth",
    description: "Deeper tones, candlelit corners, and plush textures that invite slowing down.",
    imageKey: "autumn",
    articlesTagPath: "autumn-warmth",
    ...SEASONAL_HUB_MERGE_DEFAULTS,
  },
  {
    slug: "winter-coziness",
    name: "Winter coziness",
    description: "Layered throws, mood lighting, and spaces built for gathering.",
    imageKey: "winter",
    articlesTagPath: "winter-coziness",
    ...SEASONAL_HUB_MERGE_DEFAULTS,
  },
];
