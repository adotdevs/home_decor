import { Schema, model, models } from "mongoose";

const EVENT_TYPES = [
  "session_start",
  "page_view",
  "click",
  "search",
  "article_time",
] as const;

const AnalyticsEventSchema = new Schema(
  {
    type: { type: String, required: true, enum: EVENT_TYPES, index: true },
    visitorKey: { type: String, required: true, index: true },
    sessionKey: { type: String, required: true, index: true },
    path: { type: String, default: "/", index: true },
    articleSlug: { type: String, index: true },
    categorySlug: { type: String, index: true },
    href: { type: String, default: "" },
    /** internal_nav | internal_card | internal_cta | internal_related | internal_gallery | internal_feed | external */
    clickKind: { type: String, default: "" },
    linkText: { type: String, default: "" },
    searchQuery: { type: String, default: "" },
    resultCount: { type: Number },
    dwellMs: { type: Number },
    scrollMaxPct: { type: Number },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    region: { type: String, default: "" },
    timezone: { type: String, default: "" },
    deviceType: { type: String, default: "desktop", index: true },
    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    trafficSource: { type: String, default: "direct", index: true },
    referrerHost: { type: String, default: "" },
    /** Dedupe / idempotency helper for retries (optional) */
    idempotencyKey: { type: String, default: "", index: true },
    pageTitle: { type: String, default: "" },
    occurredAt: { type: Date, required: true, index: true },
    serverReceivedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

AnalyticsEventSchema.index({ occurredAt: -1, type: 1 });
AnalyticsEventSchema.index({ sessionKey: 1, occurredAt: -1 });
AnalyticsEventSchema.index({ sessionKey: 1, type: 1, path: 1, idempotencyKey: 1 });
AnalyticsEventSchema.index({ "searchQuery": 1, occurredAt: -1 });

export type AnalyticsEventType = (typeof EVENT_TYPES)[number];

export const AnalyticsEvent = models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema);
