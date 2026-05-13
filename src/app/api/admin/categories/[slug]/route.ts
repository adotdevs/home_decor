import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { categoryTree } from "@/config/site";
import { setTopLevelCategoryCardImage } from "@/services/category-service";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  if (!categoryTree.some((c) => c.slug === slug)) {
    return NextResponse.json({ error: "Unknown top-level category" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const imageVal = o.image;
  const image =
    imageVal === null || imageVal === undefined
      ? null
      : String(imageVal).trim() || null;

  try {
    await setTopLevelCategoryCardImage(slug, image);
    return NextResponse.json({ ok: true, slug, image: image ?? "" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
