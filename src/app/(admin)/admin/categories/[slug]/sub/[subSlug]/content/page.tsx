export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CategorySubHubContentForm } from "@/components/admin/category-sub-hub-content-form";
import { loadSubCategoryHubPayload, loadTopCategoryHubPayload } from "@/services/category-service";

export default async function Page({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const { slug, subSlug } = await params;
  const [top, sub] = await Promise.all([loadTopCategoryHubPayload(slug), loadSubCategoryHubPayload(slug, subSlug)]);
  if (!top || !sub) notFound();

  return (
    <div className="min-w-0 space-y-6 px-3 py-6 sm:px-4 md:p-8">
      <nav className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <Link href="/admin/categories" className="hover:underline">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/admin/categories/${encodeURIComponent(slug)}/content`}
          className="min-w-0 break-words font-medium text-primary hover:underline"
        >
          {top.displayName}
        </Link>
        <span className="mx-2">/</span>
        <span className="min-w-0 break-words text-foreground">{sub.subDisplayName}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Page text</span>
      </nav>
      <CategorySubHubContentForm
        parentSlug={slug}
        subSlug={subSlug}
        categoryLabel={top.displayName}
        initialEditorial={sub.editorial}
        initialPageCopy={sub.pageCopy}
      />
    </div>
  );
}
