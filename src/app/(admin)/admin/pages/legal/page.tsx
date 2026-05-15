import { LegalMarketingHub } from "@/components/admin/marketing/legal-marketing-hub";
import {
  getLegalCookiesMarketingMerged,
  getLegalPrivacyMarketingMerged,
  getLegalTermsMarketingMerged,
} from "@/services/site-page-marketing-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [privacyInitial, termsInitial, cookiesInitial] = await Promise.all([
    getLegalPrivacyMarketingMerged(),
    getLegalTermsMarketingMerged(),
    getLegalCookiesMarketingMerged(),
  ]);
  return (
    <LegalMarketingHub privacyInitial={privacyInitial} termsInitial={termsInitial} cookiesInitial={cookiesInitial} />
  );
}
