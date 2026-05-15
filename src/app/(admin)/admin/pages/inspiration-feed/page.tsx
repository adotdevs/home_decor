import { InspirationFeedMarketingEditor } from "@/components/admin/marketing/inspiration-feed-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { InspirationFeedMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("inspiration-feed");
  return <InspirationFeedMarketingEditor initial={initial as unknown as InspirationFeedMarketingPayload} />;
}
