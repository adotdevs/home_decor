import Link from "next/link";
import { notFound } from "next/navigation";
import { SeasonalHubCopyEditor } from "@/components/admin/marketing/seasonal-hub-copy-editor";
import { getSeasonalInspirationResolved } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seasonal = await getSeasonalInspirationResolved();
  const match = seasonal.find((s) => s.slug === slug);
  if (!match) notFound();

  const initial = {
    pageIntro: match.pageIntro ?? "",
    storiesSectionTitle: match.storiesSectionTitle ?? "",
    newsletterCtaLabel: match.newsletterCtaLabel ?? "",
    hubLinksIntro: match.hubLinksIntro ?? "",
    extraHubLinks: match.extraHubLinks?.length ? match.extraHubLinks : [],
  };

  return (
    <div>
      <nav className="border-b bg-muted/30 px-4 py-3 text-sm text-muted-foreground md:px-8">
        <Link href="/admin/pages/seasonal" className="hover:underline">
          ← All seasonal hubs
        </Link>
      </nav>
      <SeasonalHubCopyEditor slug={slug} seasonLabel={match.name} initial={initial} />
    </div>
  );
}
