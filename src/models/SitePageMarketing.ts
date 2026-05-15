import { Schema, model, models } from "mongoose";

/**
 * One document per marketing page (`pageKey`).
 * `data` holds page-specific fields merged at read time with code defaults.
 */
const SitePageMarketingSchema = new Schema(
  {
    pageKey: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type SitePageMarketingLean = {
  pageKey: string;
  data?: Record<string, unknown>;
  updatedAt?: Date;
};

export const SitePageMarketing = models.SitePageMarketing || model("SitePageMarketing", SitePageMarketingSchema);
