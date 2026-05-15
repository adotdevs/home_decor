"use client";

import type { BenefitCard, NewsletterMarketingPayload, PeekPreviewImage } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function NewsletterMarketingEditor({ initial }: { initial: NewsletterMarketingPayload }) {
  const [data, setData] = useState(initial);
  const [reviewIdsText, setReviewIdsText] = useState((initial.featuredReviewIds ?? []).join("\n"));
  const { save, busy, msg } = useMarketingPatch("newsletter");

  function setBenefit(i: number, field: keyof BenefitCard, v: string) {
    setData((d) => {
      const benefits = [...d.benefits];
      const row = benefits[i];
      if (!row) return d;
      benefits[i] = { ...row, [field]: v };
      return { ...d, benefits };
    });
  }

  function setPeek(i: number, field: keyof PeekPreviewImage, v: string) {
    setData((d) => {
      const peekImages = [...d.peekImages];
      const row = peekImages[i];
      if (!row) return d;
      peekImages[i] = { ...row, [field]: v };
      return { ...d, peekImages };
    });
  }

  function persistReviewIds(): string[] {
    return reviewIdsText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  function handleSave() {
    const featuredReviewIds = persistReviewIds();
    save({ ...(data as unknown as Record<string, unknown>), featuredReviewIds });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Public page: /newsletter</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Newsletter landing — hero, benefits, inbox preview mock, reviews section fallbacks, SEO. Placeholders: {" "}
          <code className="rounded bg-muted px-1">{"{highlight}"}</code>,{" "}
          <code className="rounded bg-muted px-1">{"{siteName}"}</code>.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — SEO</h2>
        <label className="block text-sm">
          Meta title (site name appended automatically)
          <textarea
            className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.metaTitle}
            onChange={(e) => setData((d) => ({ ...d, metaTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Meta description
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.metaDescription}
            onChange={(e) => setData((d) => ({ ...d, metaDescription: e.target.value }))}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — hero</h2>
        {(["heroEyebrow", "heroTitle"] as const).map((key) => (
          <label key={key} className="block text-sm capitalize">
            {key.replace(/([A-Z])/g, " $1")}
            <textarea
              className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={data[key]}
              onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
            />
          </label>
        ))}
        <label className="block text-sm">
          Hero lead when subscriber milestone shown (uses {"{highlight}"} and {"{siteName}"})
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroLeadWithHighlight}
            onChange={(e) => setData((d) => ({ ...d, heroLeadWithHighlight: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Hero lead when milestone hidden (uses {"{siteName}"})
          <textarea
            className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroLeadWithoutHighlight}
            onChange={(e) => setData((d) => ({ ...d, heroLeadWithoutHighlight: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Fine print under signup
          <textarea
            className="mt-1 min-h-[36px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.footerDisclaimer}
            onChange={(e) => setData((d) => ({ ...d, footerDisclaimer: e.target.value }))}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — “What you’ll get”</h2>
        <label className="block text-sm">
          Section title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.benefitsSectionTitle}
            onChange={(e) => setData((d) => ({ ...d, benefitsSectionTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Section intro
          <textarea
            className="mt-1 min-h-[52px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.benefitsSectionIntro}
            onChange={(e) => setData((d) => ({ ...d, benefitsSectionIntro: e.target.value }))}
          />
        </label>
        {data.benefits.map((b, i) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 text-xs font-semibold">Benefit card {i + 1}</p>
            <input
              placeholder="Title"
              className="mb-2 w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={b.title}
              onChange={(e) => setBenefit(i, "title", e.target.value)}
            />
            <textarea
              placeholder="Description"
              className="min-h-[60px] w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={b.description}
              onChange={(e) => setBenefit(i, "description", e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-medium text-primary underline"
          onClick={() => setData((d) => ({ ...d, benefits: [...d.benefits, { title: "", description: "" }] }))}
        >
          Add benefit card
        </button>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — “A peek inside” mock email</h2>
        <label className="block text-sm">
          Section title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.peekSectionTitle}
            onChange={(e) => setData((d) => ({ ...d, peekSectionTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Section intro
          <textarea
            className="mt-1 min-h-[52px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.peekSectionIntro}
            onChange={(e) => setData((d) => ({ ...d, peekSectionIntro: e.target.value }))}
          />
        </label>
        {(
          [
            ["peekEmailFromPrefix", "From line label"],
            ["peekEmailFromBody", "From line value ({siteName})"],
            ["peekEmailSubjectPrefix", "Subject line label"],
            ["peekEmailSubjectHighlight", "Subject preview highlight"],
          ] as const
        ).map(([key, lab]) => (
          <label key={key} className="block text-sm">
            {lab}
            <textarea
              className="mt-1 min-h-[36px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={String(data[key])}
              onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
            />
          </label>
        ))}
        <label className="block text-sm">
          Inner card title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.peekInnerTitle}
            onChange={(e) => setData((d) => ({ ...d, peekInnerTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Inner card body copy
          <textarea
            className="mt-1 min-h-[100px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.peekInnerBody}
            onChange={(e) => setData((d) => ({ ...d, peekInnerBody: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Fake “Read full issue” chip label
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.peekReadFullCta}
            onChange={(e) => setData((d) => ({ ...d, peekReadFullCta: e.target.value }))}
          />
        </label>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Preview images (URLs)</p>
        {data.peekImages.map((img, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm">
              Image {i + 1} URL
              <input
                className="mt-1 w-full rounded border bg-background px-2 py-1.5 text-sm"
                value={img.src}
                onChange={(e) => setPeek(i, "src", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Alt text
              <input
                className="mt-1 w-full rounded border bg-background px-2 py-1.5 text-sm"
                value={img.alt}
                onChange={(e) => setPeek(i, "alt", e.target.value)}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-medium text-primary underline"
          onClick={() => setData((d) => ({ ...d, peekImages: [...d.peekImages, { src: "", alt: "" }] }))}
        >
          Add preview image row
        </button>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — reader quotes block</h2>
        <p className="text-sm text-muted-foreground">
          Heading above quotes still comes from Homepage settings (“Newsletter readers say”). Empty fallback copy below shows when no
          quotes load.
        </p>
        <label className="block text-sm">
          Empty-state body (when no reviews available)
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.reviewsFallbackCopy}
            onChange={(e) => setData((d) => ({ ...d, reviewsFallbackCopy: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Featured review IDs (Mongo <code className="rounded bg-muted px-1">ArticleReview</code> ids, one per line — leave blank for
          automatic picks)
          <textarea
            className="mt-1 min-h-[88px] w-full rounded-lg border bg-background px-3 py-2 font-mono text-xs"
            value={reviewIdsText}
            onChange={(e) => setReviewIdsText(e.target.value)}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Newsletter page — bottom CTA</h2>
        <label className="block text-sm">
          Prompt when milestone visible ({"{highlight}"})
          <textarea
            className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.bottomPromptWithHighlight}
            onChange={(e) => setData((d) => ({ ...d, bottomPromptWithHighlight: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Prompt when milestone hidden
          <textarea
            className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.bottomPromptWithoutHighlight}
            onChange={(e) => setData((d) => ({ ...d, bottomPromptWithoutHighlight: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Subscribe button label
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.bottomSubscribeCta}
            onChange={(e) => setData((d) => ({ ...d, bottomSubscribeCta: e.target.value }))}
          />
        </label>
      </section>

      {msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={handleSave}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
