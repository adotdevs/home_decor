import { getAdByPlacement } from "@/services/ad-service";
export async function AdSlot({ placement, className }: { placement: string; className?: string }) {
  const ad = await getAdByPlacement(placement);
  if (!ad) return <aside className={`rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground ${className || ""}`}>Ad slot: {placement}</aside>;
  return <aside className={className}><div className="rounded-2xl border bg-card p-2 text-xs text-muted-foreground">Sponsored</div><div className="mt-2 rounded-2xl border bg-background p-4" dangerouslySetInnerHTML={{ __html: ad.code }} /></aside>;
}