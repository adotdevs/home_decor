"use client";

import type {
  CookiePolicyMarketingPayload,
  CookieTypeRow,
  LegalPageMarketingPayload,
  LegalSection,
  TermsMarketingPayload,
} from "@/types/site-page-marketing";
import { useMarketingPatch } from "@/components/admin/use-marketing-patch";
import { useState, type Dispatch, type SetStateAction } from "react";

function SectionsEditor({
  sections,
  onChange,
  label,
}: {
  sections: LegalSection[];
  onChange: (s: LegalSection[]) => void;
  label: string;
}) {
  function setRow(i: number, field: keyof LegalSection, v: string) {
    const next = [...sections];
    const row = next[i];
    if (!row) return;
    next[i] = { ...row, [field]: v };
    onChange(next);
  }
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">{label}</p>
      {sections.map((s, i) => (
        <div key={i} className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <input
            placeholder={`Section ${i + 1} title`}
            className="w-full rounded border bg-background px-2 py-1.5 text-sm font-medium"
            value={s.title}
            onChange={(e) => setRow(i, "title", e.target.value)}
          />
          <textarea
            placeholder="Body"
            className="min-h-[100px] w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={s.body}
            onChange={(e) => setRow(i, "body", e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-medium text-primary underline"
        onClick={() => onChange([...sections, { title: "", body: "" }])}
      >
        Add section
      </button>
    </div>
  );
}

function FooterLinksFields<T extends LegalPageMarketingPayload>({
  data,
  setData,
}: {
  data: T;
  setData: Dispatch<SetStateAction<T>>;
}) {
  const keys: [keyof LegalPageMarketingPayload, string][] = [
    ["footerLink1Label", "Footer button 1 label"],
    ["footerLink1Href", "Footer button 1 URL path"],
    ["footerLink2Label", "Footer button 2 label"],
    ["footerLink2Href", "Footer button 2 URL path"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {keys.map(([key, lab]) => (
        <label key={String(key)} className="block text-sm">
          {lab}
          <input
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={String(data[key] ?? "")}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                [key]: e.target.value,
              }))
            }
          />
        </label>
      ))}
    </div>
  );
}

function CookieTypesEditor({
  rows,
  onChange,
}: {
  rows: CookieTypeRow[];
  onChange: (r: CookieTypeRow[]) => void;
}) {
  function setRow(i: number, field: keyof CookieTypeRow, v: string | boolean) {
    const next = [...rows];
    const row = next[i];
    if (!row) return;
    next[i] = { ...row, [field]: v };
    onChange(next);
  }
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">Cookie policy page — cookie categories table</p>
      {rows.map((row, i) => (
        <div key={i} className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <input
            placeholder="Category name"
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={row.type}
            onChange={(e) => setRow(i, "type", e.target.value)}
          />
          <textarea
            placeholder="Purpose"
            className="min-h-[72px] w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={row.purpose}
            onChange={(e) => setRow(i, "purpose", e.target.value)}
          />
          <input
            placeholder="Examples"
            className="w-full rounded border bg-background px-2 py-1.5 text-sm"
            value={row.examples}
            onChange={(e) => setRow(i, "examples", e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={row.canDisable} onChange={(e) => setRow(i, "canDisable", e.target.checked)} />
            Readers can disable this category (shows “Optional” badge)
          </label>
        </div>
      ))}
      <button
        type="button"
        className="text-sm font-medium text-primary underline"
        onClick={() => onChange([...rows, { type: "", purpose: "", examples: "", canDisable: true }])}
      >
        Add cookie category
      </button>
    </div>
  );
}

export function LegalMarketingHub({
  privacyInitial,
  termsInitial,
  cookiesInitial,
}: {
  privacyInitial: LegalPageMarketingPayload;
  termsInitial: TermsMarketingPayload;
  cookiesInitial: CookiePolicyMarketingPayload;
}) {
  const [tab, setTab] = useState<"privacy" | "terms" | "cookies">("privacy");
  const [privacy, setPrivacy] = useState(privacyInitial);
  const [terms, setTerms] = useState(termsInitial);
  const [cookies, setCookies] = useState(cookiesInitial);

  const savePrivacy = useMarketingPatch("legal-privacy");
  const saveTerms = useMarketingPatch("legal-terms");
  const saveCookies = useMarketingPatch("legal-cookies");

  return (
    <div className="mx-auto min-w-0 w-full max-w-3xl space-y-6 px-3 py-6 sm:px-4 md:p-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Legal pages — Privacy, Terms & Cookie policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Three separate saves. Each tab maps to the matching public route (<code className="rounded bg-muted px-1">/privacy-policy</code>,{" "}
          <code className="rounded bg-muted px-1">/terms</code>, <code className="rounded bg-muted px-1">/cookie-policy</code>).
        </p>
      </div>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {(
          [
            ["privacy", "Privacy (/privacy-policy)"],
            ["terms", "Terms (/terms)"],
            ["cookies", "Cookies (/cookie-policy)"],
          ] as const
        ).map(([id, lab]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {lab}
          </button>
        ))}
      </div>

      {tab === "privacy" ? (
        <div className="space-y-6">
          <label className="block text-sm">
            Privacy policy — meta title
            <textarea
              className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={privacy.metaTitle}
              onChange={(e) => setPrivacy((p) => ({ ...p, metaTitle: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Privacy policy — meta description
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={privacy.metaDescription}
              onChange={(e) => setPrivacy((p) => ({ ...p, metaDescription: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Privacy policy — page H1
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={privacy.pageH1}
              onChange={(e) => setPrivacy((p) => ({ ...p, pageH1: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Privacy policy — “Last updated” label (display text)
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={privacy.lastUpdatedLabel}
              onChange={(e) => setPrivacy((p) => ({ ...p, lastUpdatedLabel: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Privacy policy — lead paragraph
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={privacy.leadParagraph}
              onChange={(e) => setPrivacy((p) => ({ ...p, leadParagraph: e.target.value }))}
            />
          </label>
          <SectionsEditor
            sections={privacy.sections}
            label="Privacy policy — numbered sections"
            onChange={(sections) => setPrivacy((p) => ({ ...p, sections }))}
          />
          <FooterLinksFields data={privacy} setData={setPrivacy} />
          {savePrivacy.msg ? (
            <p className={`text-sm ${savePrivacy.msg.ok ? "text-green-600" : "text-red-600"}`}>{savePrivacy.msg.text}</p>
          ) : null}
          <button
            type="button"
            disabled={savePrivacy.busy}
            onClick={() => savePrivacy.save(privacy as unknown as Record<string, unknown>)}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {savePrivacy.busy ? "Saving…" : "Save privacy policy"}
          </button>
        </div>
      ) : null}

      {tab === "terms" ? (
        <div className="space-y-6">
          <label className="block text-sm">
            Terms — meta title
            <textarea
              className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={terms.metaTitle}
              onChange={(e) => setTerms((p) => ({ ...p, metaTitle: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Terms — meta description
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={terms.metaDescription}
              onChange={(e) => setTerms((p) => ({ ...p, metaDescription: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Terms — page H1
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={terms.pageH1}
              onChange={(e) => setTerms((p) => ({ ...p, pageH1: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Terms — “Last updated” label
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={terms.lastUpdatedLabel}
              onChange={(e) => setTerms((p) => ({ ...p, lastUpdatedLabel: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Terms — intro paragraph
            <textarea
              className="mt-1 min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={terms.leadParagraph}
              onChange={(e) => setTerms((p) => ({ ...p, leadParagraph: e.target.value }))}
            />
          </label>
          <SectionsEditor
            sections={terms.sections}
            label="Terms — sections"
            onChange={(sections) => setTerms((p) => ({ ...p, sections }))}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              Terms footer — lead text
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={terms.termsFooterLead}
                onChange={(e) => setTerms((p) => ({ ...p, termsFooterLead: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              Terms footer — link label (links to /contact)
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={terms.termsFooterLinkLabel}
                onChange={(e) => setTerms((p) => ({ ...p, termsFooterLinkLabel: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              Terms footer — text after link
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={terms.termsFooterTrail}
                onChange={(e) => setTerms((p) => ({ ...p, termsFooterTrail: e.target.value }))}
              />
            </label>
          </div>
          {saveTerms.msg ? (
            <p className={`text-sm ${saveTerms.msg.ok ? "text-green-600" : "text-red-600"}`}>{saveTerms.msg.text}</p>
          ) : null}
          <button
            type="button"
            disabled={saveTerms.busy}
            onClick={() => saveTerms.save(terms as unknown as Record<string, unknown>)}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {saveTerms.busy ? "Saving…" : "Save terms"}
          </button>
        </div>
      ) : null}

      {tab === "cookies" ? (
        <div className="space-y-6">
          <label className="block text-sm">
            Cookie policy — meta title
            <textarea
              className="mt-1 min-h-[40px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={cookies.metaTitle}
              onChange={(e) => setCookies((p) => ({ ...p, metaTitle: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Cookie policy — meta description
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={cookies.metaDescription}
              onChange={(e) => setCookies((p) => ({ ...p, metaDescription: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Cookie policy — page H1
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={cookies.pageH1}
              onChange={(e) => setCookies((p) => ({ ...p, pageH1: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Cookie policy — “Last updated” label
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={cookies.lastUpdatedLabel}
              onChange={(e) => setCookies((p) => ({ ...p, lastUpdatedLabel: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            Cookie policy — intro under headline
            <textarea
              className="mt-1 min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={cookies.cookieIntro}
              onChange={(e) => setCookies((p) => ({ ...p, cookieIntro: e.target.value }))}
            />
          </label>
          <CookieTypesEditor rows={cookies.cookieTypes} onChange={(cookieTypes) => setCookies((p) => ({ ...p, cookieTypes }))} />
          <SectionsEditor
            sections={cookies.sections}
            label="Cookie policy — prose sections below table"
            onChange={(sections) => setCookies((p) => ({ ...p, sections }))}
          />
          <FooterLinksFields data={cookies} setData={setCookies} />
          {saveCookies.msg ? (
            <p className={`text-sm ${saveCookies.msg.ok ? "text-green-600" : "text-red-600"}`}>{saveCookies.msg.text}</p>
          ) : null}
          <button
            type="button"
            disabled={saveCookies.busy}
            onClick={() => saveCookies.save(cookies as unknown as Record<string, unknown>)}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
          >
            {saveCookies.busy ? "Saving…" : "Save cookie policy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
