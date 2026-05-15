import mongoose from "mongoose";
import { Category } from "@/models/Category";

/**
 * Older schemas used `slug` alone as globally unique. Subcategories can legally reuse a slug
 * (e.g. `bedroom` under `kids-ideas` vs top-level `bedroom`). Drop legacy unique-on-slug indexes
 * so `{ parentSlug, slug }` compound unique can apply.
 */
export async function ensureCategoryIndexes(): Promise<void> {
  const conn = mongoose.connection;
  if (conn.readyState !== 1) return;

  const coll = conn.collection("categories");
  let indexes: Awaited<ReturnType<typeof coll.indexes>>;
  try {
    indexes = await coll.indexes();
  } catch {
    await Category.syncIndexes();
    return;
  }

  for (const idx of indexes) {
    const key = idx.key as Record<string, number>;
    const keys = Object.keys(key);
    if (keys.length === 1 && keys[0] === "slug" && idx.unique) {
      const name = String(idx.name);
      await coll.dropIndex(name);
      console.warn(
        `[categories] Dropped legacy unique index "${name}". Subcategory slugs may repeat across parents.`,
      );
    }
  }

  await Category.syncIndexes();
}
