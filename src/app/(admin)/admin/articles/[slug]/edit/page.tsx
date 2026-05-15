import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleEditor } from "@/components/admin/article-editor";
import { getHomeEditorialResolved } from "@/services/site-editorial-service";
import { getCategoryTree } from "@/services/category-service";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function Page({ params }: Props) {
  const { slug } = await params;
  await connectDb();
  const [doc, editorial, categoryTree] = await Promise.all([
    Article.findOne({ slug }).lean(),
    getHomeEditorialResolved(),
    getCategoryTree(),
  ]);
  if (!doc) notFound();
  const parsed = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  const inEditorsChoice = editorial.editorsChoiceSlugs.includes(slug);
  return <ArticleEditor mode="edit" initial={{ ...parsed, inEditorsChoice }} categoryTree={categoryTree} />;
}
