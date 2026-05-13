import { cache } from "react";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEASONAL_ITEMS,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
  type DefaultSeasonalItem,
  type SeasonalImageKey,
  SEASONAL_IMAGE_KEYS,
  getEnvPublicSiteUrl,
} from "@/config/site-defaults";
import { connectDb } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export type ResolvedSiteBranding = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
};

export type SeasonalInspirationItem = DefaultSeasonalItem;

function isSeasonalKey(k: string): k is SeasonalImageKey {
  return (SEASONAL_IMAGE_KEYS as readonly string[]).includes(k);
}

function normalizeSeasonalItem(raw: Partial<DefaultSeasonalItem>, fallbackSlug: string): SeasonalInspirationItem | null {
  const slug = String(raw.slug ?? "").trim() || fallbackSlug;
  const name = String(raw.name ?? "").trim();
  const description = String(raw.description ?? "").trim();
  const ik = String(raw.imageKey ?? "").trim();
  if (!slug || !name || !description || !isSeasonalKey(ik)) return null;
  const articlesTagPath = String(raw.articlesTagPath ?? "").trim() || slug;
  return { slug, name, description, imageKey: ik, articlesTagPath };
}

export const getResolvedSiteBranding = cache(async (): Promise<ResolvedSiteBranding> => {
  try {
    await connectDb();
    const doc = await SiteSettings.findOne({ key: "default" }).lean();
    if (doc) {
      const d = doc as {
        name?: string;
        description?: string;
        publicUrl?: string;
        ogImage?: string;
      };
      const url = String(d.publicUrl ?? "").trim() || getEnvPublicSiteUrl();
      return {
        name: String(d.name ?? "").trim() || DEFAULT_SITE_NAME,
        description: String(d.description ?? "").trim() || DEFAULT_SITE_DESCRIPTION,
        url,
        ogImage: String(d.ogImage ?? "").trim() || DEFAULT_OG_IMAGE,
      };
    }
  } catch {
    /* fallback */
  }
  return {
    name: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    url: getEnvPublicSiteUrl(),
    ogImage: DEFAULT_OG_IMAGE,
  };
});

export const getSeasonalInspirationResolved = cache(async (): Promise<SeasonalInspirationItem[]> => {
  try {
    await connectDb();
    const doc = await SiteSettings.findOne({ key: "default" }).select("seasonalItems").lean();
    const items = doc && (doc as { seasonalItems?: Partial<DefaultSeasonalItem>[] }).seasonalItems;
    if (Array.isArray(items) && items.length > 0) {
      const out: SeasonalInspirationItem[] = [];
      items.forEach((row, i) => {
        const n = normalizeSeasonalItem(row, `season-${i}`);
        if (n) out.push(n);
      });
      if (out.length) return out;
    }
  } catch {
    /* fallback */
  }
  return [...DEFAULT_SEASONAL_ITEMS];
});

export type SiteSettingsPayload = {
  name: string;
  description: string;
  publicUrl: string;
  ogImage: string;
  seasonalItems: SeasonalInspirationItem[];
};

export async function getSiteSettingsForAdmin(): Promise<SiteSettingsPayload> {
  try {
    await connectDb();
    const doc = await SiteSettings.findOne({ key: "default" }).lean();
    if (doc) {
      const d = doc as {
        name?: string;
        description?: string;
        publicUrl?: string;
        ogImage?: string;
        seasonalItems?: Partial<DefaultSeasonalItem>[];
      };
      const items: SeasonalInspirationItem[] = [];
      if (Array.isArray(d.seasonalItems) && d.seasonalItems.length > 0) {
        d.seasonalItems.forEach((row, i) => {
          const n = normalizeSeasonalItem(row, `item-${i}`);
          if (n) items.push(n);
        });
      }
      return {
        name: String(d.name ?? "").trim() || DEFAULT_SITE_NAME,
        description: String(d.description ?? "").trim() || DEFAULT_SITE_DESCRIPTION,
        publicUrl: String(d.publicUrl ?? "").trim(),
        ogImage: String(d.ogImage ?? "").trim() || DEFAULT_OG_IMAGE,
        seasonalItems: items.length ? items : [...DEFAULT_SEASONAL_ITEMS],
      };
    }
  } catch {
    /* defaults */
  }
  return {
    name: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    publicUrl: "",
    ogImage: DEFAULT_OG_IMAGE,
    seasonalItems: [...DEFAULT_SEASONAL_ITEMS],
  };
}

function clampStr(s: unknown, max: number): string {
  const t = String(s ?? "").trim();
  return t.length > max ? t.slice(0, max) : t;
}

export async function upsertSiteSettingsFromAdmin(body: unknown): Promise<SiteSettingsPayload> {
  if (!body || typeof body !== "object") throw new Error("Invalid body");
  const o = body as Record<string, unknown>;

  const name = clampStr(o.name, 120) || DEFAULT_SITE_NAME;
  const description = clampStr(o.description, 2000) || DEFAULT_SITE_DESCRIPTION;
  const publicUrlStored = clampStr(o.publicUrl, 512).replace(/\/$/, "");
  const ogImage = clampStr(o.ogImage, 4096) || DEFAULT_OG_IMAGE;

  const rawItems = o.seasonalItems;
  const seasonalItems: SeasonalInspirationItem[] = [];
  if (Array.isArray(rawItems)) {
    rawItems.forEach((row, i) => {
      if (!row || typeof row !== "object") return;
      const n = normalizeSeasonalItem(row as Partial<DefaultSeasonalItem>, `item-${i}`);
      if (n) seasonalItems.push(n);
    });
  }
  const finalSeasonal = seasonalItems.length ? seasonalItems : [...DEFAULT_SEASONAL_ITEMS];

  await connectDb();
  await SiteSettings.findOneAndUpdate(
    { key: "default" },
    {
      key: "default",
      name,
      description,
      publicUrl: publicUrlStored,
      ogImage,
      seasonalItems: finalSeasonal,
    },
    { upsert: true, new: true },
  );

  return {
    name,
    description,
    publicUrl: publicUrlStored,
    ogImage,
    seasonalItems: finalSeasonal,
  };
}

/** Initial Mongo document only when missing — does not overwrite admin edits. */
export async function seedSiteSettingsIfEmpty(defaults: SiteSettingsPayload): Promise<void> {
  await connectDb();
  const exists = await SiteSettings.findOne({ key: "default" }).lean();
  if (exists) return;
  await SiteSettings.create({
    key: "default",
    name: defaults.name,
    description: defaults.description,
    publicUrl: defaults.publicUrl,
    ogImage: defaults.ogImage,
    seasonalItems: defaults.seasonalItems,
  });
}
