import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Analytics } from "@/models/Analytics";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import { SearchQuery } from "@/models/SearchQuery";
import { connectDb } from "@/lib/db";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";

export async function POST(req: Request) {
  const token = (await cookies()).get(authCookie)?.value;
  if (!verifyAdminToken(token ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let clearSearch = true;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body === "object" && "clearSearchQueries" in body) {
      clearSearch = Boolean((body as { clearSearchQueries?: unknown }).clearSearchQueries);
    }
  } catch {
    /* default */
  }

  await connectDb();
  const [ev, sess, legacy] = await Promise.all([
    AnalyticsEvent.deleteMany({}),
    AnalyticsSession.deleteMany({}),
    Analytics.deleteMany({}),
  ]);
  const sq = clearSearch ? await SearchQuery.deleteMany({}) : { deletedCount: 0 };

  return NextResponse.json({
    ok: true,
    deleted: {
      analyticsEvents: ev.deletedCount,
      analyticsSessions: sess.deletedCount,
      legacyAnalyticsPoints: legacy.deletedCount,
      searchQueries: sq.deletedCount ?? 0,
    },
  });
}
