import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { isPlatformOwnerEmail } from "@/lib/utils/platform-owner";
import { runDataRetentionCleanup } from "@/services/data-retention-service";

export async function POST() {
  const token = (await cookies()).get(authCookie)?.value;
  const admin = token ? verifyAdminToken(token) : null;
  if (!admin?.email || !isPlatformOwnerEmail(admin.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDataRetentionCleanup({ trigger: "manual" });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Retention failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
