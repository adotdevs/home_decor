import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { connectDb } from "@/lib/db";
import { filterTopLevelBySlug, filterTopLevelScope } from "@/lib/mongodb/category-scope";
import { Category } from "@/models/Category";
import { toSlug } from "@/lib/utils/content";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = String(o.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const parentRaw = o.parentSlug;
  const parentSlug =
    parentRaw === undefined || parentRaw === null || parentRaw === "" ? null : String(parentRaw).trim();
  if (parentSlug) {
    await connectDb();
    const parent = await Category.findOne({ ...filterTopLevelBySlug(parentSlug), isActive: true }).lean();
    if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
  }

  let slug = String(o.slug || "").trim();
  if (!slug) slug = toSlug(name);
  else slug = toSlug(slug);

  await connectDb();

  let finalSlug = slug;
  for (let n = 0; n < 100; n++) {
    const exists = await Category.findOne(
      parentSlug == null ? filterTopLevelBySlug(finalSlug) : { slug: finalSlug, parentSlug },
    ).lean();
    if (!exists) break;
    finalSlug = `${slug}-${n + 2}`;
  }

  const last = await Category.findOne(parentSlug == null ? filterTopLevelScope() : { parentSlug })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean();
  const sortOrder = ((last as { sortOrder?: number } | null)?.sortOrder ?? -1) + 1;

  const doc = await Category.create({
    name,
    slug: finalSlug,
    parentSlug,
    sortOrder,
    isActive: true,
  });

  return NextResponse.json({ ok: true, category: JSON.parse(JSON.stringify(doc)) });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const slug = String(o.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const parentRaw = o.parentSlug;
  const parentSlug =
    parentRaw === undefined || parentRaw === null || parentRaw === "" ? null : String(parentRaw).trim();

  await connectDb();
  const filter = parentSlug == null ? filterTopLevelBySlug(slug) : { slug, parentSlug };

  const $set: Record<string, unknown> = {};
  if (typeof o.name === "string" && o.name.trim()) $set.name = o.name.trim();
  if (typeof o.sortOrder === "number" && Number.isFinite(o.sortOrder)) $set.sortOrder = o.sortOrder;
  if (typeof o.isActive === "boolean") $set.isActive = o.isActive;

  if (!Object.keys($set).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const res = await Category.findOneAndUpdate(filter, { $set }, { new: true }).lean();
  if (!res) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ ok: true, category: res });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  const parentRaw = searchParams.get("parentSlug");
  const parentSlug =
    parentRaw === undefined || parentRaw === null || parentRaw === "" ? null : String(parentRaw).trim();

  await connectDb();
  const filter = parentSlug == null || parentSlug === "" ? filterTopLevelBySlug(slug) : { slug, parentSlug };

  const top = await Category.findOne(filter).lean();
  if (!top) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parentSlug == null || parentSlug === "") {
    await Category.updateMany({ parentSlug: slug }, { $set: { isActive: false } });
  }

  await Category.updateOne(filter, { $set: { isActive: false } });
  return NextResponse.json({ ok: true });
}
