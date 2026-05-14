import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { Analytics } from "@/models/Analytics";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import { AnalyticsSnapshot } from "@/models/AnalyticsSnapshot";
import { Article } from "@/models/Article";
import { ArticleReview } from "@/models/ArticleReview";
import { Category } from "@/models/Category";
import { MediaUpload } from "@/models/MediaUpload";
import { RetentionCleanupRun } from "@/models/RetentionCleanupRun";
import { SearchQuery } from "@/models/SearchQuery";
import { SeoSetting } from "@/models/SeoSetting";
import { SiteSettings } from "@/models/SiteSettings";
import { User } from "@/models/User";
import { Visitor } from "@/models/Visitor";

export type CollectionStorageRow = {
  key: string;
  label: string;
  collection: string;
  count: number;
  /** Approximate storage for this collection (bytes). */
  storageBytes: number;
  /** True when this collection participates in automated analytics/audit retention. */
  retention: boolean;
};

type CollStatsRow = {
  count?: number;
  storageStats?: { size?: number; storageSize?: number };
};

async function collStatsBytes(collectionName: string): Promise<{ count: number; storageBytes: number }> {
  const db = mongoose.connection.db;
  if (!db) return { count: 0, storageBytes: 0 };
  try {
    const rows = (await db
      .collection(collectionName)
      .aggregate<CollStatsRow>([{ $collStats: { storageStats: {} } }])
      .toArray()) as CollStatsRow[];
    if (!rows.length) {
      const count = await db.collection(collectionName).estimatedDocumentCount();
      return { count, storageBytes: 0 };
    }
    const doc = rows[0];
    const count = doc?.count ?? 0;
    const ss = doc?.storageStats;
    const storageBytes = ss?.size ?? ss?.storageSize ?? 0;
    return { count, storageBytes };
  } catch {
    return { count: 0, storageBytes: 0 };
  }
}

const OVERVIEW: { key: string; label: string; model: { collection: { name: string } }; retention: boolean }[] = [
  { key: "articles", label: "Articles", model: Article, retention: false },
  { key: "categories", label: "Categories", model: Category, retention: false },
  { key: "article_reviews", label: "Reviews", model: ArticleReview, retention: false },
  { key: "media", label: "Media uploads", model: MediaUpload, retention: false },
  { key: "seo", label: "SEO settings", model: SeoSetting, retention: false },
  { key: "sitesettings", label: "Site settings", model: SiteSettings, retention: false },
  { key: "users", label: "Users", model: User, retention: false },
  { key: "analyticsevents", label: "Analytics events", model: AnalyticsEvent, retention: true },
  { key: "analyticssessions", label: "Analytics sessions", model: AnalyticsSession, retention: true },
  { key: "searchqueries", label: "Search queries", model: SearchQuery, retention: true },
  { key: "analytics", label: "Legacy analytics", model: Analytics, retention: true },
  { key: "visitors", label: "Visitors (legacy)", model: Visitor, retention: true },
  { key: "adminauditlogs", label: "Admin audit logs", model: AdminAuditLog, retention: true },
  { key: "analyticssnapshots", label: "Analytics snapshots", model: AnalyticsSnapshot, retention: true },
  { key: "retentioncleanupruns", label: "Retention run log", model: RetentionCleanupRun, retention: false },
];

export async function getDatabaseStorageOverview(): Promise<CollectionStorageRow[]> {
  await connectDb();
  const out: CollectionStorageRow[] = [];
  for (const row of OVERVIEW) {
    const name = row.model.collection.name;
    const { count, storageBytes } = await collStatsBytes(name);
    out.push({
      key: row.key,
      label: row.label,
      collection: name,
      count,
      storageBytes,
      retention: row.retention,
    });
  }
  return out;
}

export function formatBytes(n: number): string {
  if (n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
