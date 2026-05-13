import { connectDb } from "@/lib/db";
import { Ad } from "@/models/Ad";
export async function getAdByPlacement(placement: string) {
  try {
    await connectDb();
    const row = await Ad.findOne({ placement, isEnabled: true }).lean();
    return row ? JSON.parse(JSON.stringify(row)) : null;
  } catch {
    return {
      placement,
      code: `<div style="padding:18px;text-align:center;border-radius:16px;background:linear-gradient(135deg,#f8efe4,#fffaf5);border:1px solid #ead8c2;color:#7a4f2b;font-family:Georgia,serif"><strong>Curated partner edit</strong><br/><span style="font-size:13px">Premium home fragrance, artisan ceramics, and soft furnishing picks selected for refined interiors.</span></div>`,
      isEnabled: true,
    };
  }
}