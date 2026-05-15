import { Schema, model, models } from "mongoose";

const AnalyticsVisitorProfileSchema = new Schema(
  {
    visitorKey: { type: String, required: true, unique: true, index: true },
    firstSeenAt: { type: Date, required: true, index: true },
    lastSeenAt: { type: Date, required: true, index: true },
    firstTouchCategory: { type: String, default: "" },
    firstTouchDetail: { type: String, default: "" },
    firstTouchMedium: { type: String, default: "" },
    firstReferrer: { type: String, default: "" },
    firstLandingUrl: { type: String, default: "" },
    firstUtmSource: { type: String, default: "" },
    firstUtmMedium: { type: String, default: "" },
    firstUtmCampaign: { type: String, default: "" },
    latestTouchCategory: { type: String, default: "" },
    latestTouchDetail: { type: String, default: "" },
    latestTouchMedium: { type: String, default: "" },
    latestReferrer: { type: String, default: "" },
    latestLandingUrl: { type: String, default: "" },
    latestUtmSource: { type: String, default: "" },
    latestUtmMedium: { type: String, default: "" },
    latestUtmCampaign: { type: String, default: "" },
  },
  { timestamps: true },
);

AnalyticsVisitorProfileSchema.index({ lastSeenAt: -1 });

export const AnalyticsVisitorProfile =
  models.AnalyticsVisitorProfile || model("AnalyticsVisitorProfile", AnalyticsVisitorProfileSchema);
