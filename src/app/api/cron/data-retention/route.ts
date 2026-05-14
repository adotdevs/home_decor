import { NextRequest, NextResponse } from "next/server";
import { runDataRetentionCleanup } from "@/services/data-retention-service";

/** Schedule with Vercel Cron / external worker: Authorization: Bearer $CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDataRetentionCleanup({ trigger: "cron" });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Retention failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
