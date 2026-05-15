/**
 * Run once per deployment or after schema changes:
 *   npx tsx src/scripts/ensure-indexes.ts
 */
import { connectDb } from "@/lib/db";
import { ensureCategoryIndexes } from "@/lib/mongodb/ensure-category-indexes";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { Article } from "@/models/Article";
import { Analytics } from "@/models/Analytics";
import { AnalyticsSnapshot } from "@/models/AnalyticsSnapshot";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import { AnalyticsVisitorProfile } from "@/models/AnalyticsVisitorProfile";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { RetentionCleanupRun } from "@/models/RetentionCleanupRun";
import { SearchQuery } from "@/models/SearchQuery";
import { ArticleReview } from "@/models/ArticleReview";
import { ReviewHelpfulVote } from "@/models/ReviewHelpfulVote";
import { ReviewRateLimit } from "@/models/ReviewRateLimit";
import { Visitor } from "@/models/Visitor";

async function main() {
  await connectDb();
  await ensureCategoryIndexes();
  await Article.syncIndexes();
  await AnalyticsSession.syncIndexes();
  await AnalyticsEvent.syncIndexes();
  await AnalyticsVisitorProfile.syncIndexes();
  await Analytics.syncIndexes();
  await Visitor.syncIndexes();
  await SearchQuery.syncIndexes();
  await ArticleReview.syncIndexes();
  await ReviewHelpfulVote.syncIndexes();
  await ReviewRateLimit.syncIndexes();
  await AdminAuditLog.syncIndexes();
  await AnalyticsSnapshot.syncIndexes();
  await RetentionCleanupRun.syncIndexes();
  console.log("Indexes synced (incl. retention-related collections).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
