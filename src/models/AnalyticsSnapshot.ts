import { Schema, model, models } from "mongoose";

/**
 * Point-in-time analytics payloads (e.g. pre-reset). Shorter retention than raw events is OK.
 */
const AnalyticsSnapshotSchema = new Schema(
  {
    kind: { type: String, default: "analytics_bundle", index: true },
    label: { type: String, default: "" },
    counts: { type: Schema.Types.Mixed },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

AnalyticsSnapshotSchema.index({ createdAt: -1 });

export const AnalyticsSnapshot = models.AnalyticsSnapshot || model("AnalyticsSnapshot", AnalyticsSnapshotSchema);
