export const dynamic = "force-dynamic";
import { HomeExperience } from "@/features/home/home-experience";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { getHomeCategoryCards } from "@/services/category-service";
import {
  articlesBySlugsOrdered,
  listPublishedArticles,
  listPublishedArticlesChronological,
  listTrendingArticles,
} from "@/services/article-service";
import { getResolvedSiteBranding, getSeasonalInspirationResolved } from "@/services/site-settings-service";

export default async function Page() {
  const [editorial, categoryCards] = await Promise.all([getHomeEditorialResolved(), getHomeCategoryCards()]);
  const [branding, seasonalItems] = await Promise.all([getResolvedSiteBranding(), getSeasonalInspirationResolved()]);

  const [trending, latestPool] = await Promise.all([
    listTrendingArticles(16),
    listPublishedArticles(48),
  ]);

  const latest = latestPool as Record<string, unknown>[];
  const trend = trending as Record<string, unknown>[];

  const lead = editorial.leadStorySlug
    ? (await articlesBySlugsOrdered([editorial.leadStorySlug]))[0] ?? latest[0] ?? null
    : latest[0] ?? null;

  const featuredWeekly = editorial.featuredWeeklySlugs.length
    ? await articlesBySlugsOrdered(editorial.featuredWeeklySlugs)
    : [];

  const featuredDaily = editorial.featuredDailySlugs.length
    ? await articlesBySlugsOrdered(editorial.featuredDailySlugs)
    : [];

  const featuredMonthly = editorial.featuredMonthlySlugs.length
    ? await articlesBySlugsOrdered(editorial.featuredMonthlySlugs)
    : [];

  const editorsChoice = editorial.editorsChoiceSlugs.length
    ? await articlesBySlugsOrdered(editorial.editorsChoiceSlugs)
    : [];

  const moodArticles = editorial.moodRailSlugs.length
    ? await articlesBySlugsOrdered(editorial.moodRailSlugs)
    : (latest as Record<string, unknown>[]).filter((a) =>
        (a.tags as string[] | undefined)?.some((t) => /japandi|neutral|organic|layered|quiet/i.test(String(t))),
      ).slice(0, 8);

  const pinnedSlugs = [...new Set(editorial.inspirationPinnedSlugs.map((s) => s.trim()).filter(Boolean))];
  const pinnedResolved = pinnedSlugs.length ? await articlesBySlugsOrdered(pinnedSlugs) : [];
  const targetFirst = 12;
  const fillCount = Math.max(0, targetFirst - pinnedResolved.length);
  const chronologicalFill = fillCount
    ? await listPublishedArticlesChronological(0, fillCount, pinnedSlugs)
    : [];
  const inspirationInitial = [...pinnedResolved, ...(chronologicalFill as Record<string, unknown>[])];
  const inspirationChronologicalSkip = chronologicalFill.length;

  return (
    <HomeExperience
      editorial={editorial}
      categoryCards={categoryCards}
      lead={(lead ?? null) as Record<string, unknown> | null}
      featuredWeekly={featuredWeekly as Record<string, unknown>[]}
      featuredDaily={featuredDaily as Record<string, unknown>[]}
      featuredMonthly={featuredMonthly as Record<string, unknown>[]}
      editorsChoice={editorsChoice as Record<string, unknown>[]}
      moodArticles={(moodArticles.length ? moodArticles : latest.slice(0, 6)) as Record<string, unknown>[]}
      trending={trend}
      latestForFresh={latest}
      inspirationInitial={inspirationInitial}
      inspirationExcludeSlugs={pinnedSlugs}
      inspirationChronologicalSkip={inspirationChronologicalSkip}
      siteName={branding.name}
      seasonalItems={seasonalItems}
    />
  );
}
