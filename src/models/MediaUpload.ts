import { Schema, model, models } from "mongoose";

const MediaUploadSchema = new Schema(
  {
    url: String,
    alt: String,
    width: Number,
    height: Number,
    mimeType: String,
    tags: [String],
    showInGallery: { type: Boolean, default: false },
    galleryCategory: {
      type: String,
      enum: ["living", "kitchen", "bedroom", "bathroom", "wall-decor", "entryway", "general"],
    },
  },
  { timestamps: true },
);

export const MediaUpload = models.MediaUpload || model("MediaUpload", MediaUploadSchema);