import mongoose, { Schema } from "mongoose";

const ReviewHelpfulVoteSchema = new Schema(
  {
    reviewId: { type: Schema.Types.ObjectId, ref: "ArticleReview", required: true },
    voterKey: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

ReviewHelpfulVoteSchema.index({ reviewId: 1, voterKey: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.ReviewHelpfulVote) {
  delete mongoose.models.ReviewHelpfulVote;
}

export const ReviewHelpfulVote =
  mongoose.models.ReviewHelpfulVote ?? mongoose.model("ReviewHelpfulVote", ReviewHelpfulVoteSchema);
