export const dynamic = "force-dynamic";
import { HomeExperience } from "@/features/home/home-experience";
import { listPublishedArticles, listTrendingArticles } from "@/services/article-service";

export default async function Page() {
  const [latest, trending] = await Promise.all([listPublishedArticles(42), listTrendingArticles(12)]);
  const moodArticles = (latest as Record<string, unknown>[]).filter((a) =>
    (a.tags as string[] | undefined)?.some((t) => /japandi|neutral|organic|layered|quiet/i.test(String(t))),
  ).slice(0, 8);
  return (
    <HomeExperience
      latest={latest as Record<string, unknown>[]}
      trending={trending as Record<string, unknown>[]}
      moodArticles={(moodArticles.length ? moodArticles : latest.slice(0, 6)) as Record<string, unknown>[]}
    />
  );
}
