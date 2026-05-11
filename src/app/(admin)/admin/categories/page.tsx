export const dynamic = "force-dynamic";
import { getCategories } from "@/services/category-service"; export default async function Page() { const categories = await getCategories(); return <div className="rounded-2xl border bg-card p-6"><h1 className="font-heading text-3xl">Category Management</h1><div className="mt-4 space-y-2">{categories.map((c:any)=><div key={c.slug} className="rounded-xl border p-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug}</p></div>)}</div></div>; }

