"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Loader2, Send, Sparkles } from "lucide-react";
import { StarDisplay } from "@/components/reviews/star-display";
import { Button } from "@/components/ui/button";

const schema = z.object({
  username: z.string().min(2, "Add your name").max(80),
  email: z.string().email("Valid email required"),
  rating: z.number().min(1).max(5),
  reviewTitle: z.string().min(2, "Short headline required").max(200),
  reviewText: z.string().min(20, "A bit more detail helps readers").max(5000),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ReviewForm({
  articleSlug,
  onSubmitted,
}: {
  articleSlug: string;
  onSubmitted: () => void;
}) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: 5,
      username: "",
      email: "",
      reviewTitle: "",
      reviewText: "",
      website: "",
    },
  });

  const rating = watch("rating");

  async function onSubmit(data: FormValues) {
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; ownerToken?: string; review?: { id: string } };
      if (!res.ok) throw new Error(json.error || "Could not submit");
      const token = json.ownerToken;
      const id = json.review?.id;
      if (token && id) {
        localStorage.setItem(
          `homeDecorReviewOwner:${articleSlug}`,
          JSON.stringify({ reviewId: id, ownerToken: token }),
        );
      }
      reset({ ...data, reviewText: "", reviewTitle: "", website: "", rating: 5 });
      setDone(true);
      onSubmitted();
      window.setTimeout(() => setDone(false), 4200);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/95 via-amber-50/20 to-white/80 p-6 shadow-[0_16px_48px_-20px_rgba(180,130,80,0.35)] backdrop-blur-xl dark:border-white/[0.08] dark:from-white/[0.06] dark:via-amber-950/20 dark:to-transparent md:p-8"
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700/90 dark:text-amber-200/90">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Write a review
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Share how this guide worked in your home — thoughtful reviews help thousands of readers decide what to try next.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* honeypot */}
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground">Display name</label>
            <input
              className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-black/20"
              placeholder="e.g. Alex M."
              {...register("username")}
            />
            {errors.username ? <p className="mt-1 text-xs text-destructive">{errors.username.message}</p> : null}
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Email (private)</label>
            <input
              type="email"
              className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-black/20"
              placeholder="you@email.com"
              {...register("email")}
            />
            {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-foreground">Your rating</span>
          <div className="mt-2 flex items-center gap-3">
            <StarDisplay rating={rating} interactive size="lg" onChange={(n) => setValue("rating", n, { shouldValidate: true })} />
            <span className="text-sm tabular-nums text-muted-foreground">{rating} / 5</span>
          </div>
          {errors.rating ? <p className="mt-1 text-xs text-destructive">{errors.rating.message}</p> : null}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Headline</label>
          <input
            className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-black/20"
            placeholder="Sum it up in one elegant line"
            {...register("reviewTitle")}
          />
          {errors.reviewTitle ? <p className="mt-1 text-xs text-destructive">{errors.reviewTitle.message}</p> : null}
        </div>

        <div>
          <label className="text-xs font-medium text-foreground">Your review</label>
          <textarea
            rows={5}
            className="mt-1.5 w-full resize-y rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm leading-relaxed shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-black/20"
            placeholder="What did you try, love, or change? Specifics make reviews genuinely useful."
            {...register("reviewText")}
          />
          {errors.reviewText ? <p className="mt-1 text-xs text-destructive">{errors.reviewText.message}</p> : null}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-11 rounded-full px-8">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publish review
            </>
          )}
        </Button>
      </form>

      <AnimatePresence>
        {done ? (
          <motion.div
            initial={reduce ? false : { opacity: 0.96, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.9 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-white/85 backdrop-blur-md dark:bg-black/70"
          >
            <p className="font-heading text-lg font-semibold text-emerald-700 dark:text-emerald-300">Thank you — your review is live.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
