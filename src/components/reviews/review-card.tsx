"use client";

import { formatDistanceToNow } from "date-fns";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, ThumbsUp, Pencil, Trash2 } from "lucide-react";
import { GeneratedReviewAvatar } from "@/components/reviews/generated-avatar";
import { StarDisplay } from "@/components/reviews/star-display";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicReview, ReviewSort, ReviewSummary } from "@/types/article-review";

export function ReviewCard({
  review,
  voterKey,
  onHelpful,
  onEdit,
  onDelete,
  helpfulBusy,
  isOwner,
}: {
  review: PublicReview;
  voterKey: string;
  onHelpful: (id: string) => void;
  onEdit: (r: PublicReview) => void;
  onDelete: (r: PublicReview) => void;
  helpfulBusy: string | null;
  isOwner: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0.98, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/90 via-white/70 to-white/40 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/[0.08] dark:from-white/[0.07] dark:via-white/[0.04] dark:to-transparent dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)]",
        review.isPinned && "ring-1 ring-amber-400/40",
      )}
    >
      {review.isPinned ? (
        <span className="absolute right-4 top-4 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-100">
          Featured
        </span>
      ) : null}
      <div className="flex gap-4">
        <GeneratedReviewAvatar username={review.username} styleIndex={review.avatarStyle} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-semibold text-foreground">{review.username}</h3>
            {review.verified ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Verified
              </span>
            ) : null}
          </div>
          <time className="mt-0.5 block text-xs text-muted-foreground" dateTime={review.createdAt}>
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </time>
          <div className="mt-2">
            <StarDisplay rating={review.rating} size="sm" />
          </div>
          <h4 className="mt-3 font-heading text-base font-semibold leading-snug">{review.reviewTitle}</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{review.reviewText}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!voterKey || helpfulBusy === review.id}
              onClick={() => onHelpful(review.id)}
              className="gap-1.5 rounded-full border-black/10 bg-white/50 backdrop-blur-sm dark:bg-white/5"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful
              <span className="tabular-nums text-muted-foreground">({review.helpfulCount})</span>
            </Button>
            {isOwner ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 rounded-full"
                  onClick={() => onEdit(review)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 rounded-full text-destructive hover:text-destructive"
                  onClick={() => onDelete(review)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
