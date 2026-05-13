import { SiteSettingsEditor } from "@/components/admin/site-settings-editor";
import { getSiteSettingsForAdmin } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await getSiteSettingsForAdmin();
  return <SiteSettingsEditor initial={initial} />;
}
