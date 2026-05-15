/**
 * Top-level category rows use `{ parentSlug: null }` in new writes; some legacy/edge
 * rows may use `""`. Queries that scope "this slug as a room (not a subcategory)"
 * must match both or DELETE/PATCH will miss the document.
 */
export function filterTopLevelBySlug(slug: string) {
  return { slug, $or: [{ parentSlug: null }, { parentSlug: "" }] };
}

export function filterTopLevelBySlugs(slugs: string[]) {
  return { slug: { $in: slugs }, $or: [{ parentSlug: null }, { parentSlug: "" }] };
}

export function filterTopLevelScope() {
  return { $or: [{ parentSlug: null }, { parentSlug: "" }] };
}
