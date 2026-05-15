import { LatestMarketingEditor } from "@/components/admin/marketing/latest-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { LatestMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("latest");
  return <LatestMarketingEditor initial={initial as unknown as LatestMarketingPayload} />;
}
