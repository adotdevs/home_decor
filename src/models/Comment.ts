import { Schema, model, models } from "mongoose";
const CommentSchema = new Schema({ articleSlug: { type: String, index: true }, name: String, email: String, content: String, isApproved: { type: Boolean, default: false, index: true } }, { timestamps: true });
export const Comment = models.Comment || model("Comment", CommentSchema);