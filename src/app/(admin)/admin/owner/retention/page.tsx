import { env } from "@/lib/env";
import { RetentionRunButton } from "@/components/admin/retention-run-button";
import { formatBytes, getDatabaseStorageOverview } from "@/services/db-storage-service";
import { listRecentRetentionRuns } from "@/services/data-retention-service";

export const dynamic = "force-dynamic";

function fmtTs(d: Date | string | undefined): string {
  if (!d) return "—";
  const x = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(x.getTime())) return "—";
  return x.toLocaleString();
}

export default async function OwnerRetentionPage() {
  const [rows, runs] = await Promise.all([getDatabaseStorageOverview(), listRecentRetentionRuns(20)]);
  const last = runs[0];
  const totalTrackedBytes = rows.reduce((s, r) => s + r.storageBytes, 0);

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform owner</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Data retention & storage</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Automated cleanup uses batched deletes (non-blocking) on analytics, search logs, legacy visitor rows,
            audit records, and snapshots. Content collections (articles, categories, reviews, media, SEO) are never
            touched. Schedule{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">GET /api/cron/data-retention</code> with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Authorization: Bearer CRON_SECRET</code>.
          </p>
        </div>
        <RetentionRunButton />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Analytics &amp; telemetry</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{env.ANALYTICS_RETENTION_DAYS} days</p>
          <p className="mt-1 text-xs text-muted-foreground">Events, sessions, search queries, legacy points, visitors</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Audit &amp; snapshots</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{env.AUDIT_RETENTION_DAYS} days</p>
          <p className="mt-1 text-xs text-muted-foreground">Admin audit log</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Analytics snapshots</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{env.ANALYTICS_SNAPSHOT_RETENTION_DAYS} days</p>
          <p className="mt-1 text-xs text-muted-foreground">Pre-reset bundles when enabled</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Batch size</p>
          <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{env.RETENTION_DELETE_BATCH_SIZE}</p>
          <p className="mt-1 text-xs text-muted-foreground">Documents per delete chunk</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Collection sizes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Approximate storage from MongoDB <code className="rounded bg-muted px-1">$collStats</code> · tracked total{" "}
          <span className="font-medium text-foreground">{formatBytes(totalTrackedBytes)}</span>
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium">Documents</th>
                <th className="px-4 py-3 font-medium">Storage</th>
                <th className="px-4 py-3 font-medium">Retention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.label}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{r.collection}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.count.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums">{formatBytes(r.storageBytes)}</td>
                  <td className="px-4 py-3">
                    {r.retention ? (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                        Auto
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Preserved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Retention policy summary</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              Deletes rows with <strong className="text-foreground">serverReceivedAt</strong> /{" "}
              <strong className="text-foreground">lastActivityAt</strong> / <strong className="text-foreground">createdAt</strong>{" "}
              older than the analytics window ({env.ANALYTICS_RETENTION_DAYS}d) for high-volume collections.
            </li>
            <li>Admin audit log uses the audit window ({env.AUDIT_RETENTION_DAYS}d).</li>
            <li>Snapshots use {env.ANALYTICS_SNAPSHOT_RETENTION_DAYS}d.</li>
            <li>
              Sessions are purged by <strong className="text-foreground">lastActivityAt</strong> so idle sessions are not
              mistaken for &quot;active&quot;.
            </li>
            <li>Page views and clicks live in <strong className="text-foreground">AnalyticsEvent</strong> only (no separate PageViews / ClickEvents collections).</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold">Last cleanup</h2>
          {last ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Finished</dt>
                <dd className="font-medium tabular-nums">{fmtTs(last.finishedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Trigger</dt>
                <dd className="capitalize">{String(last.trigger)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="tabular-nums">{last.durationMs} ms</dd>
              </div>
              {last.error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
                  {String(last.error)}
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No runs recorded yet. Trigger cron or use &quot;Run retention now&quot;.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Cleanup activity log</h2>
        <p className="mt-1 text-xs text-muted-foreground">Recent automated and manual retention passes</p>
        <ul className="mt-4 divide-y divide-border/70">
          {runs.length === 0 ? (
            <li className="py-8 text-center text-sm text-muted-foreground">No history yet.</li>
          ) : (
            runs.map((run) => {
              const del = (run.deleted || {}) as Record<string, number>;
              const keys = Object.keys(del);
              const total = keys.reduce((s, k) => s + (typeof del[k] === "number" ? del[k] : 0), 0);
              return (
                <li key={String(run._id)} className="flex flex-wrap items-start justify-between gap-3 py-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {fmtTs(run.finishedAt)} · <span className="capitalize text-muted-foreground">{String(run.trigger)}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {total.toLocaleString()} docs removed · {run.durationMs} ms
                    </p>
                    {keys.length ? (
                      <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        {keys.slice(0, 8).map((k) => `${k}:${del[k]}`).join(" · ")}
                        {keys.length > 8 ? " · …" : ""}
                      </p>
                    ) : null}
                    {run.error ? <p className="mt-2 text-xs text-destructive">{String(run.error)}</p> : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Env: ANALYTICS_RETENTION_DAYS, AUDIT_RETENTION_DAYS, ANALYTICS_SNAPSHOT_RETENTION_DAYS, RETENTION_DELETE_BATCH_SIZE,
        PLATFORM_OWNER_EMAIL · MongoDB TTL can be added separately; this app uses scheduled batched deletes for flexible windows.
      </p>
    </div>
  );
}
