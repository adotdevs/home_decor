import { Schema, model, models } from "mongoose";

const SearchQuerySchema = new Schema(
  {
    q: { type: String, required: true, index: true },
    suggest: { type: Boolean, default: false },
    resultCount: { type: Number, default: 0 },
    categorySlug: { type: String, index: true },
    tagSlug: { type: String, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

export const SearchQuery = models.SearchQuery || model("SearchQuery", SearchQuerySchema);
