import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleEditor } from "@/components/admin/article-editor";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  await connectDb();
  const doc = await Article.findOne({ slug }).lean();
  if (!doc) notFound();
  return <ArticleEditor mode="edit" initial={JSON.parse(JSON.stringify(doc))} />;
}
