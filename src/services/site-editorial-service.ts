import { cache } from "react";
import { shopTheLook } from "@/config/curations";
import { connectDb } from "@/lib/db";
import { SiteEditorialConfig } from "@/models/SiteEditorialConfig";
import { DEFAULT_HERO_SLIDES, type HeroSlideConfig } from "@/config/home-editorial-defaults";
import type { SiteEditorialConfigLean } from "@/models/SiteEditorialConfig";

const SITE_ID = "site";

function normalizeSlugList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => String(s || "").trim()).filter(Boolean);
}

function defaultShopTheLook(): ShopTheLookItem[] {
  return shopTheLook.map((x) => ({
    title: x.title,
    caption: x.caption,
    href: x.href,
    image: x.image,
  }));
}

function normalizeShopTheLook(raw: unknown): ShopTheLookItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return defaultShopTheLook();
  const out: ShopTheLookItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const title = String(o.title || "").trim();
    const image = String(o.image || "").trim();
    if (!title || !image) continue;
    out.push({
      title,
      caption: String(o.caption || "").trim(),
      href: String(o.href || "/").trim() || "/",
      image,
    });
  }
  return out.length ? out : defaultShopTheLook();
}

export type ShopTheLookItem = {
  title: string;
  caption: string;
  href: string;
  image: string;
};

function normalizeHeroSlides(raw: unknown): HeroSlideConfig[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_HERO_SLIDES;
  const out: HeroSlideConfig[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const src = String(o.src || "").trim();
    if (!src) continue;
    out.push({
      src,
      alt: String(o.alt || ""),
      href: String(o.href || "/"),
      kicker: String(o.kicker || ""),
      headline: String(o.headline || ""),
      dek: String(o.dek || ""),
      detail: String(o.detail || ""),
    });
  }
  return out.length ? out : DEFAULT_HERO_SLIDES;
}

export type HomeEditorialResolved = {
  heroSlides: HeroSlideConfig[];
  shopTheLookItems: ShopTheLookItem[];
  leadStorySlug: string;
  featuredWeeklySlugs: string[];
  featuredDailySlugs: string[];
  featuredMonthlySlugs: string[];
  editorsChoiceSlugs: string[];
  moodRailTitle: string;
  moodRailDek: string;
  moodRailSlugs: string[];
  inspirationFeedTitle: string;
  inspirationFeedDek: string;
  inspirationPinnedSlugs: string[];
  sectionFeaturedWeekTitle: string;
  sectionFeaturedWeekDek: string;
  sectionDailyTitle: string;
  sectionDailyDek: string;
  sectionMonthlyTitle: string;
  sectionMonthlyDek: string;
  sectionEditorsChoiceTitle: string;
  sectionEditorsChoiceDek: string;
  sectionMostPinnedTitle: string;
  sectionMostPinnedDek: string;
  sectionFreshEditorsTitle: string;
};

function mapDocToResolved(d: SiteEditorialConfigLean | Record<string, never>): HomeEditorialResolved {
  return {
    heroSlides: normalizeHeroSlides(d.heroSlides),
    shopTheLookItems: normalizeShopTheLook(d.shopTheLookItems),
    leadStorySlug: String(d.leadStorySlug || "").trim(),
    featuredWeeklySlugs: normalizeSlugList(d.featuredWeeklySlugs),
    featuredDailySlugs: normalizeSlugList(d.featuredDailySlugs),
    featuredMonthlySlugs: normalizeSlugList(d.featuredMonthlySlugs),
    editorsChoiceSlugs: normalizeSlugList(d.editorsChoiceSlugs),
    moodRailTitle: String(d.moodRailTitle || "").trim(),
    moodRailDek: String(d.moodRailDek || "").trim(),
    moodRailSlugs: normalizeSlugList(d.moodRailSlugs),
    inspirationFeedTitle: String(d.inspirationFeedTitle || "").trim(),
    inspirationFeedDek: String(d.inspirationFeedDek || "").trim(),
    inspirationPinnedSlugs: normalizeSlugList(d.inspirationPinnedSlugs),
    sectionFeaturedWeekTitle: String(d.sectionFeaturedWeekTitle || "").trim(),
    sectionFeaturedWeekDek: String(d.sectionFeaturedWeekDek || "").trim(),
    sectionDailyTitle: String(d.sectionDailyTitle || "").trim(),
    sectionDailyDek: String(d.sectionDailyDek || "").trim(),
    sectionMonthlyTitle: String(d.sectionMonthlyTitle || "").trim(),
    sectionMonthlyDek: String(d.sectionMonthlyDek || "").trim(),
    sectionEditorsChoiceTitle: String(d.sectionEditorsChoiceTitle || "").trim(),
    sectionEditorsChoiceDek: String(d.sectionEditorsChoiceDek || "").trim(),
    sectionMostPinnedTitle: String(d.sectionMostPinnedTitle || "").trim(),
    sectionMostPinnedDek: String(d.sectionMostPinnedDek || "").trim(),
    sectionFreshEditorsTitle: String(d.sectionFreshEditorsTitle || "").trim(),
  };
}

async function loadEditorialFromDatabase(): Promise<HomeEditorialResolved> {
  let doc: SiteEditorialConfigLean | null = null;
  try {
    await connectDb();
    const row = await SiteEditorialConfig.findById(SITE_ID).lean();
    doc = row ? (JSON.parse(JSON.stringify(row)) as SiteEditorialConfigLean) : null;
  } catch {
    doc = null;
  }
  return mapDocToResolved(doc || {});
}

export const getHomeEditorialResolved = cache(loadEditorialFromDatabase);

export async function upsertSiteEditorialConfig(payload: Partial<HomeEditorialResolved>): Promise<HomeEditorialResolved> {
  const cur = await loadEditorialFromDatabase();
  const merged: HomeEditorialResolved = {
    heroSlides:
      payload.heroSlides !== undefined ? normalizeHeroSlides(payload.heroSlides) : cur.heroSlides,
    shopTheLookItems:
      payload.shopTheLookItems !== undefined
        ? normalizeShopTheLook(payload.shopTheLookItems)
        : cur.shopTheLookItems,
    leadStorySlug: payload.leadStorySlug !== undefined ? String(payload.leadStorySlug || "").trim() : cur.leadStorySlug,
    featuredWeeklySlugs:
      payload.featuredWeeklySlugs !== undefined
        ? normalizeSlugList(payload.featuredWeeklySlugs)
        : cur.featuredWeeklySlugs,
    featuredDailySlugs:
      payload.featuredDailySlugs !== undefined ? normalizeSlugList(payload.featuredDailySlugs) : cur.featuredDailySlugs,
    featuredMonthlySlugs:
      payload.featuredMonthlySlugs !== undefined
        ? normalizeSlugList(payload.featuredMonthlySlugs)
        : cur.featuredMonthlySlugs,
    editorsChoiceSlugs:
      payload.editorsChoiceSlugs !== undefined
        ? normalizeSlugList(payload.editorsChoiceSlugs)
        : cur.editorsChoiceSlugs,
    moodRailTitle: payload.moodRailTitle !== undefined ? String(payload.moodRailTitle || "") : cur.moodRailTitle,
    moodRailDek: payload.moodRailDek !== undefined ? String(payload.moodRailDek || "") : cur.moodRailDek,
    moodRailSlugs:
      payload.moodRailSlugs !== undefined ? normalizeSlugList(payload.moodRailSlugs) : cur.moodRailSlugs,
    inspirationFeedTitle:
      payload.inspirationFeedTitle !== undefined
        ? String(payload.inspirationFeedTitle || "")
        : cur.inspirationFeedTitle,
    inspirationFeedDek:
      payload.inspirationFeedDek !== undefined ? String(payload.inspirationFeedDek || "") : cur.inspirationFeedDek,
    inspirationPinnedSlugs:
      payload.inspirationPinnedSlugs !== undefined
        ? normalizeSlugList(payload.inspirationPinnedSlugs)
        : cur.inspirationPinnedSlugs,
    sectionFeaturedWeekTitle:
      payload.sectionFeaturedWeekTitle !== undefined
        ? String(payload.sectionFeaturedWeekTitle || "")
        : cur.sectionFeaturedWeekTitle,
    sectionFeaturedWeekDek:
      payload.sectionFeaturedWeekDek !== undefined
        ? String(payload.sectionFeaturedWeekDek || "")
        : cur.sectionFeaturedWeekDek,
    sectionDailyTitle:
      payload.sectionDailyTitle !== undefined ? String(payload.sectionDailyTitle || "") : cur.sectionDailyTitle,
    sectionDailyDek:
      payload.sectionDailyDek !== undefined ? String(payload.sectionDailyDek || "") : cur.sectionDailyDek,
    sectionMonthlyTitle:
      payload.sectionMonthlyTitle !== undefined ? String(payload.sectionMonthlyTitle || "") : cur.sectionMonthlyTitle,
    sectionMonthlyDek:
      payload.sectionMonthlyDek !== undefined ? String(payload.sectionMonthlyDek || "") : cur.sectionMonthlyDek,
    sectionEditorsChoiceTitle:
      payload.sectionEditorsChoiceTitle !== undefined
        ? String(payload.sectionEditorsChoiceTitle || "")
        : cur.sectionEditorsChoiceTitle,
    sectionEditorsChoiceDek:
      payload.sectionEditorsChoiceDek !== undefined
        ? String(payload.sectionEditorsChoiceDek || "")
        : cur.sectionEditorsChoiceDek,
    sectionMostPinnedTitle:
      payload.sectionMostPinnedTitle !== undefined
        ? String(payload.sectionMostPinnedTitle || "")
        : cur.sectionMostPinnedTitle,
    sectionMostPinnedDek:
      payload.sectionMostPinnedDek !== undefined
        ? String(payload.sectionMostPinnedDek || "")
        : cur.sectionMostPinnedDek,
    sectionFreshEditorsTitle:
      payload.sectionFreshEditorsTitle !== undefined
        ? String(payload.sectionFreshEditorsTitle || "")
        : cur.sectionFreshEditorsTitle,
  };

  await connectDb();
  await SiteEditorialConfig.findOneAndUpdate(
    { _id: SITE_ID },
    {
      $set: {
        heroSlides: merged.heroSlides,
        shopTheLookItems: merged.shopTheLookItems,
        leadStorySlug: merged.leadStorySlug || undefined,
        featuredWeeklySlugs: merged.featuredWeeklySlugs,
        featuredDailySlugs: merged.featuredDailySlugs,
        featuredMonthlySlugs: merged.featuredMonthlySlugs,
        editorsChoiceSlugs: merged.editorsChoiceSlugs,
        moodRailTitle: merged.moodRailTitle || undefined,
        moodRailDek: merged.moodRailDek || undefined,
        moodRailSlugs: merged.moodRailSlugs,
        inspirationFeedTitle: merged.inspirationFeedTitle || undefined,
        inspirationFeedDek: merged.inspirationFeedDek || undefined,
        inspirationPinnedSlugs: merged.inspirationPinnedSlugs,
        sectionFeaturedWeekTitle: merged.sectionFeaturedWeekTitle || undefined,
        sectionFeaturedWeekDek: merged.sectionFeaturedWeekDek || undefined,
        sectionDailyTitle: merged.sectionDailyTitle || undefined,
        sectionDailyDek: merged.sectionDailyDek || undefined,
        sectionMonthlyTitle: merged.sectionMonthlyTitle || undefined,
        sectionMonthlyDek: merged.sectionMonthlyDek || undefined,
        sectionEditorsChoiceTitle: merged.sectionEditorsChoiceTitle || undefined,
        sectionEditorsChoiceDek: merged.sectionEditorsChoiceDek || undefined,
        sectionMostPinnedTitle: merged.sectionMostPinnedTitle || undefined,
        sectionMostPinnedDek: merged.sectionMostPinnedDek || undefined,
        sectionFreshEditorsTitle: merged.sectionFreshEditorsTitle || undefined,
      },
    },
    { upsert: true },
  );

  return merged;
}
