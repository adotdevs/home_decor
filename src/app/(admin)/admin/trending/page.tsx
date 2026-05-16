import Link from "next/link";
import { TrendingManager } from "@/components/admin/trending-manager";

export default function TrendingAdminPage() {
  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-3xl font-semibold">Trending & engagement</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Control which stories surface on <Link href="/trending" className="text-primary hover:underline">Trending</Link> and
            homepage modules that respect <strong>exclude from trending</strong>. Homepage hero, rails, and feed pins are edited on{" "}
            <Link href="/admin/homepage" className="text-primary hover:underline">
              Homepage & featured
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/articles/create"
          className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
        >
          New article
        </Link>
      </div>
      <TrendingManager />
    </div>
  );
}
