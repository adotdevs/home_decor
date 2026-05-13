import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { listPublishedArticlesRange, listPublishedArticlesChronological, upsertArticle } from "@/services/article-service";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || "24"), 1), 60);

  if (searchParams.has("excludeSlugs")) {
    const skip = Math.max(0, Number(searchParams.get("offset") || "0"));
    const raw = searchParams.get("excludeSlugs") || "";
    const exclude = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return NextResponse.json(await listPublishedArticlesChronological(skip, limit, exclude));
  }

  const offset = Math.max(0, Number(searchParams.get("offset") || "0"));
  return NextResponse.json(await listPublishedArticlesRange(offset, limit));
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = await req.json();
    const doc = await upsertArticle(payload);
    return NextResponse.json(doc);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

