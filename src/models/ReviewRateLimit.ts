import mongoose, { Schema } from "mongoose";

/** Sliding window rate limit: one doc per IP hash per article slug per hour bucket. */
const ReviewRateLimitSchema = new Schema(
  {
    key: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ReviewRateLimitSchema.index({ key: 1 }, { unique: true });
ReviewRateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 * 2 });

if (process.env.NODE_ENV !== "production" && mongoose.models.ReviewRateLimit) {
  delete mongoose.models.ReviewRateLimit;
}

export const ReviewRateLimit =
  mongoose.models.ReviewRateLimit ?? mongoose.model("ReviewRateLimit", ReviewRateLimitSchema);
