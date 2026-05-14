import mongoose, { Schema } from "mongoose";

const HubEditorialSchema = new Schema(
  {
    title: { type: String, required: true },
    dek: { type: String, required: true },
    advice: { type: String, required: true },
    searches: { type: [String], default: [] },
  },
  { _id: false },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    parentSlug: { type: String, index: true, default: null },
    description: String,
    image: String,
    imageAlt: { type: String, default: "" },
    imageAutoAlt: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
    /** Long-form marketing copy for top-level `/category/[slug]` hubs only */
    hubEditorial: HubEditorialSchema,
  },
  { timestamps: true },
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Category) {
  delete mongoose.models.Category;
}

export const Category = mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
