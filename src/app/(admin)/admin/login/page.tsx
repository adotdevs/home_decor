import { getResolvedSiteBranding } from "@/services/site-settings-service";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const branding = await getResolvedSiteBranding();
  return <LoginForm siteName={branding.name} />;
}
