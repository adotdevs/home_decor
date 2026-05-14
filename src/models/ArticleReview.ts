import mongoose, { Schema } from "mongoose";
import type { ArticleReviewStatus } from "@/types/article-review";

const ArticleReviewSchema = new Schema(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "Article", index: true },
    articleSlug: { type: String, required: true, index: true },
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    /** sha256(pepper:token) — plain token returned only once on create */
    ownerTokenHash: { type: String, required: true, select: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewTitle: { type: String, required: true, trim: true },
    reviewText: { type: String, required: true, trim: true },
    /** Visual avatar variant 0–7 (gradient + initials style) */
    avatarStyle: { type: Number, required: true, min: 0, max: 7 },
    helpfulCount: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["live", "hidden", "spam"],
      default: "live",
      index: true,
    },
  },
  { timestamps: true },
);

ArticleReviewSchema.index({ articleSlug: 1, status: 1, createdAt: -1 });
ArticleReviewSchema.index({ articleSlug: 1, email: 1 }, { unique: true });
ArticleReviewSchema.index({ articleSlug: 1, status: 1, isPinned: -1, helpfulCount: -1 });
ArticleReviewSchema.index({ articleSlug: 1, status: 1, rating: -1 });
ArticleReviewSchema.index({ articleSlug: 1, status: 1, helpfulCount: -1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.ArticleReview) {
  delete mongoose.models.ArticleReview;
}

export const ArticleReview =
  mongoose.models.ArticleReview ?? mongoose.model("ArticleReview", ArticleReviewSchema);
