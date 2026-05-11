import { Schema, model, models } from "mongoose";
const MediaUploadSchema = new Schema({ url: String, alt: String, width: Number, height: Number, mimeType: String, tags: [String] }, { timestamps: true });
export const MediaUpload = models.MediaUpload || model("MediaUpload", MediaUploadSchema);