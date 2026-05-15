import { InspirationGalleryMarketingEditor } from "@/components/admin/marketing/gallery-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { InspirationGalleryMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("inspiration-gallery");
  return <InspirationGalleryMarketingEditor initial={initial as unknown as InspirationGalleryMarketingPayload} />;
}
