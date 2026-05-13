import { connectDb } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";

const SUBJECT_LABELS: Record<string, string> = {
  editorial: "Editorial enquiry",
  advertising: "Advertising & partnerships",
  collaboration: "Brand collaboration",
  press: "Press & media",
  other: "Other",
};

export const dynamic = "force-dynamic";

export default async function Page() {
  await connectDb();
  const rows = (await ContactSubmission.find().sort({ createdAt: -1 }).limit(300).lean()) as Record<
    string,
    unknown
  >[];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="font-heading text-3xl">Contact submissions</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Messages sent from the public contact form at /contact. Newest first.
      </p>

      <div className="mt-8 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          rows.map((r) => {
            const id = String(r._id ?? "");
            const created = r.createdAt ? new Date(String(r.createdAt)) : null;
            const subjectKey = String(r.subject ?? "");
            const subjectLabel = SUBJECT_LABELS[subjectKey] ?? subjectKey;
            return (
              <article
                key={id}
                className="rounded-xl border border-border bg-background p-4 shadow-sm md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{String(r.name || "")}</p>
                    <p className="truncate text-sm text-muted-foreground">{String(r.email || "")}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
                      {subjectLabel}
                    </span>
                    {created && !Number.isNaN(created.getTime()) ? (
                      <p className="mt-1">{created.toLocaleString()}</p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {String(r.message || "")}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
