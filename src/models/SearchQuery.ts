import { Schema, model, models } from "mongoose";

const SearchQuerySchema = new Schema(
  {
    q: { type: String, required: true, index: true },
    normalizedQ: { type: String, default: "", index: true },
    visitorKey: { type: String, default: "", index: true },
    page: { type: Number, default: 1 },
    suggest: { type: Boolean, default: false },
    resultCount: { type: Number, default: 0 },
    categorySlug: { type: String, index: true },
    subcategorySlug: { type: String, index: true },
    tagSlug: { type: String, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

SearchQuerySchema.index({ visitorKey: 1, normalizedQ: 1, page: 1, createdAt: -1 });

export const SearchQuery = models.SearchQuery || model("SearchQuery", SearchQuerySchema);
