export const dynamic = "force-dynamic";

import { connectDb } from "@/lib/db";
import { Ad } from "@/models/Ad";

export default async function Page() {
  await connectDb();
  const ads = await Ad.find().sort({ updatedAt: -1 }).lean();

  return (
    <div className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <h1 className="font-heading text-3xl">Ad Management</h1>
      <div className="mt-4 space-y-2">
        {ads.map((ad) => (
          <div key={String(ad._id)} className="min-w-0 rounded-xl border p-3 sm:p-4">
            <p className="break-words font-medium">{ad.name || ad.placement}</p>
            <p className="mt-1 break-words text-xs text-muted-foreground">
              {ad.placement} | {ad.isEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
