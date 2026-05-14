import { Schema, model, models } from "mongoose";

const AnalyticsSessionSchema = new Schema(
  {
    sessionKey: { type: String, required: true, unique: true, index: true },
    visitorKey: { type: String, required: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    lastActivityAt: { type: Date, required: true, index: true },
    /** Total page_view events attributed to this session */
    pageViews: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    entryPath: { type: String, default: "/" },
    exitPath: { type: String, default: "/" },
    referrer: { type: String, default: "" },
    referrerHost: { type: String, default: "", index: true },
    /** direct | google | pinterest | social | search_other | referral */
    trafficSource: { type: String, default: "direct", index: true },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    region: { type: String, default: "" },
    /** IANA tz e.g. America/New_York (Vercel header or IP API) */
    timezone: { type: String, default: "" },
    deviceType: { type: String, default: "desktop", index: true },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    /** True if only one page was viewed in the session (computed as pageViews <= 1 at session end; updated live) */
    isBounce: { type: Boolean, default: true },
  },
  { timestamps: true },
);

AnalyticsSessionSchema.index({ visitorKey: 1, startedAt: -1 });
AnalyticsSessionSchema.index({ lastActivityAt: -1 });

export type AnalyticsSessionLean = {
  sessionKey: string;
  visitorKey: string;
  startedAt: Date;
  lastActivityAt: Date;
  pageViews: number;
  clicks: number;
  isBounce?: boolean;
};

export const AnalyticsSession =
  models.AnalyticsSession || model("AnalyticsSession", AnalyticsSessionSchema);
