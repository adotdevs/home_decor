export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";

export default async function Page() {
  await connectDb();
  const rows = await Article.find().sort({ updatedAt: -1 }).limit(100).lean();

  return (
    <div className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-4">
        <h1 className="min-w-0 font-heading text-3xl">Articles</h1>
        <Link
          href="/admin/articles/create"
          className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
        >
          Create
        </Link>
      </div>
      <div className="space-y-2">
        {(rows as Record<string, unknown>[]).map((a) => {
          const scheduled = a.scheduledPublishAt ? new Date(String(a.scheduledPublishAt)) : null;
          const tr = a.trendingRank;
          const rankLabel =
            tr != null && tr !== "" && Number.isFinite(Number(tr)) ? `Trending #${Number(tr)}` : null;
          const ex = Boolean(a.excludeFromTrending);
          const pubAt = a.publishedAt ? new Date(String(a.publishedAt)) : null;
          return (
            <div key={String(a.slug)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{String(a.title)}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{String(a.status)}</span>
                  {pubAt && !Number.isNaN(pubAt.getTime()) && a.status === "published" ? (
                    <span>Published {pubAt.toLocaleDateString()}</span>
                  ) : null}
                  {scheduled && !Number.isNaN(scheduled.getTime()) && a.status === "draft" ? (
                    <span>Scheduled {scheduled.toLocaleString()}</span>
                  ) : null}
                  {rankLabel ? <span className="text-primary">{rankLabel}</span> : null}
                  {ex ? <span className="text-amber-700 dark:text-amber-400">Excluded from trending</span> : null}
                  {typeof a.popularityScore === "number" && a.popularityScore > 0 ? (
                    <span>Engagement {a.popularityScore}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/articles/${a.slug}/edit`}
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </Link>
                <Link href="/admin/trending" className="cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline">
                  Trending
                </Link>
                <DeleteArticleButton slug={String(a.slug)} label="Delete" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
