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

export function DashboardCharts({ data }: { data: AnalyticsDashboard }) {
  const series = data.series.map((s) => ({
    ...s,
    day: s.date.slice(5),
  }));

  const devices = data.devices.map((d) => ({ name: d.device, count: d.count }));
  const countries = data.countries.slice(0, 8).map((c) => ({
    name: c.country || "—",
    count: c.count,
  }));

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
        <h3 className="font-heading text-lg font-semibold">Top countries</h3>
        <p className="mt-1 text-xs text-muted-foreground">From edge geo headers when available</p>
        <div className="mt-6 h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries.length ? countries : [{ name: "—", count: 0 }]} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" horizontal />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" name="Views" fill="oklch(0.55 0.1 65)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
