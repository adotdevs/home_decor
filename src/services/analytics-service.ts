import { subDays } from "date-fns";
import { connectDb } from "@/lib/db";
import { Analytics } from "@/models/Analytics";

export async function trackEvent(payload: Record<string, unknown>) { await connectDb(); return Analytics.create(payload); }
export async function analyticsSummary(days = 30) {
  await connectDb();
  const since = subDays(new Date(), days);
  const base = { occurredAt: { $gte: since } };
  const [visits, pageViews, clicks, topPages, topCategories] = await Promise.all([
    Analytics.countDocuments({ ...base, event: "visit" }),
    Analytics.countDocuments({ ...base, event: "page_view" }),
    Analytics.countDocuments({ ...base, event: "click" }),
    Analytics.aggregate([{ $match: { ...base, event: "page_view" } }, { $group: { _id: "$path", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
    Analytics.aggregate([{ $match: { ...base, event: "page_view" } }, { $group: { _id: "$categorySlug", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
  ]);
  return { visits, pageViews, clicks, ctr: pageViews ? (clicks / pageViews) * 100 : 0, topPages, topCategories };
}