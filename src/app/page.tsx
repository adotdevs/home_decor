export const dynamic = "force-dynamic";
import { HomeExperience } from "@/features/home/home-experience";
import { listPublishedArticles, listTrendingArticles } from "@/services/article-service";

export default async function Page() {
  const [latest, trending] = await Promise.all([listPublishedArticles(24), listTrendingArticles(12)]);
  return <HomeExperience latest={latest as Record<string, unknown>[]} trending={trending as Record<string, unknown>[]} />;
}
