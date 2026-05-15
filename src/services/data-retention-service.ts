import type { Model } from "mongoose";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { Analytics } from "@/models/Analytics";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import { AnalyticsVisitorProfile } from "@/models/AnalyticsVisitorProfile";
import { AnalyticsSnapshot } from "@/models/AnalyticsSnapshot";
import { RetentionCleanupRun } from "@/models/RetentionCleanupRun";
import { SearchQuery } from "@/models/SearchQuery";
import { Visitor } from "@/models/Visitor";

async function deleteOlderThanBatched(
  model: Model<unknown>,
  dateField: string,
  cutoff: Date,
  batchSize: number,
): Promise<number> {
  const filter = { [dateField]: { $lt: cutoff } };
  let total = 0;
  for (;;) {
    const ids = await model.find(filter).select("_id").limit(batchSize).lean();
    if (!ids.length) break;
    const r = await model.deleteMany({ _id: { $in: ids.map((d) => d._id) } });
    total += r.deletedCount ?? 0;
    if (ids.length < batchSize) break;
  }
  return total;
}

/** Keep the most recent N retention run records for the owner UI. */
async function pruneCleanupRunLog(keep: number): Promise<number> {
  const extras = await RetentionCleanupRun.find()
    .sort({ finishedAt: -1 })
    .skip(keep)
    .select("_id")
    .limit(2000)
    .lean();
  if (!extras.length) return 0;
  const r = await RetentionCleanupRun.deleteMany({ _id: { $in: extras.map((e) => e._id) } });
  return r.deletedCount ?? 0;
}

export type DataRetentionResult = {
  ok: true;
  deleted: Record<string, number>;
  durationMs: number;
  config: {
    analyticsRetentionDays: number;
    auditRetentionDays: number;
    snapshotRetentionDays: number;
    batchSize: number;
  };
};

export async function runDataRetentionCleanup(options?: {
  trigger?: "cron" | "manual";
}): Promise<DataRetentionResult> {
  await connectDb();
  const trigger = options?.trigger ?? "cron";
  const batch = env.RETENTION_DELETE_BATCH_SIZE;
  const analyticsCutoff = new Date(Date.now() - env.ANALYTICS_RETENTION_DAYS * 86400000);
  const auditCutoff = new Date(Date.now() - env.AUDIT_RETENTION_DAYS * 86400000);
  const snapshotCutoff = new Date(Date.now() - env.ANALYTICS_SNAPSHOT_RETENTION_DAYS * 86400000);

  const startedAt = new Date();
  const deleted: Record<string, number> = {};
  let caughtError = "";

  try {
    deleted.analyticsEvents = await deleteOlderThanBatched(
      AnalyticsEvent,
      "serverReceivedAt",
      analyticsCutoff,
      batch,
    );
    deleted.analyticsSessions = await deleteOlderThanBatched(
      AnalyticsSession,
      "lastActivityAt",
      analyticsCutoff,
      batch,
    );
    deleted.analyticsVisitorProfiles = await deleteOlderThanBatched(
      AnalyticsVisitorProfile,
      "lastSeenAt",
      analyticsCutoff,
      batch,
    );
    deleted.searchQueries = await deleteOlderThanBatched(SearchQuery, "createdAt", analyticsCutoff, batch);
    deleted.legacyAnalyticsPoints = await deleteOlderThanBatched(Analytics, "createdAt", analyticsCutoff, batch);
    deleted.visitors = await deleteOlderThanBatched(Visitor, "updatedAt", analyticsCutoff, batch);

    deleted.adminAuditLogs = await deleteOlderThanBatched(AdminAuditLog, "createdAt", auditCutoff, batch);
    deleted.analyticsSnapshots = await deleteOlderThanBatched(AnalyticsSnapshot, "createdAt", snapshotCutoff, batch);

    deleted.retentionRunsPruned = await pruneCleanupRunLog(80);
  } catch (e) {
    caughtError = e instanceof Error ? e.message : String(e);
  }

  const finishedAt = new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();

  const config = {
    analyticsRetentionDays: env.ANALYTICS_RETENTION_DAYS,
    auditRetentionDays: env.AUDIT_RETENTION_DAYS,
    snapshotRetentionDays: env.ANALYTICS_SNAPSHOT_RETENTION_DAYS,
    batchSize: batch,
  };

  await RetentionCleanupRun.create({
    trigger,
    startedAt,
    finishedAt,
    durationMs,
    deleted,
    config,
    error: caughtError,
  });

  if (caughtError) {
    throw new Error(caughtError);
  }

  return {
    ok: true,
    deleted,
    durationMs,
    config,
  };
}

export async function listRecentRetentionRuns(limit = 25) {
  await connectDb();
  return RetentionCleanupRun.find().sort({ finishedAt: -1 }).limit(limit).lean();
}
