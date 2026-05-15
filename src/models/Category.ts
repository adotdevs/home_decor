import mongoose, { Schema } from "mongoose";

const HubEditorialSchema = new Schema(
  {
    title: String,
    dek: String,
    advice: String,
    searches: { type: [String], default: [] },
  },
  { _id: false },
);

const FaqPairSchema = new Schema({ question: String, answer: String }, { _id: false });
const TipColumnSchema = new Schema({ title: String, body: String }, { _id: false });

/** Optional overrides for public hub pages (top-level and subcategory). */
const HubPageCopySchema = new Schema(
  {
    heroEyebrow: String,
    exploreHeading: String,
    exploreIntro: String,
    subCardBlurb: String,
    latestHeading: String,
    latestIntro: String,
    editorsHeading: String,
    editorsIntro: String,
    faqHeading: String,
    faqItems: [FaqPairSchema],
    subHeroEyebrow: String,
    guidesHeading: String,
    guidesIntro: String,
    emptyStateTitle: String,
    emptyStateBody: String,
    howToHeading: String,
    howToColumns: [TipColumnSchema],
    popularSearches: [String],
    relatedHeading: String,
  },
  { _id: false },
);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    parentSlug: { type: String, default: null, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    description: String,
    image: String,
    imageAlt: { type: String, default: "" },
    imageAutoAlt: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
    /** SEO / hero editorial — top-level hubs and subcategory hubs */
    hubEditorial: HubEditorialSchema,
    /** Optional text blocks on public category & subcategory pages */
    hubPageCopy: HubPageCopySchema,
  },
  { timestamps: true },
);

CategorySchema.index({ parentSlug: 1, slug: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.Category) {
  delete mongoose.models.Category;
}

export const Category = mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
