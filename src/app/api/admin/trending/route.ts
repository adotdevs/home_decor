import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import {
  applyTrendingAdminUpdates,
  listArticlesForTrendingAdmin,
  listTrendingArticles,
  type TrendingBatchItem,
} from "@/services/article-service";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const articles = await listArticlesForTrendingAdmin();
    const previewRaw = await listTrendingArticles(30);
    const preview = (previewRaw as { slug?: string; title?: string }[]).map((a) => ({
      slug: a.slug || "",
      title: a.title || "",
    }));
    return NextResponse.json({ articles, preview });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const updates = (body as { updates?: unknown }).updates;
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Expected updates array" }, { status: 400 });
  }
  try {
    await applyTrendingAdminUpdates(updates as TrendingBatchItem[]);
    const articles = await listArticlesForTrendingAdmin();
    const previewRaw = await listTrendingArticles(30);
    const preview = (previewRaw as { slug?: string; title?: string }[]).map((a) => ({
      slug: a.slug || "",
      title: a.title || "",
    }));
    return NextResponse.json({ ok: true, articles, preview });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
