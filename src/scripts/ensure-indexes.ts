/**
 * Run once per deployment or after schema changes:
 *   npx tsx src/scripts/ensure-indexes.ts
 */
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";

async function main() {
  await connectDb();
  await Article.syncIndexes();
  console.log("Article indexes synced (includes text index if defined on schema).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
