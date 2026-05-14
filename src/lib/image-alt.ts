/**
 * SEO- and accessibility-focused image alt text: sanitize, generate from context,
 * and resolve non-empty display alts for legacy records.
 */

export const ALT_HARD_MAX = 180;
export const ALT_SOFT_RECOMMENDED = 125;

const BANNED_PHRASES =
  /\b(image|photo|photograph|picture|pic|img|screenshot|uploaded file|untitled|placeholder)\b/gi;

const UUID_STEM = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ImageAltContext = {
  articleTitle?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  /** Short excerpt or dek */
  excerptSnippet?: string;
  focusKeyword?: string;
  slideKicker?: string;
  slideHeadline?: string;
  slideDek?: string;
  /** Shop card title */
  cardTitle?: string;
  cardCaption?: string;
  galleryRoom?: string;
  /** Site or brand name */
  siteName?: string;
  /** File stem or slug (no extension) */
  filenameHint?: string;
};

export function sanitizeAltText(raw: string | undefined | null): string {
  if (raw == null) return "";
  let s = String(raw)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  s = s.replace(BANNED_PHRASES, "").replace(/\s+/g, " ").trim();
  s = s.replace(/^[,.;:\s—-]+|[,.;:\s—-]+$/g, "").trim();
  if (s.length > ALT_HARD_MAX) {
    s = s.slice(0, ALT_HARD_MAX);
    s = s.replace(/[,;:\s]+$/, "").trim();
  }
  return s;
}

export function wordsFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Extract pathname filename stem; ignore UUID-only names (typical uploads). */
export function extractFilenameStem(url: string): string {
  if (!url || typeof url !== "string") return "";
  try {
    const path = url.startsWith("http://") || url.startsWith("https://") ? new URL(url).pathname : url;
    const name = path.split("/").pop()?.split("?")[0] || "";
    const stem = name.replace(/\.[^.]+$/, "").trim();
    if (stem.length < 3 || UUID_STEM.test(stem)) return "";
    return stem;
  } catch {
    return "";
  }
}

export function phraseFromFilenameStem(stem: string): string {
  const cleaned = stem
    .replace(/[_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!cleaned) return "";
  const words = cleaned
    .split("-")
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !/^\d+$/.test(w));
  if (!words.length) return "";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function roomLabel(ctx: ImageAltContext): string {
  const sub = ctx.subcategorySlug?.trim();
  const cat = ctx.categorySlug?.trim();
  if (sub) return wordsFromSlug(sub);
  if (cat) return wordsFromSlug(cat);
  if (ctx.galleryRoom?.trim()) return ctx.galleryRoom.trim();
  return "Home";
}

const FLAVOR = [
  "with elegant neutral styling",
  "with warm layered textures",
  "and soft editorial lighting",
  "with Pinterest-ready polish",
  "with calming, curated details",
] as const;

function pickFlavor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return FLAVOR[Math.abs(h) % FLAVOR.length];
}

/**
 * Lightweight heuristic alt when no manual text — natural, decor-specific, not filename noise.
 */
export function buildAutoImageAlt(ctx: ImageAltContext, imageUrl?: string): string {
  const room = roomLabel(ctx);
  const fk = ctx.focusKeyword?.trim();
  const stemHint = ctx.filenameHint?.trim() || extractFilenameStem(imageUrl || "");
  const fromFile = phraseFromFilenameStem(stemHint);

  let core = "";
  if (ctx.slideHeadline?.trim()) {
    const h = ctx.slideHeadline.trim();
    const k = ctx.slideKicker?.trim();
    core = k ? `${h} — ${k} editorial scene` : `${h} — homepage editorial banner`;
  } else if (ctx.cardTitle?.trim()) {
    core = `${ctx.cardTitle.trim()} — curated decor vignette`;
    if (ctx.cardCaption?.trim() && ctx.cardCaption.length < 80) {
      core = `${ctx.cardTitle.trim()} — ${ctx.cardCaption.trim()}`;
    }
  } else if (ctx.articleTitle?.trim()) {
    let t = ctx.articleTitle.trim();
    if (t.length > 78) t = `${t.slice(0, 75)}…`;
    const needsRoom = !/\b(decor|interior|room|kitchen|bed|bath|living|dining|nursery|style|design|home)\b/i.test(t);
    core = needsRoom ? `${t} — ${room} decor inspiration` : `${t} — editorial styling idea`;
  } else if (fromFile) {
    core = `${fromFile} — ${room.toLowerCase()} decor styling`;
  } else {
    core = `${room} decor inspiration ${pickFlavor(room)}`;
  }

  if (fk && fk.length < 48 && !core.toLowerCase().includes(fk.slice(0, 6).toLowerCase())) {
    core = `${core}; ${fk}`;
  }

  let out = sanitizeAltText(core);
  if (!out) out = sanitizeAltText(`${room} interior decor inspiration`);

  const site = ctx.siteName?.trim();
  if (site && out.length + site.length < ALT_HARD_MAX - 4 && !out.includes(site)) {
    out = sanitizeAltText(`${out} — ${site}`);
  }

  return out || `${room} home decor inspiration`;
}

export function computeStoredAltPair(
  manualRaw: string | undefined,
  imageUrl: string,
  ctx: ImageAltContext,
): { manualAlt: string; autoGeneratedAlt: string } {
  const manualAlt = sanitizeAltText(manualRaw || "");
  const autoGeneratedAlt = buildAutoImageAlt(
    { ...ctx, filenameHint: ctx.filenameHint || extractFilenameStem(imageUrl) },
    imageUrl,
  );
  return { manualAlt, autoGeneratedAlt };
}

/** Final alt for <img> / Image — never empty. */
export function resolveDisplayAlt(
  manualStored: string | undefined | null,
  autoStored: string | undefined | null,
  ctx: ImageAltContext,
  imageUrl?: string,
): string {
  const m = sanitizeAltText(manualStored);
  if (m) return m;
  const a = sanitizeAltText(autoStored);
  if (a) return a;
  return buildAutoImageAlt({ ...ctx, filenameHint: extractFilenameStem(imageUrl || "") }, imageUrl);
}

export function articleToAltContext(article: Record<string, unknown>): ImageAltContext {
  const excerpt = String(article.excerpt ?? "");
  return {
    articleTitle: String(article.title ?? ""),
    categorySlug: String(article.categorySlug ?? ""),
    subcategorySlug: article.subcategorySlug != null ? String(article.subcategorySlug) : "",
    excerptSnippet: excerpt.slice(0, 220),
    focusKeyword: String(article.focusKeyword ?? ""),
  };
}

export function resolveArticleFeaturedAlt(article: Record<string, unknown>): string {
  const url = String(article.featuredImage ?? "");
  const ctx = articleToAltContext(article);
  return resolveDisplayAlt(
    article.featuredImageAlt as string | undefined,
    article.featuredImageAutoAlt as string | undefined,
    ctx,
    url,
  );
}

export function resolveArticleInlineImageAlt(
  article: Record<string, unknown>,
  block: { content?: string; alt?: string; autoGeneratedAlt?: string },
): string {
  const url = String(block.content ?? "");
  const ctx = articleToAltContext(article);
  return resolveDisplayAlt(block.alt, block.autoGeneratedAlt, ctx, url);
}

export function resolveHeroSlideAlt(
  slide: { src: string; alt?: string; autoGeneratedAlt?: string; kicker?: string; headline?: string; dek?: string },
): string {
  const ctx: ImageAltContext = {
    slideKicker: slide.kicker,
    slideHeadline: slide.headline,
    slideDek: slide.dek,
    filenameHint: extractFilenameStem(slide.src),
  };
  return resolveDisplayAlt(slide.alt, slide.autoGeneratedAlt, ctx, slide.src);
}

export function resolveShopTheLookImageAlt(row: {
  image: string;
  imageAlt?: string;
  imageAutoAlt?: string;
  title?: string;
  caption?: string;
}): string {
  const ctx: ImageAltContext = {
    cardTitle: row.title,
    cardCaption: row.caption,
    filenameHint: extractFilenameStem(row.image),
  };
  return resolveDisplayAlt(row.imageAlt, row.imageAutoAlt, ctx, row.image);
}

export function resolveCategoryBannerAlt(params: {
  categorySlug: string;
  categoryDisplayName?: string;
  imageAlt?: string;
  imageAutoAlt?: string;
  heroImageUrl?: string;
}): string {
  const name = params.categoryDisplayName?.trim() || wordsFromSlug(params.categorySlug);
  const ctx: ImageAltContext = {
    articleTitle: `${name} room ideas and decor guides`,
    categorySlug: params.categorySlug,
  };
  return resolveDisplayAlt(params.imageAlt, params.imageAutoAlt, ctx, params.heroImageUrl);
}

export function resolveSiteOgImageAlt(ogImage: string, siteName: string, manual?: string, auto?: string): string {
  const ctx: ImageAltContext = { siteName, articleTitle: `${siteName} — social sharing preview` };
  return resolveDisplayAlt(manual, auto, ctx, ogImage);
}

/** Admin media grid + public gallery fallbacks — uses stored manual/auto plus room context. */
export function resolveMediaUploadCardAlt(row: {
  url?: string;
  alt?: string;
  autoGeneratedAlt?: string;
  galleryCategory?: string;
  showInGallery?: boolean;
}): string {
  const url = String(row.url ?? "");
  const cat = row.galleryCategory?.trim();
  const room = row.showInGallery && cat ? wordsFromSlug(cat) : "";
  const ctx: ImageAltContext = {
    galleryRoom: room || undefined,
    articleTitle: room ? `${room} decor inspiration gallery` : undefined,
    categorySlug: cat || undefined,
  };
  return resolveDisplayAlt(row.alt, row.autoGeneratedAlt, ctx, url);
}
