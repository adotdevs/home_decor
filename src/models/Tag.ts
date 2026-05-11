import { Schema, model, models } from "mongoose";
const TagSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, unique: true, index: true } }, { timestamps: true });
export const Tag = models.Tag || model("Tag", TagSchema);