"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import type { HeroSlideConfig } from "@/config/home-editorial-defaults";
import { shopTheLook } from "@/config/curations";
import type { HomeEditorialResolved, ShopTheLookItem } from "@/services/site-editorial-service";
import { categoryTree } from "@/config/site";
import { ImageAltField } from "@/components/admin/image-alt-field";
import { adminUploadMedia } from "@/lib/client/admin-media-upload";
import { resolveHeroSlideAlt, resolveShopTheLookImageAlt } from "@/lib/image-alt";

/** Accepts one slug per line, or full URLs containing /article/… */
function linesToArticleSlugs(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return "";
      const fromUrl = t.match(/\/article\/([^/?#\s]+)/i);
      if (fromUrl) {
        try {
          return decodeURIComponent(fromUrl[1]);
        } catch {
          return fromUrl[1];
        }
      }
      return t.replace(/^\/+/, "").replace(/^article\//i, "").split(/[/?#]/)[0] || "";
    })
    .filter(Boolean);
}

const BANNER_LINK_PRESETS: { label: string; href: string }[] = [
  { label: "Homepage", href: "/" },
  { label: "Latest stories", href: "/latest" },
  { label: "Trending ideas", href: "/trending" },
  { label: "Inspiration gallery", href: "/inspiration-gallery" },
  { label: "Inspiration feed", href: "/inspiration/feed" },
  { label: "Newsletter", href: "/newsletter" },
  ...categoryTree.map((c) => ({ label: `${c.name} ideas`, href: `/category/${c.slug}` })),
];

function emptySlide(): HeroSlideConfig {
  return { src: "", alt: "", href: "/", kicker: "", headline: "", dek: "", detail: "" };
}

function defaultShopTheLookRows(): ShopTheLookItem[] {
  return shopTheLook.map((x) => ({
    title: x.title,
    caption: x.caption,
    href: x.href,
    image: x.image,
    imageAlt: "",
    imageAutoAlt: "",
  }));
}

function emptyShopTheLookItem(): ShopTheLookItem {
  return { title: "", caption: "", href: "/", image: "", imageAlt: "", imageAutoAlt: "" };
}

function SettingsCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm md:p-6">
      <h2 className="font-heading text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
      {intro ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function StoryLinksArea({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <textarea
        className="mt-2 min-h-[100px] w-full rounded-xl border border-border bg-background p-3 text-sm leading-relaxed"
        placeholder={"Example:\nsummer-living-room-ideas\nor paste: https://yoursite.com/article/summer-living-room-ideas"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function BannerLinkPicker({ href, onChange }: { href: string; onChange: (h: string) => void }) {
  const isPreset = BANNER_LINK_PRESETS.some((p) => p.href === href);
  const selectValue = isPreset ? href : "__other__";
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">Button goes to</span>
      <select
        className="w-full max-w-md cursor-pointer rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__other__") {
            onChange(href && !isPreset ? href : "/latest");
            return;
          }
          onChange(v);
        }}
      >
        {BANNER_LINK_PRESETS.map((p) => (
          <option key={p.href} value={p.href}>
            {p.label}
          </option>
        ))}
        <option value="__other__">Another page…</option>
      </select>
      {selectValue === "__other__" ? (
        <input
          className="w-full max-w-md rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm"
          value={href}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/contact or full path"
        />
      ) : null}
    </div>
  );
}

export function SiteEditorialEditor({ initial }: { initial: HomeEditorialResolved }) {
  const [heroSlides, setHeroSlides] = useState<HeroSlideConfig[]>(() => initial.heroSlides.map((s) => ({ ...s })));
  const [shopTheLookItems, setShopTheLookItems] = useState<ShopTheLookItem[]>(() =>
    initial.shopTheLookItems.map((x) => ({
      ...x,
      imageAlt: x.imageAlt ?? "",
      imageAutoAlt: x.imageAutoAlt ?? "",
    })),
  );
  const [leadStorySlug, setLeadStorySlug] = useState(initial.leadStorySlug);
  const [featuredWeeklySlugs, setFeaturedWeeklySlugs] = useState(initial.featuredWeeklySlugs.join("\n"));
  const [featuredDailySlugs, setFeaturedDailySlugs] = useState(initial.featuredDailySlugs.join("\n"));
  const [featuredMonthlySlugs, setFeaturedMonthlySlugs] = useState(initial.featuredMonthlySlugs.join("\n"));
  const [editorsChoiceSlugs, setEditorsChoiceSlugs] = useState(initial.editorsChoiceSlugs.join("\n"));
  const [moodRailTitle, setMoodRailTitle] = useState(initial.moodRailTitle);
  const [moodRailDek, setMoodRailDek] = useState(initial.moodRailDek);
  const [moodRailSlugs, setMoodRailSlugs] = useState(initial.moodRailSlugs.join("\n"));
  const [inspirationFeedTitle, setInspirationFeedTitle] = useState(initial.inspirationFeedTitle);
  const [inspirationFeedDek, setInspirationFeedDek] = useState(initial.inspirationFeedDek);
  const [inspirationPinnedSlugs, setInspirationPinnedSlugs] = useState(initial.inspirationPinnedSlugs.join("\n"));
  const [sectionFeaturedWeekTitle, setSectionFeaturedWeekTitle] = useState(initial.sectionFeaturedWeekTitle);
  const [sectionFeaturedWeekDek, setSectionFeaturedWeekDek] = useState(initial.sectionFeaturedWeekDek);
  const [sectionDailyTitle, setSectionDailyTitle] = useState(initial.sectionDailyTitle);
  const [sectionDailyDek, setSectionDailyDek] = useState(initial.sectionDailyDek);
  const [sectionMonthlyTitle, setSectionMonthlyTitle] = useState(initial.sectionMonthlyTitle);
  const [sectionMonthlyDek, setSectionMonthlyDek] = useState(initial.sectionMonthlyDek);
  const [sectionEditorsChoiceTitle, setSectionEditorsChoiceTitle] = useState(initial.sectionEditorsChoiceTitle);
  const [sectionEditorsChoiceDek, setSectionEditorsChoiceDek] = useState(initial.sectionEditorsChoiceDek);
  const [sectionMostPinnedTitle, setSectionMostPinnedTitle] = useState(initial.sectionMostPinnedTitle);
  const [sectionMostPinnedDek, setSectionMostPinnedDek] = useState(initial.sectionMostPinnedDek);
  const [sectionFreshEditorsTitle, setSectionFreshEditorsTitle] = useState(initial.sectionFreshEditorsTitle);
  const [sidebarSeasonalGuidesLabel, setSidebarSeasonalGuidesLabel] = useState(initial.sidebarSeasonalGuidesLabel);
  const [sidebarNewsletterKicker, setSidebarNewsletterKicker] = useState(initial.sidebarNewsletterKicker);
  const [sidebarNewsletterTitle, setSidebarNewsletterTitle] = useState(initial.sidebarNewsletterTitle);
  const [sidebarNewsletterDek, setSidebarNewsletterDek] = useState(initial.sidebarNewsletterDek);
  const [homepageTrustTitle, setHomepageTrustTitle] = useState(initial.homepageTrustTitle);
  const [homepageTrustBody, setHomepageTrustBody] = useState(initial.homepageTrustBody);
  const [relatedStoriesTitle, setRelatedStoriesTitle] = useState(initial.relatedStoriesTitle);
  const [categoryPopularSearchesTitle, setCategoryPopularSearchesTitle] = useState(
    initial.categoryPopularSearchesTitle,
  );
  const [newsletterReadersSayTitle, setNewsletterReadersSayTitle] = useState(initial.newsletterReadersSayTitle);
  const [searchIntroEyebrow, setSearchIntroEyebrow] = useState(initial.searchIntroEyebrow);
  const [searchIntroTitle, setSearchIntroTitle] = useState(initial.searchIntroTitle);
  const [searchIntroDek, setSearchIntroDek] = useState(initial.searchIntroDek);
  const [searchTrendingTitle, setSearchTrendingTitle] = useState(initial.searchTrendingTitle);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadBusyIndex, setUploadBusyIndex] = useState<number | null>(null);
  const [stlUploadBusyIndex, setStlUploadBusyIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stlFileRef = useRef<HTMLInputElement>(null);
  const pickTarget = useRef<number | null>(null);
  const stlPickTarget = useRef<number | null>(null);

  const storyListHint = useMemo(
    () =>
      "Put one story per line. You can type the short name from the address bar, or paste the full article link — we’ll figure it out.",
    [],
  );

  const runUpload = useCallback(
    async (slideIndex: number, file: File | undefined) => {
      if (!file) return;
      setUploadBusyIndex(slideIndex);
      setMsg(null);
      try {
        const slide = heroSlides[slideIndex];
        const { url } = await adminUploadMedia(file, {
          alt: slide?.alt,
          contextTitle: [slide?.headline, slide?.kicker].filter(Boolean).join(" — ") || "Homepage banner",
        });
        setHeroSlides((rows) => rows.map((r, j) => (j === slideIndex ? { ...r, src: url } : r)));
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Could not upload image");
      } finally {
        setUploadBusyIndex(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [heroSlides],
  );

  const runStlUpload = useCallback(
    async (rowIndex: number, file: File | undefined) => {
      if (!file) return;
      setStlUploadBusyIndex(rowIndex);
      setMsg(null);
      try {
        const row = shopTheLookItems[rowIndex];
        const { url } = await adminUploadMedia(file, {
          alt: row?.imageAlt,
          contextTitle: row?.title || "Shop the look card",
        });
        setShopTheLookItems((rows) => rows.map((r, j) => (j === rowIndex ? { ...r, image: url } : r)));
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Could not upload image");
      } finally {
        setStlUploadBusyIndex(null);
        if (stlFileRef.current) stlFileRef.current.value = "";
      }
    },
    [shopTheLookItems],
  );

  async function save() {
    const cleanedSlides = heroSlides.filter((s) => s.src.trim());
    if (!cleanedSlides.length) {
      setMsg("Add at least one banner slide with a photo (use Upload).");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const payload: HomeEditorialResolved = {
        heroSlides: cleanedSlides,
        shopTheLookItems,
        leadStorySlug: linesToArticleSlugs(leadStorySlug)[0] ?? "",
        featuredWeeklySlugs: linesToArticleSlugs(featuredWeeklySlugs),
        featuredDailySlugs: linesToArticleSlugs(featuredDailySlugs),
        featuredMonthlySlugs: linesToArticleSlugs(featuredMonthlySlugs),
        editorsChoiceSlugs: linesToArticleSlugs(editorsChoiceSlugs),
        moodRailTitle: moodRailTitle.trim(),
        moodRailDek: moodRailDek.trim(),
        moodRailSlugs: linesToArticleSlugs(moodRailSlugs),
        inspirationFeedTitle: inspirationFeedTitle.trim(),
        inspirationFeedDek: inspirationFeedDek.trim(),
        inspirationPinnedSlugs: linesToArticleSlugs(inspirationPinnedSlugs),
        sectionFeaturedWeekTitle: sectionFeaturedWeekTitle.trim(),
        sectionFeaturedWeekDek: sectionFeaturedWeekDek.trim(),
        sectionDailyTitle: sectionDailyTitle.trim(),
        sectionDailyDek: sectionDailyDek.trim(),
        sectionMonthlyTitle: sectionMonthlyTitle.trim(),
        sectionMonthlyDek: sectionMonthlyDek.trim(),
        sectionEditorsChoiceTitle: sectionEditorsChoiceTitle.trim(),
        sectionEditorsChoiceDek: sectionEditorsChoiceDek.trim(),
        sectionMostPinnedTitle: sectionMostPinnedTitle.trim(),
        sectionMostPinnedDek: sectionMostPinnedDek.trim(),
        sectionFreshEditorsTitle: sectionFreshEditorsTitle.trim(),
        sidebarSeasonalGuidesLabel: sidebarSeasonalGuidesLabel.trim(),
        sidebarNewsletterKicker: sidebarNewsletterKicker.trim(),
        sidebarNewsletterTitle: sidebarNewsletterTitle.trim(),
        sidebarNewsletterDek: sidebarNewsletterDek.trim(),
        homepageTrustTitle: homepageTrustTitle.trim(),
        homepageTrustBody: homepageTrustBody.trim(),
        relatedStoriesTitle: relatedStoriesTitle.trim(),
        categoryPopularSearchesTitle: categoryPopularSearchesTitle.trim(),
        newsletterReadersSayTitle: newsletterReadersSayTitle.trim(),
        searchIntroEyebrow: searchIntroEyebrow.trim(),
        searchIntroTitle: searchIntroTitle.trim(),
        searchIntroDek: searchIntroDek.trim(),
        searchTrendingTitle: searchTrendingTitle.trim(),
      };
      const res = await fetch("/api/site-editorial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Save failed");
      setMsg("Saved. Check your homepage to see the changes.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function updateSlide(i: number, patch: Partial<HeroSlideConfig>) {
    setHeroSlides((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function triggerFilePick(i: number) {
    pickTarget.current = i;
    fileRef.current?.click();
  }

  function updateShopItem(i: number, patch: Partial<ShopTheLookItem>) {
    setShopTheLookItems((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function triggerStlFilePick(i: number) {
    stlPickTarget.current = i;
    stlFileRef.current?.click();
  }

  return (
    <div className="space-y-8 pb-28">
      <header className="rounded-2xl border border-amber-200/60 bg-amber-50/80 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <h1 className="font-heading text-2xl font-semibold md:text-3xl">Edit your homepage</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Change the big rotating photos, which story is featured first, and which articles appear in each section. Saving updates
          the live site. For the trending order of individual stories, open that article in <strong>Articles → Edit</strong> and use
          “Trending &amp; homepage” there.
        </p>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const i = pickTarget.current;
          pickTarget.current = null;
          const file = e.target.files?.[0];
          if (i != null && file) void runUpload(i, file);
        }}
      />

      <input
        ref={stlFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const i = stlPickTarget.current;
          stlPickTarget.current = null;
          const file = e.target.files?.[0];
          if (i != null && file) void runStlUpload(i, file);
        }}
      />

      {msg ? (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            msg.includes("Saved")
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {msg}
        </p>
      ) : null}

      <SettingsCard
        title="Banner photos (top of homepage)"
        intro="These rotate like a slideshow. Upload a photo for each slide, then write the headline and text visitors see."
      >
        <div className="space-y-6">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-muted/20 p-4 md:p-5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void runUpload(i, file);
              }}
            >
              <p className="text-sm font-medium text-foreground">Slide {i + 1}</p>

              <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
                    {s.src ? (
                      <Image src={s.src} alt={s.src ? resolveHeroSlideAlt(s) : "Slide preview"} fill className="object-cover" sizes="220px" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                        No photo yet
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={uploadBusyIndex === i}
                    className="w-full cursor-pointer rounded-xl border border-border bg-background py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    onClick={() => triggerFilePick(i)}
                  >
                    {uploadBusyIndex === i ? "Uploading…" : s.src ? "Change photo" : "Upload photo"}
                  </button>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP, GIF · max 8 MB. Or drag a file onto this box.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium">Small label above the headline</span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={s.kicker}
                      onChange={(e) => updateSlide(i, { kicker: e.target.value })}
                      placeholder="e.g. Living rooms"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium">Headline</span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={s.headline}
                      onChange={(e) => updateSlide(i, { headline: e.target.value })}
                      placeholder="Main title visitors read"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium">Short line under the headline</span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={s.dek}
                      onChange={(e) => updateSlide(i, { dek: e.target.value })}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-medium">Extra text (optional)</span>
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      rows={3}
                      value={s.detail}
                      onChange={(e) => updateSlide(i, { detail: e.target.value })}
                    />
                  </label>
                  <ImageAltField
                    label="Photo alt text (SEO, Pinterest & screen readers)"
                    value={s.alt}
                    onChange={(v) => updateSlide(i, { alt: v })}
                    previewSrc={s.src || undefined}
                    autoPreviewContext={{
                      slideHeadline: s.headline,
                      slideKicker: s.kicker,
                      slideDek: s.dek,
                    }}
                    autoPreviewUrl={s.src || undefined}
                  />
                  <div className="sm:col-span-2">
                    <BannerLinkPicker href={s.href} onChange={(h) => updateSlide(i, { href: h })} />
                  </div>
                </div>
              </div>

              {heroSlides.length > 1 ? (
                <button
                  type="button"
                  className="mt-4 cursor-pointer text-sm text-destructive hover:underline"
                  onClick={() => setHeroSlides((rows) => rows.filter((_, j) => j !== i))}
                >
                  Remove this slide
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-muted/60"
            onClick={() => setHeroSlides((rows) => [...rows, emptySlide()])}
          >
            + Add another banner slide
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Shop the look — editorial picks"
        intro="The row of room cards on the homepage. Upload a photo for each, set the title and short line underneath, and where the card links."
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            onClick={() => setShopTheLookItems(defaultShopTheLookRows().map((x) => ({ ...x })))}
          >
            Restore built-in starter picks
          </button>
        </div>
        <div className="space-y-6">
          {shopTheLookItems.map((row, i) => (
            <div
              key={`stl-${i}`}
              className="rounded-xl border border-border bg-muted/20 p-4 md:p-5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void runStlUpload(i, file);
              }}
            >
              <p className="text-sm font-medium text-foreground">Card {i + 1}</p>
              <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
                    {row.image ? (
                      <Image
                        src={row.image}
                        alt={row.image ? resolveShopTheLookImageAlt(row) : "Card preview"}
                        fill
                        className="object-cover"
                        sizes="220px"
                        unoptimized={row.image.startsWith("http")}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                        No photo yet
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={stlUploadBusyIndex === i}
                    className="w-full cursor-pointer rounded-xl border border-border bg-background py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                    onClick={() => triggerStlFilePick(i)}
                  >
                    {stlUploadBusyIndex === i ? "Uploading…" : row.image ? "Change photo" : "Upload photo"}
                  </button>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP, GIF · max 8 MB. Or drag a file here.</p>
                </div>
                <div className="grid gap-3">
                  <label className="block">
                    <span className="text-sm font-medium">Title on the card</span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={row.title}
                      onChange={(e) => updateShopItem(i, { title: e.target.value })}
                      placeholder="e.g. Living room layers"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium">Short line under the photo</span>
                    <input
                      className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      value={row.caption}
                      onChange={(e) => updateShopItem(i, { caption: e.target.value })}
                    />
                  </label>
                  <ImageAltField
                    label="Photo alt text"
                    value={row.imageAlt ?? ""}
                    onChange={(v) => updateShopItem(i, { imageAlt: v })}
                    previewSrc={row.image || undefined}
                    autoPreviewContext={{ cardTitle: row.title, cardCaption: row.caption }}
                    autoPreviewUrl={row.image || undefined}
                  />
                  <BannerLinkPicker href={row.href} onChange={(h) => updateShopItem(i, { href: h })} />
                </div>
              </div>
              {shopTheLookItems.length > 1 ? (
                <button
                  type="button"
                  className="mt-4 cursor-pointer text-sm text-destructive hover:underline"
                  onClick={() => setShopTheLookItems((rows) => rows.filter((_, j) => j !== i))}
                >
                  Remove this card
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-muted/60"
            onClick={() => setShopTheLookItems((rows) => [...rows, emptyShopTheLookItem()])}
          >
            + Add another card
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Main story under the banner"
        intro="Pick the lead article. Leave blank to always show the newest published story automatically."
      >
        <label className="block max-w-xl">
          <span className="text-sm font-medium">Story</span>
          <p className="mt-1 text-xs text-muted-foreground">Type the article name from the URL, or paste the full article link.</p>
          <input
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            value={leadStorySlug}
            onChange={(e) => setLeadStorySlug(e.target.value)}
            placeholder='e.g. cozy-bedroom-layers or https://…/article/cozy-bedroom-layers'
          />
        </label>
      </SettingsCard>

      <SettingsCard
        title="Story rows on the homepage"
        intro="Each box is a scrolling row of story cards. Leave a box empty to skip that row (the site will use fallbacks where it always has before)."
      >
        <StoryLinksArea
          label="Featured this week"
          hint={storyListHint}
          value={featuredWeeklySlugs}
          onChange={setFeaturedWeeklySlugs}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Title above that row (optional)</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sectionFeaturedWeekTitle}
              onChange={(e) => setSectionFeaturedWeekTitle(e.target.value)}
              placeholder="Leave blank for default"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle (optional)</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sectionFeaturedWeekDek}
              onChange={(e) => setSectionFeaturedWeekDek(e.target.value)}
            />
          </label>
        </div>

        <details className="rounded-xl border border-border bg-muted/15 p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground">More rows (today · monthly · editor’s picks)</summary>
          <div className="mt-4 space-y-6 border-t border-border pt-4">
            <StoryLinksArea label="Featured today" hint={storyListHint} value={featuredDailySlugs} onChange={setFeaturedDailySlugs} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Section title</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionDailyTitle}
                  onChange={(e) => setSectionDailyTitle(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Subtitle</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionDailyDek}
                  onChange={(e) => setSectionDailyDek(e.target.value)}
                />
              </label>
            </div>

            <StoryLinksArea
              label="Monthly spotlight"
              hint={storyListHint}
              value={featuredMonthlySlugs}
              onChange={setFeaturedMonthlySlugs}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Section title</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionMonthlyTitle}
                  onChange={(e) => setSectionMonthlyTitle(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Subtitle</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionMonthlyDek}
                  onChange={(e) => setSectionMonthlyDek(e.target.value)}
                />
              </label>
            </div>

            <StoryLinksArea
              label="Editor’s choice"
              hint={storyListHint}
              value={editorsChoiceSlugs}
              onChange={setEditorsChoiceSlugs}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Section title</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionEditorsChoiceTitle}
                  onChange={(e) => setSectionEditorsChoiceTitle(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Subtitle</span>
                <input
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={sectionEditorsChoiceDek}
                  onChange={(e) => setSectionEditorsChoiceDek(e.target.value)}
                />
              </label>
            </div>
          </div>
        </details>
      </SettingsCard>

      <SettingsCard
        title="Large rotating story strip"
        intro="One big story at a time that changes every few seconds. Add story links below, or leave empty for an automatic pick."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={moodRailTitle}
              onChange={(e) => setMoodRailTitle(e.target.value)}
              placeholder="Optional — default text is used if empty"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={moodRailDek}
              onChange={(e) => setMoodRailDek(e.target.value)}
            />
          </label>
        </div>
        <StoryLinksArea label="Stories in this strip" hint={storyListHint} value={moodRailSlugs} onChange={setMoodRailSlugs} />
      </SettingsCard>

      <SettingsCard
        title="Inspiration grid & pins"
        intro="The photo grid on the homepage can show your chosen stories first (in your order), then the rest by date."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Section title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={inspirationFeedTitle}
              onChange={(e) => setInspirationFeedTitle(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Subtitle</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={inspirationFeedDek}
              onChange={(e) => setInspirationFeedDek(e.target.value)}
            />
          </label>
        </div>
        <StoryLinksArea
          label="Pinned stories (show first)"
          hint="As many as you like, in order. Same format: one per line, slug or full article link."
          value={inspirationPinnedSlugs}
          onChange={setInspirationPinnedSlugs}
        />
      </SettingsCard>

      <SettingsCard
        title="Labels & blurbs (site-wide)"
        intro="These power the homepage sidebar, the article-page rail, category hubs, search intro, newsletter headline, and the trust strip above the footer. Use {siteName} in the trust paragraph and {category} in the category search title."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Homepage — seasonal sidebar kicker</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sidebarSeasonalGuidesLabel}
              onChange={(e) => setSidebarSeasonalGuidesLabel(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Homepage sidebar — newsletter kicker</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sidebarNewsletterKicker}
              onChange={(e) => setSidebarNewsletterKicker(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Homepage sidebar — newsletter title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sidebarNewsletterTitle}
              onChange={(e) => setSidebarNewsletterTitle(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Homepage sidebar — newsletter subtitle</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={sidebarNewsletterDek}
              onChange={(e) => setSidebarNewsletterDek(e.target.value)}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Homepage — trust strip title</span>
          <input
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            value={homepageTrustTitle}
            onChange={(e) => setHomepageTrustTitle(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Homepage — trust strip body ({`{siteName}`} allowed)</span>
          <textarea
            className="mt-1.5 min-h-[100px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed"
            value={homepageTrustBody}
            onChange={(e) => setHomepageTrustBody(e.target.value)}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Article page — related rail kicker</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={relatedStoriesTitle}
              onChange={(e) => setRelatedStoriesTitle(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Category hub — popular searches title ({`{category}`} allowed)</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={categoryPopularSearchesTitle}
              onChange={(e) => setCategoryPopularSearchesTitle(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Newsletter — readers say heading</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={newsletterReadersSayTitle}
              onChange={(e) => setNewsletterReadersSayTitle(e.target.value)}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Search — eyebrow</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={searchIntroEyebrow}
              onChange={(e) => setSearchIntroEyebrow(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Search — main title</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={searchIntroTitle}
              onChange={(e) => setSearchIntroTitle(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Search — intro paragraph</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={searchIntroDek}
              onChange={(e) => setSearchIntroDek(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium">Search — “trending” rail title (empty query)</span>
            <input
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={searchTrendingTitle}
              onChange={(e) => setSearchTrendingTitle(e.target.value)}
            />
          </label>
        </div>
      </SettingsCard>

      <details className="rounded-2xl border border-border bg-card/60 p-5">
        <summary className="cursor-pointer font-medium text-foreground">Optional: rename other section headings</summary>
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">“Most pinned” / trending row title</span>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={sectionMostPinnedTitle}
              onChange={(e) => setSectionMostPinnedTitle(e.target.value)}
              placeholder="Default if empty"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">“Most pinned” subtitle</span>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={sectionMostPinnedDek}
              onChange={(e) => setSectionMostPinnedDek(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">“Fresh from the editors” title</span>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={sectionFreshEditorsTitle}
              onChange={(e) => setSectionFreshEditorsTitle(e.target.value)}
              placeholder="Default if empty"
            />
          </label>
        </div>
      </details>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:static md:z-0 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground md:max-w-md">
             Save to update the live homepage. Need images elsewhere too? Use <strong>Media</strong> in the menu.
          </p>
          <button
            type="button"
            disabled={busy}
            className="cursor-pointer rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
            onClick={() => void save()}
          >
            {busy ? "Saving…" : "Save homepage"}
          </button>
        </div>
      </div>
    </div>
  );
}
