import { format, subDays } from "date-fns";
import { connectDb } from "@/lib/db";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { AnalyticsSession } from "@/models/AnalyticsSession";
import { SearchQuery } from "@/models/SearchQuery";
import type { AnalyticsDashboard } from "@/types/analytics-dashboard";

const LIVE_SESSION_WINDOW_MS = 5 * 60 * 1000;
const LIVE_VISITOR_WINDOW_MS = 3 * 60 * 1000;

export type { AnalyticsDashboard } from "@/types/analytics-dashboard";

export async function getAnalyticsDashboard(days: number): Promise<AnalyticsDashboard> {
  await connectDb();
  const safeDays = Math.min(Math.max(1, days), 90);
  const since = subDays(new Date(), safeDays);
  const msPerDay = 24 * 60 * 60 * 1000;
  const sinceDay = new Date(Math.floor(since.getTime() / msPerDay) * msPerDay);

  const [
    sessions,
    uniqueVisitorKeys,
    pageViews,
    clicks,
    searchCount,
    searchNoResultCount,
    sessionDuration,
    bounces,
    live,
    liveVisitors,
    topPagesAgg,
    topArticlesAgg,
    topCategoriesAgg,
    referrersAgg,
    trafficAgg,
    devicesAgg,
    countriesAgg,
    clicksByPath,
    viewsByPath,
    seriesRaw,
    seriesSessionsRaw,
    topSearchesFromApi,
  ] = await Promise.all([
    AnalyticsSession.countDocuments({ startedAt: { $gte: since } }),
    AnalyticsSession.distinct("visitorKey", { startedAt: { $gte: since } }),
    AnalyticsEvent.countDocuments({ type: "page_view", occurredAt: { $gte: since } }),
    AnalyticsEvent.countDocuments({ type: "click", occurredAt: { $gte: since } }),
    SearchQuery.countDocuments({ suggest: false, createdAt: { $gte: since } }),
    SearchQuery.countDocuments({
      suggest: false,
      createdAt: { $gte: since },
      resultCount: 0,
    }),
    AnalyticsSession.aggregate<{ avgSec: number }>([
      { $match: { startedAt: { $gte: since } } },
      {
        $project: {
          sec: {
            $divide: [{ $subtract: ["$lastActivityAt", "$startedAt"] }, 1000],
          },
        },
      },
      { $group: { _id: null, avgSec: { $avg: "$sec" } } },
    ]),
    AnalyticsSession.countDocuments({ startedAt: { $gte: since }, isBounce: true }),
    AnalyticsSession.countDocuments({
      lastActivityAt: { $gte: new Date(Date.now() - LIVE_SESSION_WINDOW_MS) },
    }),
    AnalyticsSession.distinct("visitorKey", {
      lastActivityAt: { $gte: new Date(Date.now() - LIVE_VISITOR_WINDOW_MS) },
    }),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { type: "page_view", occurredAt: { $gte: since } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          type: "page_view",
          occurredAt: { $gte: since },
          articleSlug: { $exists: true, $nin: ["", null] },
        },
      },
      { $group: { _id: "$articleSlug", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          type: "page_view",
          occurredAt: { $gte: since },
          categorySlug: { $exists: true, $nin: ["", null] },
        },
      },
      { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    AnalyticsSession.aggregate<{ _id: string; count: number }>([
      { $match: { startedAt: { $gte: since }, referrerHost: { $nin: ["", null] } } },
      { $group: { _id: "$referrerHost", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    AnalyticsSession.aggregate<{ _id: string; count: number }>([
      { $match: { startedAt: { $gte: since } } },
      { $group: { _id: "$trafficSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { type: "page_view", occurredAt: { $gte: since } } },
      { $group: { _id: "$deviceType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          type: "page_view",
          occurredAt: { $gte: since },
          country: { $exists: true, $nin: ["", null] },
        },
      },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { type: "click", occurredAt: { $gte: since } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { type: "page_view", occurredAt: { $gte: since } } },
      { $group: { _id: "$path", count: { $sum: 1 } } },
    ]),
    AnalyticsEvent.aggregate<{ _id: { d: string; type: string }; count: number }>([
      { $match: { occurredAt: { $gte: sinceDay }, type: { $in: ["page_view", "click"] } } },
      {
        $group: {
          _id: {
            d: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" } },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
    ]),
    AnalyticsSession.aggregate<{ _id: string; count: number }>([
      { $match: { startedAt: { $gte: sinceDay } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          count: { $sum: 1 },
        },
      },
    ]),
    SearchQuery.aggregate<{ _id: string; count: number }>([
      { $match: { suggest: false, createdAt: { $gte: since } } },
      { $group: { _id: "$q", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const uniqueVisitors = uniqueVisitorKeys.length;
  const avgSessionDurationSec = Math.round(sessionDuration[0]?.avgSec ?? 0);
  const bounceRatePct = sessions ? Math.round((bounces / sessions) * 1000) / 10 : 0;
  const ctr = pageViews ? Math.round((clicks / pageViews) * 10000) / 100 : 0;

  const seriesMap = new Map<string, { pageViews: number; clicks: number; sessions: number }>();
  for (let i = 0; i < safeDays; i++) {
    const dk = format(subDays(new Date(), i), "yyyy-MM-dd");
    seriesMap.set(dk, { pageViews: 0, clicks: 0, sessions: 0 });
  }

  for (const row of seriesRaw) {
    const day = row._id.d;
    const m = seriesMap.get(day);
    if (!m) continue;
    if (row._id.type === "page_view") m.pageViews = row.count;
    if (row._id.type === "click") m.clicks = row.count;
  }
  for (const row of seriesSessionsRaw) {
    const m = seriesMap.get(row._id);
    if (m) m.sessions = row.count;
  }

  const series = [...seriesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const viewMap = new Map(viewsByPath.map((x) => [x._id, x.count]));
  const clickMap = new Map(clicksByPath.map((x) => [x._id, x.count]));
  const ctrRows: { path: string; ctrPct: number; views: number; clicks: number }[] = [];
  for (const [path, views] of viewMap) {
    if (views < 5) continue;
    const c = clickMap.get(path) ?? 0;
    ctrRows.push({
      path,
      views,
      clicks: c,
      ctrPct: Math.round((c / views) * 10000) / 100,
    });
  }
  ctrRows.sort((a, b) => b.ctrPct - a.ctrPct);

  return {
    visits: sessions,
    uniqueVisitors,
    sessions,
    pageViews,
    clicks,
    ctr,
    avgSessionDurationSec,
    bounceRatePct,
    searchCount,
    searchNoResultCount,
    liveActiveSessions: live,
    liveOnlineVisitors: liveVisitors.length,
    topPages: topPagesAgg.map((x) => ({ path: x._id || "/", count: x.count })),
    topArticles: topArticlesAgg.map((x) => ({ slug: x._id, count: x.count })),
    topCategories: topCategoriesAgg.map((x) => ({ slug: x._id, count: x.count })),
    topSearches: topSearchesFromApi.map((x) => ({ query: x._id, count: x.count })),
    topReferrers: referrersAgg.map((x) => ({ host: x._id, count: x.count })),
    topTrafficSources: trafficAgg.map((x) => ({ source: x._id || "direct", count: x.count })),
    devices: devicesAgg.map((x) => ({ device: x._id || "unknown", count: x.count })),
    countries: countriesAgg.map((x) => ({ country: x._id, count: x.count })),
    series,
    topPagesByCtr: ctrRows.slice(0, 10),
  };
}

/** @deprecated use getAnalyticsDashboard — kept for admin home compatibility */
export async function analyticsSummary(days: number) {
  const d = await getAnalyticsDashboard(days);
  return {
    visits: d.visits,
    pageViews: d.pageViews,
    clicks: d.clicks,
    ctr: d.ctr,
    topPages: d.topPages.map((p) => ({ _id: p.path, count: p.count })),
    topCategories: d.topCategories.map((c) => ({ _id: c.slug, count: c.count })),
    uniqueVisitors: d.uniqueVisitors,
    sessions: d.sessions,
  };
}
