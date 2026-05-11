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
      code: `<div style="padding:16px;text-align:center;border-radius:12px;background:#f7f2ec">Ad placeholder (${placement})</div>`,
      isEnabled: true,
    };
  }
}