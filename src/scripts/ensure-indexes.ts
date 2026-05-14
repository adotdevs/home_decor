/**
 * Run once per deployment or after schema changes:
 *   npx tsx src/scripts/ensure-indexes.ts
 */
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleReview } from "@/models/ArticleReview";
import { ReviewHelpfulVote } from "@/models/ReviewHelpfulVote";
import { ReviewRateLimit } from "@/models/ReviewRateLimit";

async function main() {
  await connectDb();
  await Article.syncIndexes();
  await ArticleReview.syncIndexes();
  await ReviewHelpfulVote.syncIndexes();
  await ReviewRateLimit.syncIndexes();
  console.log("Indexes synced (Article, ArticleReview, ReviewHelpfulVote, ReviewRateLimit).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
