"use client";

import type { AboutMarketingPayload, AboutPillar, AboutStat, AboutTeamMember } from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState } from "react";

export function AboutMarketingEditor({ initial }: { initial: AboutMarketingPayload }) {
  const [data, setData] = useState(initial);
  const { save, busy, msg } = useMarketingPatch("about");

  function setStat(i: number, field: keyof AboutStat, v: string) {
    setData((d) => {
      const stats = [...d.stats];
      const row = stats[i];
      if (!row) return d;
      stats[i] = { ...row, [field]: v };
      return { ...d, stats };
    });
  }

  function setPillar(i: number, field: keyof AboutPillar, v: string) {
    setData((d) => {
      const pillars = [...d.pillars];
      const row = pillars[i];
      if (!row) return d;
      pillars[i] = { ...row, [field]: v };
      return { ...d, pillars };
    });
  }

  function setTeam(i: number, field: keyof AboutTeamMember, v: string) {
    setData((d) => {
      const team = [...d.team];
      const row = team[i];
      if (!row) return d;
      team[i] = { ...row, [field]: v };
      return { ...d, team };
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Public page: /about</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mission page — hero, stats, pillars, team, newsletter CTA, SEO.</p>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — SEO & Open Graph</h2>
        <label className="block text-sm">
          <span className="text-muted-foreground">Browser title</span>
          <textarea
            className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.metaTitle}
            onChange={(e) => setData((d) => ({ ...d, metaTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Meta description</span>
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.metaDescription}
            onChange={(e) => setData((d) => ({ ...d, metaDescription: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Open Graph title</span>
          <textarea
            className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.ogTitle}
            onChange={(e) => setData((d) => ({ ...d, ogTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Open Graph description</span>
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.ogDescription}
            onChange={(e) => setData((d) => ({ ...d, ogDescription: e.target.value }))}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — hero banner</h2>
        <label className="block text-sm">
          <span className="text-muted-foreground">Eyebrow</span>
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroEyebrow}
            onChange={(e) => setData((d) => ({ ...d, heroEyebrow: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Title</span>
          <textarea
            className="mt-1 min-h-[52px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroTitle}
            onChange={(e) => setData((d) => ({ ...d, heroTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Lead paragraph</span>
          <textarea
            className="mt-1 min-h-[88px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroLead}
            onChange={(e) => setData((d) => ({ ...d, heroLead: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Optional hero background image URL (absolute or /path)</span>
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroBackgroundImageSrc}
            onChange={(e) => setData((d) => ({ ...d, heroBackgroundImageSrc: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted-foreground">Hero image alt text</span>
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.heroBackgroundImageAlt}
            onChange={(e) => setData((d) => ({ ...d, heroBackgroundImageAlt: e.target.value }))}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — stats row</h2>
        {data.stats.map((s, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm">
              Stat {i + 1} value
              <input
                className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={s.value}
                onChange={(e) => setStat(i, "value", e.target.value)}
              />
            </label>
            <label className="text-sm">
              Stat {i + 1} label
              <input
                className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
                value={s.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
              />
            </label>
          </div>
        ))}
      </section>

      <section className="space-y-6 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — pillars (“What we believe”)</h2>
        <label className="block text-sm">
          Section title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.pillarsIntroTitle}
            onChange={(e) => setData((d) => ({ ...d, pillarsIntroTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Section intro
          <textarea
            className="mt-1 min-h-[60px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.pillarsIntroBody}
            onChange={(e) => setData((d) => ({ ...d, pillarsIntroBody: e.target.value }))}
          />
        </label>
        {data.pillars.map((p, i) => (
          <div key={i} className="space-y-2 border-t pt-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Pillar {i + 1}</p>
            <input
              placeholder="Icon (e.g. ✦)"
              className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
              value={p.icon}
              onChange={(e) => setPillar(i, "icon", e.target.value)}
            />
            <input
              placeholder="Title"
              className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
              value={p.title}
              onChange={(e) => setPillar(i, "title", e.target.value)}
            />
            <textarea
              placeholder="Body"
              className="min-h-[72px] w-full rounded-lg border bg-background px-2 py-1.5 text-sm"
              value={p.body}
              onChange={(e) => setPillar(i, "body", e.target.value)}
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — “How we write”</h2>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.howWeWriteTitle}
            onChange={(e) => setData((d) => ({ ...d, howWeWriteTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Paragraph 1
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.howWeWriteParagraph1}
            onChange={(e) => setData((d) => ({ ...d, howWeWriteParagraph1: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Paragraph 2
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.howWeWriteParagraph2}
            onChange={(e) => setData((d) => ({ ...d, howWeWriteParagraph2: e.target.value }))}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — team</h2>
        <label className="block text-sm">
          Section title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.teamSectionTitle}
            onChange={(e) => setData((d) => ({ ...d, teamSectionTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Section intro
          <textarea
            className="mt-1 min-h-[60px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.teamSectionIntro}
            onChange={(e) => setData((d) => ({ ...d, teamSectionIntro: e.target.value }))}
          />
        </label>
        {data.team.map((member, i) => (
          <div key={i} className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold">Team member {i + 1}</p>
            {(["name", "role", "href", "initial", "colorClass"] as const).map((field) => (
              <input
                key={field}
                placeholder={field}
                className="w-full rounded border bg-background px-2 py-1.5 text-sm"
                value={member[field]}
                onChange={(e) => setTeam(i, field, e.target.value)}
              />
            ))}
            <textarea
              placeholder="Bio"
              className="min-h-[60px] w-full rounded border bg-background px-2 py-1.5 text-sm"
              value={member.bio}
              onChange={(e) => setTeam(i, "bio", e.target.value)}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-medium text-primary underline"
          onClick={() =>
            setData((d) => ({
              ...d,
              team: [
                ...d.team,
                {
                  name: "",
                  role: "",
                  bio: "",
                  href: "",
                  initial: "?",
                  colorClass: "bg-amber-100 text-amber-700",
                },
              ],
            }))
          }
        >
          Add team member
        </button>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-4">
        <h2 className="font-semibold">About page — newsletter CTA strip</h2>
        <label className="block text-sm">
          Title
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.newsletterCtaTitle}
            onChange={(e) => setData((d) => ({ ...d, newsletterCtaTitle: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Body
          <textarea
            className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.newsletterCtaBody}
            onChange={(e) => setData((d) => ({ ...d, newsletterCtaBody: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Button label
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={data.newsletterCtaButtonLabel}
            onChange={(e) => setData((d) => ({ ...d, newsletterCtaButtonLabel: e.target.value }))}
          />
        </label>
      </section>

      {msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => save(data as unknown as Record<string, unknown>)}
        className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
