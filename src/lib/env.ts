import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  MONGODB_URI: z.string().min(1).default("bitblzen.abc.net"),
  JWT_SECRET: z.string().min(32).default("dev_secret_key_for_build_only_change_in_production_123"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  /** If set, only this email can access /admin/owner/* (retention & DB overview). */
  PLATFORM_OWNER_EMAIL: z.string().email().optional(),
  /** Plain-text admin password (Phase 1 bootstrap). Prefer strong secrets in production. */
  ADMIN_PASSWORD: z.string().min(1).default("changeme"),
  /** Rolling retention for analytics event/session/search/legacy/visitor data (days). */
  ANALYTICS_RETENTION_DAYS: z.coerce.number().min(7).max(365).default(30),
  /** Retention for audit logs and snapshot-style telemetry (days). */
  AUDIT_RETENTION_DAYS: z.coerce.number().min(7).max(730).default(30),
  /** Longer retention for analytics snapshots when used (days). */
  ANALYTICS_SNAPSHOT_RETENTION_DAYS: z.coerce.number().min(14).max(365).default(90),
  /** Documents deleted per batch in retention passes (limits spikes). */
  RETENTION_DELETE_BATCH_SIZE: z.coerce.number().min(50).max(5000).default(500),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  PLATFORM_OWNER_EMAIL:
    process.env.PLATFORM_OWNER_EMAIL && process.env.PLATFORM_OWNER_EMAIL.trim() !== ""
      ? process.env.PLATFORM_OWNER_EMAIL.trim()
      : undefined,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ANALYTICS_RETENTION_DAYS: process.env.ANALYTICS_RETENTION_DAYS,
  AUDIT_RETENTION_DAYS: process.env.AUDIT_RETENTION_DAYS,
  ANALYTICS_SNAPSHOT_RETENTION_DAYS: process.env.ANALYTICS_SNAPSHOT_RETENTION_DAYS,
  RETENTION_DELETE_BATCH_SIZE: process.env.RETENTION_DELETE_BATCH_SIZE,
});