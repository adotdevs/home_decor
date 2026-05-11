import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledArticles } from "@/services/article-service";

/** Call from cron (e.g. Vercel cron) with header Authorization: Bearer $CRON_SECRET */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await publishDueScheduledArticles();
  return NextResponse.json(result);
}
