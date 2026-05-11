import { connectDb } from "@/lib/db";
import { Category } from "@/models/Category";
import { categoryTree } from "@/config/site";

export async function getCategories() {
  try {
    await connectDb();
    const rows = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(rows));
  } catch {
    return categoryTree.map((x) => ({ name: x.name, slug: x.slug, parentSlug: null, isActive: true }));
  }
}