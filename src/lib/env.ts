import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/home_decor"),
  JWT_SECRET: z.string().min(32).default("dev_secret_key_for_build_only_change_in_production_123"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  /** Plain-text admin password (Phase 1 bootstrap). Prefer strong secrets in production. */
  ADMIN_PASSWORD: z.string().min(1).default("changeme"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
});