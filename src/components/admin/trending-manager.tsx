"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { parseExcludeFromTrendingFlag } from "@/lib/utils/exclude-from-trending";

type Row = {
  slug: string;
  title: string;
  status: string;
  trendingRank?: number | null;
  excludeFromTrending?: boolean;
  popularityScore?: number;
};

type PreviewItem = { slug: string; title: string };

export function TrendingManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    setError(null);
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/trending", { credentials: "include", cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        articles?: Row[];
        preview?: PreviewItem[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Load failed");
      }
      setRows(data.articles || []);
      setPreview(data.preview || []);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const published = useMemo(() => rows.filter((r) => r.status === "published"), [rows]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return published;
    return published.filter((r) => r.slug.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }, [published, filter]);

  function updateRow(slug: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));
    setDirty(true);
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    try {
      const updates = published.map((r) => ({
        slug: r.slug,
        trendingRank:
          r.trendingRank != null && String(r.trendingRank).trim() !== "" && Number.isFinite(Number(r.trendingRank))
            ? Number(r.trendingRank)
            : null,
        excludeFromTrending: parseExcludeFromTrendingFlag(r.excludeFromTrending),
        popularityScore:
          r.popularityScore != null && String(r.popularityScore).trim() !== "" && Number.isFinite(Number(r.popularityScore))
            ? Number(r.popularityScore)
            : 0,
      }));
      const res = await fetch("/api/admin/trending", {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        preview?: PreviewItem[];
        articles?: Row[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      await load({ silent: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trending data…</p>;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}

      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h2 className="font-heading text-xl font-semibold">Public preview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Order visitors see on <Link href="/trending" className="font-medium text-primary hover:underline">/trending</Link>: manual
          ranks first (lower number = higher), then by engagement score.
        </p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {preview.slice(0, 18).map((p, i) => (
            <li key={p.slug} className="flex min-w-0 gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
              <span className="shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
              <span className="min-w-0">
                <span className="line-clamp-2 font-medium text-foreground">{p.title}</span>
                <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">{p.slug}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold">Published articles</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Set a <strong>manual rank</strong> (0–9999, lower shows first) or leave blank for automatic ordering by engagement score.
              Exclude removes the story from trending and homepage &ldquo;most pinned&rdquo; rails.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Filter by title or slug…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="min-w-[12rem] rounded-xl border bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={saving || !dirty}
              onClick={() => void saveAll()}
              className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
            <button
              type="button"
              onClick={() => void load()}
              className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Reload
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Article</th>
                <th className="pb-2 pr-4 font-medium">Trending rank</th>
                <th className="pb-2 pr-4 font-medium">Engagement</th>
                <th className="pb-2 font-medium">Exclude</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slug} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-foreground">{r.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{r.slug}</span>
                    <Link href={`/admin/articles/${r.slug}/edit`} className="mt-1 inline-block text-xs text-primary hover:underline">
                      Edit article
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      placeholder="Auto"
                      className="w-24 rounded-lg border bg-background px-2 py-1.5 tabular-nums"
                      value={
                        r.trendingRank != null && Number.isFinite(Number(r.trendingRank))
                          ? String(r.trendingRank)
                          : ""
                      }
                      onChange={(e) =>
                        updateRow(r.slug, {
                          trendingRank: e.target.value.trim() === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      className="w-28 rounded-lg border bg-background px-2 py-1.5 tabular-nums"
                      value={r.popularityScore ?? 0}
                      onChange={(e) =>
                        updateRow(r.slug, {
                          popularityScore: e.target.value.trim() === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="py-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={parseExcludeFromTrendingFlag(r.excludeFromTrending)}
                        onChange={(e) => updateRow(r.slug, { excludeFromTrending: e.target.checked })}
                      />
                      <span className="text-muted-foreground">Hide from trending</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No published articles match this filter.</p> : null}
      </section>
    </div>
  );
}
