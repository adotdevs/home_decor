import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/utils/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { isPlatformOwnerEmail } from "@/lib/utils/platform-owner";

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

  return <AdminShell showOwnerNav={showOwnerNav}>{children}</AdminShell>;
}
