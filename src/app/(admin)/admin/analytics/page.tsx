import Link from "next/link";
import { Activity, BarChart2, Globe, Layers, MousePointer2, Search, TrendingUp, Users } from "lucide-react";
import { getAnalyticsDashboard } from "@/services/analytics-report-service";
import { AnalyticsResetButton } from "@/components/analytics/analytics-reset-button";
import { DashboardCharts } from "@/components/analytics/dashboard-charts";

export const dynamic = "force-dynamic";

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 opacity-40 transition group-hover:opacity-60"
      />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </div>
        <div className={`shrink-0 rounded-xl border bg-background/90 p-2.5 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function fmtDur(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

export default async function AnalyticsPage() {
  const d = await getAnalyticsDashboard(30);

  return (
    <div className="min-w-0 space-y-10 pb-12">
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            First-party metrics: per-tab sessions with a 30-minute inactivity timeout (sessionStorage), heartbeats only for
            live counts (they do not extend session length), visitor IDs in localStorage + cookie, bot filtering,
            debounced search logging from the browser, and marketing attribution from the landing URL.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {d.liveOnlineVisitors} online (3 min)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {d.liveActiveSessions} sessions (5 min)
          </span>
          <AnalyticsResetButton />
          <Link
            href="/admin/search-analytics"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Search queries →
          </Link>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Sessions (30d)"
          value={fmt(d.sessions)}
          hint="Per browser tab; 30m idle (last real page/click/article engagement only)"
          icon={Layers}
          iconClass="border-amber-200/60 text-amber-700 dark:border-amber-900/50 dark:text-amber-400"
        />
        <Kpi
          label="Unique visitors"
          value={fmt(d.uniqueVisitors)}
          hint="Distinct visitor IDs in period"
          icon={Users}
          iconClass="border-sky-200/60 text-sky-700 dark:border-sky-900/50 dark:text-sky-400"
        />
        <Kpi
          label="Page views"
          value={fmt(d.pageViews)}
          hint="Route + query, de-duplicated bursts"
          icon={Activity}
          iconClass="border-violet-200/60 text-violet-700 dark:border-violet-900/50 dark:text-violet-400"
        />
        <Kpi
          label="Clicks"
          value={fmt(d.clicks)}
          hint="Tracked link engagement"
          icon={MousePointer2}
          iconClass="border-rose-200/60 text-rose-700 dark:border-rose-900/50 dark:text-rose-400"
        />
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="CTR"
          value={`${d.ctr.toFixed(2)}%`}
          hint={`Sessions with ≥1 tracked click ÷ sessions. Event density: ${d.ctrEventLevel.toFixed(2)}% (clicks ÷ views)`}
          icon={TrendingUp}
          iconClass="border-amber-200/60 text-amber-800 dark:border-amber-900/50 dark:text-amber-300"
        />
        <Kpi
          label="Bounce rate"
          value={`${d.bounceRatePct.toFixed(1)}%`}
          hint="Sessions with a single page view"
          icon={BarChart2}
          iconClass="border-neutral-200/60 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        />
        <Kpi
          label="Avg. session"
          value={fmtDur(d.avgSessionDurationSec)}
          hint="From last engagement event to session start (capped at 4h)"
          icon={Globe}
          iconClass="border-teal-200/60 text-teal-700 dark:border-teal-900/50 dark:text-teal-400"
        />
        <Kpi
          label="Searches logged"
          value={fmt(d.searchCount)}
          hint={`${fmt(d.searchNoResultCount)} zero-result · debounced client beacon`}
          icon={Search}
          iconClass="border-indigo-200/60 text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-400"
        />
      </div>

      <DashboardCharts data={d} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">Top pages</h3>
          <ul className="mt-4 divide-y divide-border/80">
            {d.topPages.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">No page views yet.</li>
            ) : (
              d.topPages.map((row) => (
                <li key={row.path} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{row.path}</span>
                  <span className="shrink-0 tabular-nums font-semibold">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">Top articles</h3>
          <ul className="mt-4 divide-y divide-border/80">
            {d.topArticles.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">No article detail views yet.</li>
            ) : (
              d.topArticles.map((row) => (
                <li key={row.slug} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/article/${row.slug}`} className="min-w-0 truncate font-medium hover:text-primary hover:underline">
                    {row.slug.replace(/-/g, " ")}
                  </Link>
                  <span className="shrink-0 tabular-nums font-semibold">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">Traffic sources</h3>
          <ul className="mt-4 divide-y divide-border/80">
            {d.topTrafficSources.map((row) => (
              <li key={row.source} className="flex items-center justify-between gap-3 py-3 text-sm capitalize">
                <span className="min-w-0 break-words text-muted-foreground">{row.source.replace(/_/g, " ")}</span>
                <span className="shrink-0 tabular-nums font-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">Top categories (views)</h3>
          <ul className="mt-4 divide-y divide-border/80">
            {d.topCategories.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">No category-tagged views yet.</li>
            ) : (
              d.topCategories.map((row) => (
                <li key={row.slug} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate capitalize text-muted-foreground">{row.slug.replace(/-/g, " ")}</span>
                  <span className="shrink-0 tabular-nums font-semibold">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">Top referrers</h3>
          <ul className="mt-4 divide-y divide-border/80">
            {d.topReferrers.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">Mostly direct traffic so far.</li>
            ) : (
              d.topReferrers.map((row) => (
                <li key={row.host} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 truncate font-mono text-xs">{row.host}</span>
                  <span className="shrink-0 tabular-nums font-semibold">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold">Best CTR pages</h3>
          <p className="mt-1 text-xs text-muted-foreground">Minimum 5 page views · clicks on that URL</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Clicks</th>
                  <th className="px-4 py-3 font-medium">CTR</th>
                </tr>
              </thead>
              <tbody>
                {d.topPagesByCtr.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Not enough data yet (need pages with 5+ views).
                    </td>
                  </tr>
                ) : (
                  d.topPagesByCtr.map((row) => (
                    <tr key={row.path} className="border-t border-border/60">
                      <td className="max-w-[280px] truncate px-4 py-3 font-mono text-xs">{row.path}</td>
                      <td className="px-4 py-3 tabular-nums">{row.views}</td>
                      <td className="px-4 py-3 tabular-nums">{row.clicks}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold">{row.ctrPct.toFixed(2)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold">Top in-site searches (logged)</h3>
          <p className="mt-1 text-xs text-muted-foreground">Matches the Search analytics report (Mongo SearchQuery).</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {d.topSearches.length === 0 ? (
              <span className="text-sm text-muted-foreground">No searches recorded in this window.</span>
            ) : (
              d.topSearches.slice(0, 16).map((s) => (
                <span
                  key={s.query}
                  className="inline-flex max-w-full min-w-0 items-center gap-2 break-words rounded-full border border-border bg-muted/25 px-3 py-1 text-xs font-medium"
                >
                  <span className="min-w-0 break-all">{s.query}</span>
                  <span className="tabular-nums text-muted-foreground">{s.count}×</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
