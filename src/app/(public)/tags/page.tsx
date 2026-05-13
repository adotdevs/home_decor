export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { tagToPathSlug } from "@/data/tag-utils";
import { buildMetadata } from "@/lib/utils/seo";
import { listDistinctPublishedTags } from "@/services/article-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getResolvedSiteBranding();
  return await buildMetadata({
    title: `Decor tags & topics | ${b.name}`,
    description: "Browse every styling topic we cover — from quiet luxury palettes to kid-proof design.",
    path: "/tags",
  });
}

export default async function TagsIndexPage() {
  const tags = await listDistinctPublishedTags();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Index</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold md:text-5xl">Tags & topics</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Click a tag to open every editorial, playbook, and room guide we have published in that lane — ideal for internal discovery
        and Pinterest-style rabbit holes.
      </p>
      <ul className="mt-10 columns-1 gap-x-10 sm:columns-2">
        {tags.map((t) => (
          <li key={t} className="mb-3 break-inside-avoid">
            <Link href={`/tag/${tagToPathSlug(t)}`} className="text-base font-medium text-foreground hover:text-primary hover:underline">
              {t}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
