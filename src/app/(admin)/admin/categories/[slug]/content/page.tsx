export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryTopHubContentForm } from "@/components/admin/category-top-hub-content-form";
import { loadTopCategoryHubPayload } from "@/services/category-service";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await loadTopCategoryHubPayload(slug);
  if (!payload) notFound();

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
        <span className="min-w-0 break-words text-foreground">{payload.displayName}</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Page text</span>
      </nav>
      <CategoryTopHubContentForm
        categorySlug={slug}
        initialEditorial={payload.editorial}
        initialPageCopy={payload.pageCopy}
      />
    </div>
  );
}
