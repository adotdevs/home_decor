export const dynamic = "force-dynamic";
import { categoryTree } from "@/config/site";
import { CategoriesAdmin, type TopLevelCategoryRow } from "@/components/admin/categories-admin";
import { getCategories } from "@/services/category-service";

export default async function Page() {
  const categories = (await getCategories()) as Array<{
    slug: string;
    name?: string;
    parentSlug?: string | null;
    image?: string;
  }>;

  const initial: TopLevelCategoryRow[] = categoryTree.map((c) => {
    const row = categories.find((x) => x.slug === c.slug && (x.parentSlug == null || x.parentSlug === ""));
    return {
      slug: c.slug,
      name: c.name,
      image: String(row?.image ?? "").trim(),
      imageAlt: String((row as { imageAlt?: string })?.imageAlt ?? "").trim(),
    };
  });

  return <CategoriesAdmin initial={initial} />;
}
