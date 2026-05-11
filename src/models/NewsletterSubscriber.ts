import { Schema, model, models } from "mongoose";
const NewsletterSchema = new Schema({ email: { type: String, unique: true, index: true }, source: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
export const NewsletterSubscriber = models.NewsletterSubscriber || model("NewsletterSubscriber", NewsletterSchema);