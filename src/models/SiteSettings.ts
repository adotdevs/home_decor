import mongoose, { Schema } from "mongoose";
import { SEASONAL_IMAGE_KEYS } from "@/config/site-defaults";

const SeasonalItemSchema = new Schema(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageKey: { type: String, enum: [...SEASONAL_IMAGE_KEYS], required: true },
    articlesTagPath: { type: String, default: "" },
  },
  { _id: false },
);

const SiteSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "default", index: true },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    /** Canonical public URL (no trailing slash). Falls back to env when empty. */
    publicUrl: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    seasonalItems: { type: [SeasonalItemSchema], default: [] },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production" && mongoose.models.SiteSettings) {
  delete mongoose.models.SiteSettings;
}

export const SiteSettings = mongoose.models.SiteSettings ?? mongoose.model("SiteSettings", SiteSettingsSchema);
