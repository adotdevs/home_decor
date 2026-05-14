"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Pin,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { StarDisplay } from "@/components/reviews/star-display";
import type { ArticleReviewStatus, PublicReview } from "@/types/article-review";

type AdminReviewRow = PublicReview & {
  email: string;
  status: ArticleReviewStatus;
  articleSlug: string;
};

export function ReviewsAdminClient() {
  const [rows, setRows] = useState<AdminReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ArticleReviewStatus | "all">("all");
  const [articleSlug, setArticleSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = new URL("/api/admin/reviews", window.location.origin);
      if (q.trim()) u.searchParams.set("q", q.trim());
      if (status !== "all") u.searchParams.set("status", status);
      if (articleSlug.trim()) u.searchParams.set("articleSlug", articleSlug.trim());
      u.searchParams.set("page", String(page));
      u.searchParams.set("limit", "25");
      const res = await fetch(u.toString(), { credentials: "include" });
      const data = (await res.json()) as { rows?: AdminReviewRow[]; total?: number; pages?: number };
      setRows(data.rows || []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [q, status, articleSlug, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, patch: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert((j as { error?: string }).error || "Update failed");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Reviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderate reader reviews, verify standout posts, and pin featured picks to the top of article pages.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:flex-wrap md:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-sm"
            placeholder="Search username, email, text…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ArticleReviewStatus | "all");
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="hidden">Hidden</option>
          <option value="spam">Spam</option>
        </select>
        <input
          className="h-10 min-w-[160px] rounded-xl border border-border bg-background px-3 text-sm font-mono"
          placeholder="Article slug filter"
          value={articleSlug}
          onChange={(e) => {
            setArticleSlug(e.target.value);
            setPage(1);
          }}
        />
        <p className="w-full text-xs text-muted-foreground md:w-auto">{total} total</p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm md:flex md:gap-4 md:p-5"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.username}</span>
                  <span className="text-xs text-muted-foreground">{r.email}</span>
                  {r.verified ? (
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-700 dark:text-sky-300">
                      Verified
                    </span>
                  ) : null}
                  {r.isPinned ? (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800 dark:text-amber-200">
                      Pinned
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      r.status === "live"
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                        : r.status === "hidden"
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  /article/{r.articleSlug} ·{" "}
                  <time dateTime={r.createdAt}>{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</time>
                </p>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={r.rating} size="sm" />
                </div>
                <h3 className="font-heading text-base font-semibold">{r.reviewTitle}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">{r.reviewText}</p>
                <p className="text-xs text-muted-foreground">Helpful: {r.helpfulCount}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 md:mt-0 md:w-52 md:shrink-0 md:flex-col md:border-t-0 md:border-l md:pt-0 md:pl-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="justify-start gap-1"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { status: r.status === "live" ? "hidden" : "live" })}
                >
                  {r.status === "live" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {r.status === "live" ? "Hide" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="justify-start gap-1"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { status: "spam" })}
                >
                  Mark spam
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="justify-start gap-1"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { verified: !r.verified })}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {r.verified ? "Unverify" : "Verify"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="justify-start gap-1"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { isPinned: !r.isPinned })}
                >
                  <Pin className="h-3.5 w-3.5" />
                  {r.isPinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="justify-start gap-1"
                  disabled={busyId === r.id}
                  onClick={() => void remove(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            {page} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
