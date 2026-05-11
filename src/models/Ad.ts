import { Schema, model, models } from "mongoose";
const AdSchema = new Schema({ name: String, placement: { type: String, index: true }, code: String, isEnabled: { type: Boolean, default: true }, device: { type: String, enum: ["all", "desktop", "mobile"], default: "all" } }, { timestamps: true });
export const Ad = models.Ad || model("Ad", AdSchema);