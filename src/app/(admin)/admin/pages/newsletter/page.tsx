import { NewsletterMarketingEditor } from "@/components/admin/marketing/newsletter-editor";
import { getSitePageMarketingForAdmin } from "@/services/site-page-marketing-service";
import type { NewsletterMarketingPayload } from "@/types/site-page-marketing";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSitePageMarketingForAdmin("newsletter");
  return <NewsletterMarketingEditor initial={initial as unknown as NewsletterMarketingPayload} />;
}
