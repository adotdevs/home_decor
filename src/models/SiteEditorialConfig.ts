import { Schema, model, models } from "mongoose";

const HeroSlideSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String, default: "" },
    href: { type: String, default: "/" },
    kicker: { type: String, default: "" },
    headline: { type: String, default: "" },
    dek: { type: String, default: "" },
    detail: { type: String, default: "" },
  },
  { _id: false },
);

const ShopTheLookItemSchema = new Schema(
  {
    title: { type: String, required: true },
    caption: { type: String, default: "" },
    href: { type: String, default: "/" },
    image: { type: String, required: true },
  },
  { _id: false },
);

/** Singleton document: id `site` */
const SiteEditorialConfigSchema = new Schema(
  {
    _id: { type: String, default: "site" },
    heroSlides: [HeroSlideSchema],
    shopTheLookItems: [ShopTheLookItemSchema],
    leadStorySlug: String,
    featuredWeeklySlugs: [String],
    featuredDailySlugs: [String],
    featuredMonthlySlugs: [String],
    editorsChoiceSlugs: [String],
    moodRailTitle: String,
    moodRailDek: String,
    moodRailSlugs: [String],
    inspirationFeedTitle: String,
    inspirationFeedDek: String,
    inspirationPinnedSlugs: [String],
    sectionFeaturedWeekTitle: String,
    sectionFeaturedWeekDek: String,
    sectionDailyTitle: String,
    sectionDailyDek: String,
    sectionMonthlyTitle: String,
    sectionMonthlyDek: String,
    sectionEditorsChoiceTitle: String,
    sectionEditorsChoiceDek: String,
    sectionMostPinnedTitle: String,
    sectionMostPinnedDek: String,
    sectionFreshEditorsTitle: String,
  },
  { timestamps: true },
);

export type SiteEditorialConfigLean = {
  _id: string;
  heroSlides?: {
    src: string;
    alt?: string;
    href?: string;
    kicker?: string;
    headline?: string;
    dek?: string;
    detail?: string;
  }[];
  shopTheLookItems?: { title: string; caption?: string; href?: string; image: string }[];
  leadStorySlug?: string;
  featuredWeeklySlugs?: string[];
  featuredDailySlugs?: string[];
  featuredMonthlySlugs?: string[];
  editorsChoiceSlugs?: string[];
  moodRailTitle?: string;
  moodRailDek?: string;
  moodRailSlugs?: string[];
  inspirationFeedTitle?: string;
  inspirationFeedDek?: string;
  inspirationPinnedSlugs?: string[];
  sectionFeaturedWeekTitle?: string;
  sectionFeaturedWeekDek?: string;
  sectionDailyTitle?: string;
  sectionDailyDek?: string;
  sectionMonthlyTitle?: string;
  sectionMonthlyDek?: string;
  sectionEditorsChoiceTitle?: string;
  sectionEditorsChoiceDek?: string;
  sectionMostPinnedTitle?: string;
  sectionMostPinnedDek?: string;
  sectionFreshEditorsTitle?: string;
  updatedAt?: Date;
};

export const SiteEditorialConfig =
  models.SiteEditorialConfig || model("SiteEditorialConfig", SiteEditorialConfigSchema);
