import { GlobalMarketingEditor } from "@/components/admin/marketing/global-marketing-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { GlobalMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("global-marketing");
  return <GlobalMarketingEditor initial={initial as unknown as GlobalMarketingPayload} />;
}
