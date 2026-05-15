import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/utils/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { isPlatformOwnerEmail } from "@/lib/utils/platform-owner";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/login/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const showOwnerNav = isPlatformOwnerEmail(admin.email);
  const branding = await getResolvedSiteBranding();

  return (
    <AdminShell showOwnerNav={showOwnerNav} siteName={branding.name}>
      {children}
    </AdminShell>
  );
}
