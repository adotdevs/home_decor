import { ArticleEditor } from "@/components/admin/article-editor";
import { getCategoryTree } from "@/services/category-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const categoryTree = await getCategoryTree();
  return <ArticleEditor mode="create" categoryTree={categoryTree} />;
}
