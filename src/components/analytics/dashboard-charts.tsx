"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { type AnalyticsDashboard } from "@/types/analytics-dashboard";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };

const COUNTRY_BAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
  "from-lime-500 to-green-500",
  "from-red-500 to-rose-400",
  "from-cyan-500 to-sky-400",
  "from-fuchsia-500 to-purple-500",
] as const;

function countryDisplayName(code: string): string {
  const raw = (code || "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (!raw) return "Unknown";
  if (raw.length !== 2) return code.trim() || "Unknown";
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const name = dn.of(raw);
    if (name && name !== raw) return name;
  } catch {
    /* ignore */
  }
  return raw;
}

export function DashboardCharts({ data }: { data: AnalyticsDashboard }) {
  const series = data.series.map((s) => ({
    ...s,
    day: s.date.slice(5),
  }));

  const devices = data.devices.map((d) => ({ name: d.device, count: d.count }));
  const countriesRanked = [...data.countries].sort((a, b) => b.count - a.count).slice(0, 10);
  const maxCountryCount = Math.max(1, ...countriesRanked.map((c) => c.count));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold">Traffic over time</h3>
          <span className="text-xs text-muted-foreground">Daily</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Page views, clicks, and new sessions</p>
        <div className="mt-6 h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.12 65)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.55 0.12 65)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.12 250)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.55 0.12 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
              <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.9 0.01 85)",
                  background: "oklch(0.99 0.01 85)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="pageViews"
                name="Page views"
                stroke="oklch(0.5 0.12 65)"
                fill="url(#pv)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                name="Clicks"
                stroke="oklch(0.45 0.14 250)"
                fill="url(#clk)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="oklch(0.45 0.08 310)"
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-heading text-lg font-semibold">Top countries</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Unique visitors per country (session geo from edge headers or client lookup). One visitor can appear in
              multiple countries if sessions geo differs.
            </p>
          </div>
          {countriesRanked.length > 0 ? (
            <span className="rounded-full border border-border/80 bg-muted/30 px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground">
              Peak {maxCountryCount.toLocaleString()} visitors
            </span>
          ) : null}
        </div>
        <div className="mt-6 max-h-[min(22rem,70vh)] space-y-4 overflow-y-auto pr-1">
          {countriesRanked.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No country breakdown yet for this period.
            </p>
          ) : (
            countriesRanked.map((row, i) => {
              const label = countryDisplayName(row.country);
              const pct = (row.count / maxCountryCount) * 100;
              const vsLeader =
                maxCountryCount > 0 ? Math.round((row.count / maxCountryCount) * 1000) / 10 : 0;
              const grad = COUNTRY_BAR_GRADIENTS[i % COUNTRY_BAR_GRADIENTS.length];
              return (
                <div key={`${row.country}-${i}`} className="group min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span
                      className="min-w-0 truncate text-sm font-medium leading-tight text-foreground"
                      title={`${label} (${row.country})`}
                    >
                      {label}
                    </span>
                    <div className="flex shrink-0 items-center gap-2 tabular-nums">
                      <span className="text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                        {vsLeader}% of top
                      </span>
                      <span className="text-sm font-semibold text-foreground">{row.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/50 dark:bg-muted/30"
                    role="presentation"
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${grad} opacity-90 shadow-sm transition-[width] duration-700 ease-out dark:opacity-85`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card to-card/80 p-5 shadow-sm lg:col-span-2">
        <h3 className="font-heading text-lg font-semibold">Devices</h3>
        <div className="mt-6 h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={devices.length ? devices : [{ name: "—", count: 0 }]} margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.5 0.12 250)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
