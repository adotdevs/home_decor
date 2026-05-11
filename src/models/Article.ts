import { Schema, model, models } from "mongoose";

const ContentBlock = new Schema(
  {
    type: { type: String, enum: ["paragraph", "heading", "image", "quote", "list"], required: true },
    content: { type: String, required: true },
    level: Number,
    alt: String,
  },
  { _id: false },
);

const FAQ = new Schema({ question: String, answer: String }, { _id: false });

const ArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    excerpt: String,
    featuredImage: String,
    categorySlug: { type: String, index: true },
    subcategorySlug: { type: String, index: true },
    tags: [String],
    contentBlocks: [ContentBlock],
    faq: [FAQ],
    internalLinks: [String],
    authorName: String,
    authorSlug: String,
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: Date,
    scheduledPublishAt: Date,
    readingTime: Number,
    seoTitle: String,
    seoDescription: String,
    focusKeyword: String,
    views: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

ArticleSchema.index({ title: "text", excerpt: "text", tags: "text" });

export const Article = models.Article || model("Article", ArticleSchema);
