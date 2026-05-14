import Link from "next/link";
import { aggregateTopSearchQueries } from "@/services/search-query-service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await aggregateTopSearchQueries();

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Search analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Queries logged when visitors load the public <code className="rounded bg-muted px-1 text-xs">/search</code> page
            (server-side). API suggestions via <code className="rounded bg-muted px-1 text-xs">/api/search?suggest=1</code> are not
            counted here.
          </p>
        </div>
        <Link href="/admin/analytics" className="text-sm text-muted-foreground hover:underline">
          View site analytics →
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Query</th>
              <th className="px-4 py-3 font-medium">Count</th>
              <th className="px-4 py-3 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No searches recorded yet. Traffic to <code className="rounded bg-muted px-1">/api/search</code> will populate
                  this table.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-3 font-medium">{r._id}</td>
                  <td className="px-4 py-3 tabular-nums">{r.count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.last).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
