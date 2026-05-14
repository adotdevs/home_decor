import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { adminDeleteReview, adminPatchReview, listReviewsAdmin } from "@/services/review-service";
import type { ArticleReviewStatus } from "@/types/article-review";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const status = searchParams.get("status") as ArticleReviewStatus | "all" | null;
  const articleSlug = searchParams.get("articleSlug") || undefined;
  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20") || 20));

  const data = await listReviewsAdmin({
    q,
    status: status && status !== "all" ? status : "all",
    articleSlug,
    sort,
    page,
    limit,
  });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      id?: string;
      status?: ArticleReviewStatus;
      verified?: boolean;
      isPinned?: boolean;
    };
    const id = String(body.id || "");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminPatchReview(id, {
      status: body.status,
      verified: body.verified,
      isPinned: body.isPinned,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDeleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
