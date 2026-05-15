import Link from "next/link";
import { getSeasonalInspirationResolved } from "@/services/site-settings-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const seasonal = await getSeasonalInspirationResolved();

  return (
    <div className="space-y-8 p-4 md:p-8">
      <nav className="text-sm text-muted-foreground">
        <Link href="/admin/pages" className="hover:underline">
          Public page marketing
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Seasonal hubs</span>
      </nav>
      <div>
        <h1 className="font-heading text-3xl font-semibold">Seasonal inspiration hubs</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Pick a season to edit page-only copy on <code className="rounded bg-muted px-1">/inspiration/seasonal/[slug]</code>. Card titles and descriptions stay under Site & seasons.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {seasonal.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/admin/pages/seasonal/${encodeURIComponent(s.slug)}`}
              className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
            >
              <p className="font-heading text-lg font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">/{s.slug}</p>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
