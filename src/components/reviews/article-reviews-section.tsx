"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewsBreakdown } from "@/components/reviews/reviews-breakdown";
import { StarDisplay } from "@/components/reviews/star-display";
import { ArticleRatingBadge } from "@/components/reviews/article-rating-badge";
import { Button } from "@/components/ui/button";
import type { PublicReview, ReviewSort, ReviewSummary } from "@/types/article-review";

const SORT_TABS: { id: ReviewSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "featured", label: "Featured" },
  { id: "top_rated", label: "Top rated" },
  { id: "helpful", label: "Most helpful" },
];

function ownerStorageKey(slug: string) {
  return `homeDecorReviewOwner:${slug}`;
}

function readOwner(slug: string): { reviewId: string; ownerToken: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ownerStorageKey(slug));
    if (!raw) return null;
    const o = JSON.parse(raw) as { reviewId?: string; ownerToken?: string };
    if (o.reviewId && o.ownerToken) return { reviewId: o.reviewId, ownerToken: o.ownerToken };
  } catch {
    /* */
  }
  return null;
}

function voterKey(): string {
  if (typeof window === "undefined") return "";
  const k = "homeDecorReviewVoter";
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}

type ListResponse = {
  summary: ReviewSummary;
  reviews: PublicReview[];
  total: number;
  page: number;
  pages: number;
  sort: ReviewSort;
};

export function ArticleReviewsSection({
  articleSlug,
  initial,
}: {
  articleSlug: string;
  initial: ListResponse;
}) {
  const reduce = useReducedMotion();
  const [sort, setSort] = useState<ReviewSort>(initial.sort || "newest");
  const [page, setPage] = useState(initial.page || 1);
  const [data, setData] = useState<ListResponse>(initial);
  const [loading, setLoading] = useState(false);
  const [helpfulBusy, setHelpfulBusy] = useState<string | null>(null);
  const [edit, setEdit] = useState<PublicReview | null>(null);
  const [owner, setOwner] = useState<{ reviewId: string; ownerToken: string } | null>(null);
  const [vk, setVk] = useState("");
  const skipNextFetch = useRef(true);

  const refresh = useCallback(async (s: ReviewSort, p: number) => {
    setLoading(true);
    try {
      const u = new URL(`/api/articles/${encodeURIComponent(articleSlug)}/reviews`, window.location.origin);
      u.searchParams.set("sort", s);
      u.searchParams.set("page", String(p));
      u.searchParams.set("limit", "8");
      const res = await fetch(u.toString());
      const json = (await res.json()) as ListResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [articleSlug]);

  useEffect(() => {
    setVk(voterKey());
  }, []);

  useEffect(() => {
    setOwner(readOwner(articleSlug));
  }, [articleSlug]);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    void refresh(sort, page);
  }, [sort, page, refresh]);

  async function onHelpful(id: string) {
    setHelpfulBusy(id);
    try {
      const res = await fetch(
        `/api/articles/${encodeURIComponent(articleSlug)}/reviews/${encodeURIComponent(id)}/helpful`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voterKey: vk }),
        },
      );
      const json = (await res.json()) as { helpfulCount?: number; ok?: boolean };
      if (res.ok && json.helpfulCount != null) {
        setData((d) => ({
          ...d,
          reviews: d.reviews.map((r) => (r.id === id ? { ...r, helpfulCount: json.helpfulCount! } : r)),
        }));
      }
    } finally {
      setHelpfulBusy(null);
    }
  }

  async function onDelete(r: PublicReview) {
    const o = readOwner(articleSlug);
    if (!o || o.reviewId !== r.id) return;
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(
      `/api/articles/${encodeURIComponent(articleSlug)}/reviews/${encodeURIComponent(r.id)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerToken: o.ownerToken }),
      },
    );
    if (res.ok) {
      localStorage.removeItem(ownerStorageKey(articleSlug));
      setOwner(null);
      setPage(1);
      await refresh(sort, 1);
    }
  }

  async function saveEdit() {
    if (!edit) return;
    const o = readOwner(articleSlug);
    if (!o || o.reviewId !== edit.id) return;
    const res = await fetch(
      `/api/articles/${encodeURIComponent(articleSlug)}/reviews/${encodeURIComponent(edit.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerToken: o.ownerToken,
          username: edit.username,
          rating: edit.rating,
          reviewTitle: edit.reviewTitle,
          reviewText: edit.reviewText,
        }),
      },
    );
    const json = (await res.json()) as { review?: PublicReview; error?: string };
    if (!res.ok) {
      alert(json.error || "Could not update");
      return;
    }
    setEdit(null);
    await refresh(sort, page);
  }

  const summary = data.summary;
  const isOwnerRow = (r: PublicReview) => owner?.reviewId === r.id;

  return (
    <section className="mt-16 border-t border-black/5 pt-14 dark:border-white/10" aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="lg:w-[320px] lg:shrink-0">
          <h2 id="reviews-heading" className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Reader reviews
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Real homes, honest takeaways — every star helps this editorial stay useful and trustworthy.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ArticleRatingBadge average={summary.average} count={summary.count} className="text-sm" />
            {summary.count > 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarDisplay rating={Math.round(summary.average)} size="md" />
              </div>
            ) : null}
          </div>
          <div className="mt-8">
            <ReviewsBreakdown breakdown={summary.breakdown} total={summary.count} />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-8">
          <ReviewForm articleSlug={articleSlug} onSubmitted={() => void refresh(sort, 1)} />

          <div>
            <div className="flex flex-wrap gap-2 border-b border-black/5 pb-3 dark:border-white/10">
              {SORT_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSort(t.id);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    sort === t.id
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative mt-8 min-h-[120px] space-y-5">
              {loading ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-background/50 backdrop-blur-sm">
                  <span className="text-sm font-medium text-muted-foreground">Loading…</span>
                </div>
              ) : null}
              <AnimatePresence mode="popLayout">
                {data.reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    voterKey={vk}
                    onHelpful={onHelpful}
                    onEdit={setEdit}
                    onDelete={onDelete}
                    helpfulBusy={helpfulBusy}
                    isOwner={isOwnerRow(r)}
                  />
                ))}
              </AnimatePresence>
              {!loading && data.reviews.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-black/10 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground dark:border-white/10">
                  No reviews yet — be the first to share how this guide worked for your space.
                </p>
              ) : null}
            </div>

            {data.pages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  className="rounded-full"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {page} / {data.pages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  className="rounded-full"
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {edit ? (
          <motion.div
            initial={reduce ? false : { opacity: 0.92 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.88 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Edit review"
            onClick={() => setEdit(null)}
          >
            <motion.div
              initial={reduce ? false : { y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl font-semibold">Edit your review</h3>
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium">Name</label>
                <input
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                  value={edit.username}
                  onChange={(e) => setEdit({ ...edit, username: e.target.value })}
                />
                <label className="block text-xs font-medium">Rating</label>
                <StarDisplay rating={edit.rating} interactive size="md" onChange={(n) => setEdit({ ...edit, rating: n })} />
                <label className="block text-xs font-medium">Headline</label>
                <input
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                  value={edit.reviewTitle}
                  onChange={(e) => setEdit({ ...edit, reviewTitle: e.target.value })}
                />
                <label className="block text-xs font-medium">Review</label>
                <textarea
                  rows={5}
                  className="w-full resize-y rounded-xl border bg-background px-3 py-2 text-sm"
                  value={edit.reviewText}
                  onChange={(e) => setEdit({ ...edit, reviewText: e.target.value })}
                />
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void saveEdit()}>
                  Save changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
