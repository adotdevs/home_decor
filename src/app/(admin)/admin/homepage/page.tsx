import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { SiteEditorialEditor } from "@/components/admin/site-editorial-editor";
import { getCategoryTree } from "@/services/category-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [initial, categoryTree] = await Promise.all([getHomeEditorialResolved(), getCategoryTree()]);
  return <SiteEditorialEditor initial={initial} categoryTree={categoryTree} />;
}
