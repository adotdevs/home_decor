import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/utils/auth";
import { isPlatformOwnerEmail } from "@/lib/utils/platform-owner";

export default async function OwnerSectionLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin?.email || !isPlatformOwnerEmail(admin.email)) {
    redirect("/admin");
  }
  return <>{children}</>;
}
