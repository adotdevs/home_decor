"use client";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis } from "recharts";
export function OverviewChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return <div className="h-72 w-full rounded-2xl border bg-card p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><CartesianGrid strokeDasharray="4 4" /><XAxis dataKey="label" /><Tooltip /><Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} /></LineChart></ResponsiveContainer></div>;
}