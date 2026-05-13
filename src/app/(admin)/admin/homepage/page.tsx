import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { SiteEditorialEditor } from "@/components/admin/site-editorial-editor";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getHomeEditorialResolved();
  return <SiteEditorialEditor initial={initial} />;
}
