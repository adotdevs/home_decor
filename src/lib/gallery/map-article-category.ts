import type { LocalAsset } from "@/config/local-assets";

export type GalleryRoomCategory = LocalAsset["category"];

/**
 * Maps site article categories to inspiration-gallery filter buckets.
 */
export function mapCategoryToGallery(categorySlug: string, subcategorySlug?: string): GalleryRoomCategory {
  const sub = (subcategorySlug || "").toLowerCase();

  if (sub.includes("bath") || sub.includes("towel") || sub.includes("shower") || sub.includes("bathroom")) {
    return "bathroom";
  }
  if (
    sub.includes("kitchen") ||
    sub.includes("cutlery") ||
    sub.includes("crockery") ||
    sub.includes("glassware") ||
    sub.includes("mug") ||
    sub.includes("table") ||
    sub.includes("placemat")
  ) {
    return "kitchen";
  }
  if (sub.includes("bed") || sub.includes("duvet") || sub.includes("bedding") || sub.includes("curtain")) {
    return "bedroom";
  }
  if (sub.includes("wall") || sub.includes("canvas") || sub.includes("mosaic") || sub.includes("art")) {
    return "wall-decor";
  }
  if (sub.includes("entry") || sub.includes("door") || sub.includes("porch")) {
    return "entryway";
  }

  switch (categorySlug) {
    case "bedroom":
      return "bedroom";
    case "kids-ideas":
      return "bedroom";
    case "bathroom":
      return "bathroom";
    case "kitchen-and-table":
      return "kitchen";
    case "wall-decor":
      return "wall-decor";
    case "decoration":
      return "general";
    default:
      return "general";
  }
}
