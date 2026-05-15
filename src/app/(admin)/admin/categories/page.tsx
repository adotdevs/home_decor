export const dynamic = "force-dynamic";
import { CategoriesAdmin, type TopLevelCategoryAdminRow } from "@/components/admin/categories-admin";
import { getCategories, getCategoryTree } from "@/services/category-service";

export default async function Page() {
  const [tree, categories] = await Promise.all([getCategoryTree(), getCategories()]);

  type CatRow = {
    slug: string;
    name?: string;
    parentSlug?: string | null;
    image?: string;
    imageAlt?: string;
  };
  const list = categories as CatRow[];

  function rowFor(slug: string, parentSlug: string | null): CatRow | undefined {
    return list.find((c) => {
      const p = c.parentSlug;
      const isTop = p == null || p === "";
      if (parentSlug == null) return c.slug === slug && isTop;
      return c.slug === slug && p === parentSlug;
    });
  }

  const initial: TopLevelCategoryAdminRow[] = tree.map((t) => {
    const top = rowFor(t.slug, null);
    return {
      slug: t.slug,
      name: t.name,
      image: String(top?.image ?? "").trim(),
      imageAlt: String(top?.imageAlt ?? "").trim(),
      subcategories: t.subcategories.map((s) => {
        const sub = rowFor(s.slug, t.slug);
        return { slug: s.slug, name: String(sub?.name ?? s.name).trim() || s.name };
      }),
    };
  });

  return <CategoriesAdmin initial={initial} />;
}
