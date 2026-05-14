import { Schema, model, models } from "mongoose";

export type RetentionDeletedCounts = Record<string, number>;

const RetentionCleanupRunSchema = new Schema(
  {
    trigger: { type: String, enum: ["cron", "manual"], default: "cron" },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
    durationMs: { type: Number, required: true },
    deleted: { type: Schema.Types.Mixed, default: {} },
    config: { type: Schema.Types.Mixed },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

RetentionCleanupRunSchema.index({ finishedAt: -1 });

export type RetentionCleanupRunLean = {
  trigger: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  deleted: RetentionDeletedCounts;
  config?: unknown;
  error?: string;
};

export const RetentionCleanupRun =
  models.RetentionCleanupRun || model("RetentionCleanupRun", RetentionCleanupRunSchema);
