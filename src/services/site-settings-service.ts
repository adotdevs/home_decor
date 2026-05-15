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
import { buildAutoImageAlt, extractFilenameStem, sanitizeAltText, resolveSiteOgImageAlt } from "@/lib/image-alt";

export type ResolvedSiteBranding = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  ogImageAlt: string;
};

export type SeasonalInspirationItem = DefaultSeasonalItem;

function isSeasonalKey(k: string): k is SeasonalImageKey {
  return (SEASONAL_IMAGE_KEYS as readonly string[]).includes(k);
}

function normalizeExtraHubLinks(raw: unknown): { label: string; href: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { label: string; href: string }[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    let href = clampStr(o.href, 512);
    const label = clampStr(o.label, 200);
    if (!label || !href) continue;
    if (!href.startsWith("/")) href = `/${href.replace(/^\/+/, "")}`;
    out.push({ label, href });
  }
  return out.slice(0, 16);
}

function normalizeSeasonalItem(raw: Partial<DefaultSeasonalItem>, fallbackSlug: string): SeasonalInspirationItem | null {
  const slug = String(raw.slug ?? "").trim() || fallbackSlug;
  const name = String(raw.name ?? "").trim();
  const description = String(raw.description ?? "").trim();
  const ik = String(raw.imageKey ?? "").trim();
  if (!slug || !name || !description || !isSeasonalKey(ik)) return null;
  const articlesTagPath = String(raw.articlesTagPath ?? "").trim() || slug;
  return {
    slug,
    name,
    description,
    imageKey: ik,
    articlesTagPath,
    pageIntro: clampStr(raw.pageIntro, 12000),
    storiesSectionTitle: clampStr(raw.storiesSectionTitle, 400),
    newsletterCtaLabel: clampStr(raw.newsletterCtaLabel, 240),
    hubLinksIntro: clampStr(raw.hubLinksIntro, 400),
    extraHubLinks: normalizeExtraHubLinks(raw.extraHubLinks),
  };
}

function trimmedOr(candidate: unknown, fallback: string): string {
  if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  return fallback;
}

function mergeSeasonalDbRowOntoDefault(
  def: DefaultSeasonalItem,
  row: Partial<DefaultSeasonalItem> | undefined,
): SeasonalInspirationItem | null {
  const r = row ?? {};
  const ikStrRaw = trimmedOr(r.imageKey, "");
  const imageKeyCandidate = ikStrRaw || def.imageKey;
  const ikStr = String(imageKeyCandidate).trim();
  const imageKey = isSeasonalKey(ikStr) ? ikStr : def.imageKey;

  return normalizeSeasonalItem(
    {
      slug: def.slug,
      name: trimmedOr(r.name, def.name),
      description: trimmedOr(r.description, def.description),
      imageKey,
      articlesTagPath: trimmedOr(r.articlesTagPath, def.articlesTagPath || def.slug),
      pageIntro: trimmedOr(r.pageIntro, def.pageIntro ?? ""),
      storiesSectionTitle: trimmedOr(r.storiesSectionTitle, def.storiesSectionTitle ?? ""),
      newsletterCtaLabel: trimmedOr(r.newsletterCtaLabel, def.newsletterCtaLabel ?? ""),
      hubLinksIntro: trimmedOr(r.hubLinksIntro, def.hubLinksIntro ?? ""),
      extraHubLinks:
        Array.isArray(r.extraHubLinks) && r.extraHubLinks.length > 0 ? r.extraHubLinks : def.extraHubLinks ?? [],
    },
    def.slug,
  );
}

/** Overlays stored seasonal rows onto code defaults per slug — empty DB strings inherit bundled defaults for hub copy fields. */
export function mergeSeasonalItemsFromDb(storedRows: Partial<DefaultSeasonalItem>[] | undefined | null): SeasonalInspirationItem[] {
  const bySlug = new Map<string, Partial<DefaultSeasonalItem>>();
  for (const row of storedRows ?? []) {
    const slug = String(row?.slug ?? "").trim();
    if (slug) bySlug.set(slug, row);
  }
  const out: SeasonalInspirationItem[] = [];
  for (const def of DEFAULT_SEASONAL_ITEMS) {
    const merged = mergeSeasonalDbRowOntoDefault(def, bySlug.get(def.slug));
    if (merged) out.push(merged);
  }
  if (out.length === DEFAULT_SEASONAL_ITEMS.length) return out;
  return DEFAULT_SEASONAL_ITEMS.map((def) => mergeSeasonalDbRowOntoDefault(def, undefined)!);
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
        ogImageAlt?: string;
        ogImageAutoAlt?: string;
      };
      const url = String(d.publicUrl ?? "").trim() || getEnvPublicSiteUrl();
      const name = String(d.name ?? "").trim() || DEFAULT_SITE_NAME;
      const ogImage = String(d.ogImage ?? "").trim() || DEFAULT_OG_IMAGE;
      const ogAuto =
        String(d.ogImageAutoAlt ?? "").trim() ||
        buildAutoImageAlt(
          { siteName: name, articleTitle: `${name} — editorial home decor social preview` },
          ogImage,
        );
      const ogImageAlt = resolveSiteOgImageAlt(ogImage, name, d.ogImageAlt, ogAuto);
      return {
        name,
        description: String(d.description ?? "").trim() || DEFAULT_SITE_DESCRIPTION,
        url,
        ogImage,
        ogImageAlt,
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
    ogImageAlt: resolveSiteOgImageAlt(DEFAULT_OG_IMAGE, DEFAULT_SITE_NAME),
  };
});

export const getSeasonalInspirationResolved = cache(async (): Promise<SeasonalInspirationItem[]> => {
  try {
    await connectDb();
    const doc = await SiteSettings.findOne({ key: "default" }).select("seasonalItems").lean();
    const raw = (doc as { seasonalItems?: Partial<DefaultSeasonalItem>[] } | null)?.seasonalItems;
    return mergeSeasonalItemsFromDb(Array.isArray(raw) ? raw : undefined);
  } catch {
    return mergeSeasonalItemsFromDb(undefined);
  }
});

export type SiteSettingsPayload = {
  name: string;
  description: string;
  publicUrl: string;
  ogImage: string;
  ogImageAlt: string;
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
        ogImageAlt?: string;
        seasonalItems?: Partial<DefaultSeasonalItem>[];
      };
      const items = mergeSeasonalItemsFromDb(d.seasonalItems);
      const nm = String(d.name ?? "").trim() || DEFAULT_SITE_NAME;
      const ogImage = String(d.ogImage ?? "").trim() || DEFAULT_OG_IMAGE;
      return {
        name: nm,
        description: String(d.description ?? "").trim() || DEFAULT_SITE_DESCRIPTION,
        publicUrl: String(d.publicUrl ?? "").trim(),
        ogImage,
        ogImageAlt: String(d.ogImageAlt ?? "").trim(),
        seasonalItems: items,
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
    ogImageAlt: "",
    seasonalItems: mergeSeasonalItemsFromDb(undefined),
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
  const ogImageAltManual = sanitizeAltText(String(o.ogImageAlt ?? ""));
  const ogImageAutoAlt = buildAutoImageAlt(
    { siteName: name, articleTitle: `${name} social sharing preview`, filenameHint: extractFilenameStem(ogImage) },
    ogImage,
  );

  const rawItems = o.seasonalItems;
  const seasonalItems: SeasonalInspirationItem[] = [];

  await connectDb();
  const existingDoc = await SiteSettings.findOne({ key: "default" }).lean();
  const existingRows =
    (existingDoc as { seasonalItems?: Partial<DefaultSeasonalItem>[] } | null)?.seasonalItems ?? [];
  const existingBySlug = new Map(existingRows.map((row) => [String(row.slug ?? "").trim(), row]));

  if (Array.isArray(rawItems)) {
    rawItems.forEach((row, i) => {
      if (!row || typeof row !== "object") return;
      const r = row as Partial<DefaultSeasonalItem>;
      const slug = String(r.slug ?? "").trim();
      const prev = slug ? existingBySlug.get(slug) : undefined;
      const merged: Partial<DefaultSeasonalItem> = { ...(prev || {}), ...r };
      const n = normalizeSeasonalItem(merged, `item-${i}`);
      if (n) seasonalItems.push(n);
    });
  }
  const finalSeasonal = seasonalItems.length ? seasonalItems : [...DEFAULT_SEASONAL_ITEMS];

  await SiteSettings.findOneAndUpdate(
    { key: "default" },
    {
      key: "default",
      name,
      description,
      publicUrl: publicUrlStored,
      ogImage,
      ogImageAlt: ogImageAltManual,
      ogImageAutoAlt,
      seasonalItems: finalSeasonal,
    },
    { upsert: true, new: true },
  );

  return {
    name,
    description,
    publicUrl: publicUrlStored,
    ogImage,
    ogImageAlt: ogImageAltManual,
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
    ogImageAlt: defaults.ogImageAlt ?? "",
    seasonalItems: defaults.seasonalItems,
  });
}

export type SeasonalHubPageCopyPatch = Partial<
  Pick<
    SeasonalInspirationItem,
    "pageIntro" | "storiesSectionTitle" | "newsletterCtaLabel" | "hubLinksIntro" | "extraHubLinks"
  >
>;

/** Updates copy fields for one seasonal slug (does not replace whole Site Settings document). */
export async function patchSeasonalHubPageCopy(slug: string, patch: SeasonalHubPageCopyPatch): Promise<void> {
  const key = String(slug ?? "").trim();
  if (!key) throw new Error("Missing slug");

  await connectDb();
  const doc = await SiteSettings.findOne({ key: "default" }).lean();
  const rawStored = (doc as { seasonalItems?: Partial<DefaultSeasonalItem>[] } | null)?.seasonalItems;
  const rows: SeasonalInspirationItem[] = mergeSeasonalItemsFromDb(
    Array.isArray(rawStored) && rawStored.length > 0 ? rawStored : undefined,
  ).map((r) => ({ ...r }));

  const idx = rows.findIndex((r) => String(r.slug ?? "").trim() === key);
  if (idx < 0) throw new Error("Season not found");

  const cur = rows[idx]!;
  const next: Partial<DefaultSeasonalItem> = { ...cur };
  if (patch.pageIntro !== undefined) next.pageIntro = clampStr(patch.pageIntro, 12000);
  if (patch.storiesSectionTitle !== undefined) next.storiesSectionTitle = clampStr(patch.storiesSectionTitle, 400);
  if (patch.newsletterCtaLabel !== undefined) next.newsletterCtaLabel = clampStr(patch.newsletterCtaLabel, 240);
  if (patch.hubLinksIntro !== undefined) next.hubLinksIntro = clampStr(patch.hubLinksIntro, 400);
  if (patch.extraHubLinks !== undefined) next.extraHubLinks = normalizeExtraHubLinks(patch.extraHubLinks);

  const normalized = normalizeSeasonalItem(next, key);
  if (!normalized) throw new Error("Invalid seasonal row");
  rows[idx] = normalized;

  await SiteSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { seasonalItems: rows } },
    { upsert: true, new: true },
  );
}
