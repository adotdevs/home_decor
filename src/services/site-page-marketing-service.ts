import { cache } from "react";
import { connectDb } from "@/lib/db";
import { SitePageMarketing } from "@/models/SitePageMarketing";
import { PAGE_MARKETING_DEFAULTS } from "@/config/page-marketing-defaults";
import type {
  AboutMarketingPayload,
  CookiePolicyMarketingPayload,
  GlobalMarketingPayload,
  InspirationFeedMarketingPayload,
  InspirationGalleryMarketingPayload,
  LatestMarketingPayload,
  LegalPageMarketingPayload,
  NewsletterMarketingPayload,
  SiteMarketingPageKey,
  TermsMarketingPayload,
} from "@/types/site-page-marketing";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === "object" && !Array.isArray(v));
}

/** Merge stored admin overrides into code defaults (arrays replaced wholesale). */
export function mergeMarketingPayload(
  defaults: Record<string, unknown>,
  stored: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    if (v === undefined) continue;
    const cur = defaults[k];
    if (Array.isArray(v)) {
      out[k] = v;
    } else if (isPlainObject(cur) && isPlainObject(v)) {
      out[k] = mergeMarketingPayload(cur, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function loadMerged(pageKey: SiteMarketingPageKey): Promise<Record<string, unknown>> {
  try {
    await connectDb();
    const doc = await SitePageMarketing.findOne({ pageKey }).lean();
    const base = PAGE_MARKETING_DEFAULTS[pageKey];
    const stored =
      doc && doc.data && typeof doc.data === "object" && !Array.isArray(doc.data)
        ? (doc.data as Record<string, unknown>)
        : {};
    return mergeMarketingPayload(base, stored);
  } catch {
    return { ...PAGE_MARKETING_DEFAULTS[pageKey] };
  }
}

export const getGlobalMarketingMerged = cache(async (): Promise<GlobalMarketingPayload> => {
  const m = await loadMerged("global-marketing");
  return m as unknown as GlobalMarketingPayload;
});

export const getInspirationFeedMarketingMerged = cache(async (): Promise<InspirationFeedMarketingPayload> => {
  const m = await loadMerged("inspiration-feed");
  return m as unknown as InspirationFeedMarketingPayload;
});

export const getNewsletterMarketingMerged = cache(async (): Promise<NewsletterMarketingPayload> => {
  const m = await loadMerged("newsletter");
  return m as unknown as NewsletterMarketingPayload;
});

export const getAboutMarketingMerged = cache(async (): Promise<AboutMarketingPayload> => {
  const m = await loadMerged("about");
  return m as unknown as AboutMarketingPayload;
});

export const getInspirationGalleryMarketingMerged = cache(async (): Promise<InspirationGalleryMarketingPayload> => {
  const m = await loadMerged("inspiration-gallery");
  return m as unknown as InspirationGalleryMarketingPayload;
});

export const getLatestMarketingMerged = cache(async (): Promise<LatestMarketingPayload> => {
  const m = await loadMerged("latest");
  return m as unknown as LatestMarketingPayload;
});

export const getLegalPrivacyMarketingMerged = cache(async (): Promise<LegalPageMarketingPayload> => {
  const m = await loadMerged("legal-privacy");
  return m as unknown as LegalPageMarketingPayload;
});

export const getLegalTermsMarketingMerged = cache(async (): Promise<TermsMarketingPayload> => {
  const m = await loadMerged("legal-terms");
  return m as unknown as TermsMarketingPayload;
});

export const getLegalCookiesMarketingMerged = cache(async (): Promise<CookiePolicyMarketingPayload> => {
  const m = await loadMerged("legal-cookies");
  return m as unknown as CookiePolicyMarketingPayload;
});

export async function getSitePageMarketingForAdmin(pageKey: SiteMarketingPageKey): Promise<Record<string, unknown>> {
  return loadMerged(pageKey);
}

export async function upsertSitePageMarketingFromAdmin(
  pageKey: SiteMarketingPageKey,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const base = PAGE_MARKETING_DEFAULTS[pageKey];
  const merged = mergeMarketingPayload(base, data);
  await connectDb();
  await SitePageMarketing.findOneAndUpdate(
    { pageKey },
    { pageKey, data: merged },
    { upsert: true, new: true },
  );
  return merged;
}

/** Seeds missing marketing rows only — never overwrites admin edits. */
export async function seedSitePageMarketingIfEmpty(): Promise<void> {
  await connectDb();
  const keys = Object.keys(PAGE_MARKETING_DEFAULTS) as SiteMarketingPageKey[];
  for (const pageKey of keys) {
    const exists = await SitePageMarketing.findOne({ pageKey }).lean();
    if (exists) continue;
    await SitePageMarketing.create({
      pageKey,
      data: PAGE_MARKETING_DEFAULTS[pageKey],
    });
  }
}
