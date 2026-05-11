import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/utils/auth";
import { AdminShell } from "@/components/admin/admin-shell";

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

  return <AdminShell>{children}</AdminShell>;
}
