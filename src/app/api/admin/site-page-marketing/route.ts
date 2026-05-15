import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import {
  getSitePageMarketingForAdmin,
  upsertSitePageMarketingFromAdmin,
} from "@/services/site-page-marketing-service";
import type { SiteMarketingPageKey } from "@/types/site-page-marketing";

const KEYS = new Set<SiteMarketingPageKey>([
  "global-marketing",
  "inspiration-feed",
  "newsletter",
  "about",
  "inspiration-gallery",
  "latest",
  "legal-privacy",
  "legal-terms",
  "legal-cookies",
]);

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

function isPageKey(k: string): k is SiteMarketingPageKey {
  return KEYS.has(k as SiteMarketingPageKey);
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pageKey = new URL(req.url).searchParams.get("pageKey") || "";
  if (!isPageKey(pageKey)) {
    return NextResponse.json({ error: "Invalid pageKey" }, { status: 400 });
  }
  const data = await getSitePageMarketingForAdmin(pageKey);
  return NextResponse.json({ pageKey, data });
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
  const o = body as { pageKey?: string; data?: unknown };
  const pageKey = String(o.pageKey || "");
  if (!isPageKey(pageKey)) {
    return NextResponse.json({ error: "Invalid pageKey" }, { status: 400 });
  }
  if (!o.data || typeof o.data !== "object" || Array.isArray(o.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  try {
    const merged = await upsertSitePageMarketingFromAdmin(pageKey, o.data as Record<string, unknown>);
    return NextResponse.json({ pageKey, data: merged });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
