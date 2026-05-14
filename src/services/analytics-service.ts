import { connectDb } from "@/lib/db";
import { Analytics } from "@/models/Analytics";

export { analyticsSummary, getAnalyticsDashboard } from "@/services/analytics-report-service";

/** Legacy direct write (e.g. old /api/analytics/track). Prefer /api/analytics/ingest. */
export async function trackEvent(payload: Record<string, unknown>) {
  await connectDb();
  return Analytics.create(payload);
}
