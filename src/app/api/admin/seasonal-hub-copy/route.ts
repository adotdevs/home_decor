import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { patchSeasonalHubPageCopy, type SeasonalHubPageCopyPatch } from "@/services/site-settings-service";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
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
  const o = body as {
    slug?: string;
    pageIntro?: string;
    storiesSectionTitle?: string;
    newsletterCtaLabel?: string;
    hubLinksIntro?: string;
    extraHubLinks?: { label: string; href: string }[];
  };
  const slug = String(o.slug || "").trim();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const patch: SeasonalHubPageCopyPatch = {};
  if (o.pageIntro !== undefined) patch.pageIntro = o.pageIntro;
  if (o.storiesSectionTitle !== undefined) patch.storiesSectionTitle = o.storiesSectionTitle;
  if (o.newsletterCtaLabel !== undefined) patch.newsletterCtaLabel = o.newsletterCtaLabel;
  if (o.hubLinksIntro !== undefined) patch.hubLinksIntro = o.hubLinksIntro;
  if (o.extraHubLinks !== undefined) patch.extraHubLinks = o.extraHubLinks;

  try {
    await patchSeasonalHubPageCopy(slug, patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
