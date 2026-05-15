/** Fallback copy when seasonal hub fields are blank in Site Settings */

export const FALLBACK_SEASONAL_PAGE_INTRO =
  "Seasonal styling is less about themed props and more about light, layer weight, and scent memory. We pull room guides that naturally align with {seasonNameLower} palettes — warm woods, breathable linens, grounded ceramics — so you can refresh without replacing every piece.";

export const FALLBACK_SEASONAL_STORIES_TITLE = "Stories that fit this season";

export const FALLBACK_SEASONAL_NEWSLETTER_CTA = "Get the seasonal letter";

export const FALLBACK_SEASONAL_HUB_LINKS_INTRO = "Explore year-round hubs:";

export const FALLBACK_SEASONAL_EXTRA_HUB_LINKS: { label: string; href: string }[] = [
  { label: "Bedroom", href: "/category/bedroom" },
  { label: "Kitchen & table", href: "/category/kitchen-and-table" },
];

export function applySeasonalIntroTemplate(template: string, seasonName: string): string {
  const lower = seasonName.toLowerCase();
  return template.replaceAll("{seasonName}", seasonName).replaceAll("{seasonNameLower}", lower);
}
