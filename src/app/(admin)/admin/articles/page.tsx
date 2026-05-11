export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";

export default async function Page() {
  await connectDb();
  const rows = await Article.find().sort({ updatedAt: -1 }).limit(100).lean();

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Articles</h1>
        <Link
          href="/admin/articles/create"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
        >
          Create
        </Link>
      </div>
      <div className="space-y-2">
        {(rows as Record<string, unknown>[]).map((a) => {
          const scheduled = a.scheduledPublishAt ? new Date(String(a.scheduledPublishAt)) : null;
          return (
            <div key={String(a.slug)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{String(a.title)}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{String(a.status)}</span>
                  {scheduled && !Number.isNaN(scheduled.getTime()) && a.status === "draft" ? (
                    <span>Scheduled {scheduled.toLocaleString()}</span>
                  ) : null}
                </div>
              </div>
              <Link href={`/admin/articles/${a.slug}/edit`} className="text-sm font-medium text-primary hover:underline">
                Edit
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
