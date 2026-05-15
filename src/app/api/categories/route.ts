import { NextResponse } from "next/server";
import { getCategoryTree } from "@/services/category-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tree = await getCategoryTree();
    return NextResponse.json({ tree });
  } catch {
    return NextResponse.json({ tree: [] }, { status: 500 });
  }
}
