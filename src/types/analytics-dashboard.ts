export type AnalyticsDashboard = {
  visits: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  clicks: number;
  ctr: number;
  avgSessionDurationSec: number;
  bounceRatePct: number;
  searchCount: number;
  searchNoResultCount: number;
  liveActiveSessions: number;
  /** Distinct visitors with activity in the last ~3 minutes (visible-tab presence + events) */
  liveOnlineVisitors: number;
  topPages: { path: string; count: number }[];
  topArticles: { slug: string; count: number }[];
  topCategories: { slug: string; count: number }[];
  topSearches: { query: string; count: number }[];
  topReferrers: { host: string; count: number }[];
  topTrafficSources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  countries: { country: string; count: number }[];
  series: { date: string; pageViews: number; sessions: number; clicks: number }[];
  topPagesByCtr: { path: string; ctrPct: number; views: number; clicks: number }[];
};
