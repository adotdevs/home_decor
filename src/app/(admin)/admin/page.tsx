export const dynamic = "force-dynamic";

import Link from "next/link";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { analyticsSummary } from "@/services/analytics-service";
import {
  BarChart2,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  PlusCircle,
  Tag,
  TrendingUp,
} from "lucide-react";

async function getDashboardData() {
  await connectDb();
  const [summary, recentArticles, publishedCount, draftCount, scheduledCount] = await Promise.all([
    analyticsSummary(30),
    Article.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug status publishedAt createdAt")
      .lean(),
    Article.countDocuments({ status: "published" }),
    Article.countDocuments({ status: "draft" }),
    Article.countDocuments({
      status: "draft",
      scheduledPublishAt: { $ne: null, $gt: new Date() },
    }),
  ]);
  return { summary, recentArticles, publishedCount, draftCount, scheduledCount };
}

const quickActions = [
  {
    href: "/admin/articles/create",
    label: "Create article",
    icon: PlusCircle,
    color: "bg-amber-500 hover:bg-amber-400",
  },
  {
    href: "/admin/analytics",
    label: "View analytics",
    icon: BarChart2,
    color: "bg-sky-600 hover:bg-sky-500",
  },
  {
    href: "/admin/media",
    label: "Media library",
    icon: ImageIcon,
    color: "bg-violet-600 hover:bg-violet-500",
  },
  {
    href: "/admin/ads",
    label: "Manage ads",
    icon: Tag,
    color: "bg-rose-600 hover:bg-rose-500",
  },
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default async function AdminDashboardPage() {
  const { summary, recentArticles, publishedCount, draftCount, scheduledCount } =
    await getDashboardData();

  const kpis = [
    {
      label: "Visits (30d)",
      value: fmt(summary.visits),
      sub: "unique sessions tracked",
      icon: TrendingUp,
      color: "text-amber-600",
    },
    {
      label: "Page views (30d)",
      value: fmt(summary.pageViews),
      sub: "individual pages loaded",
      icon: LayoutDashboard,
      color: "text-sky-600",
    },
    {
      label: "Clicks (30d)",
      value: fmt(summary.clicks),
      sub: "internal link clicks",
      icon: BarChart2,
      color: "text-violet-600",
    },
    {
      label: "CTR",
      value: `${summary.ctr.toFixed(1)}%`,
      sub: "clicks ÷ page views",
      icon: FileText,
      color: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Operational overview — last 30 days</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <p className="mt-2 font-heading text-3xl font-bold">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow transition ${action.color}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent articles */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent articles</h2>
            <Link
              href="/admin/articles"
              className="text-xs font-medium text-amber-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {(recentArticles as Record<string, unknown>[]).map((a) => (
              <li key={String(a.slug)} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/admin/articles/${a.slug}/edit`}
                    className="text-sm font-medium leading-snug text-foreground hover:text-amber-600 line-clamp-1"
                  >
                    {String(a.title)}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.publishedAt
                      ? new Date(a.publishedAt as string).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not published"}
                  </p>
                </div>
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    a.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800"
                  }`}
                >
                  {String(a.status)}
                </span>
              </li>
            ))}
            {recentArticles.length === 0 && (
              <li className="px-5 py-6 text-center text-sm text-muted-foreground">
                No articles yet.{" "}
                <Link href="/admin/articles/create" className="text-amber-600 hover:underline">
                  Create one
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* DB status */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Content status</h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Published
              </span>
              <span className="font-semibold">{publishedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-neutral-400" />
                Draft
              </span>
              <span className="font-semibold">{draftCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                Scheduled
              </span>
              <span className="font-semibold">{scheduledCount}</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="font-semibold">{publishedCount + draftCount}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                MongoDB connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top pages */}
      {summary.topPages.length > 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Top pages (30 days)</h2>
          </div>
          <ul className="divide-y divide-border">
            {(summary.topPages as { _id: string; count: number }[]).slice(0, 8).map((p) => (
              <li key={p._id} className="flex items-center justify-between px-5 py-2.5">
                <span className="truncate text-sm text-muted-foreground">{p._id || "/"}</span>
                <span className="shrink-0 pl-4 text-sm font-semibold">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
