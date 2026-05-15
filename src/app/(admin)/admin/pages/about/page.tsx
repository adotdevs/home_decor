import { AboutMarketingEditor } from "@/components/admin/marketing/about-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { AboutMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("about");
  return <AboutMarketingEditor initial={initial as unknown as AboutMarketingPayload} />;
}
