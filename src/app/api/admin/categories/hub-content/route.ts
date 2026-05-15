import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";
import { connectDb } from "@/lib/db";
import { filterTopLevelBySlug } from "@/lib/mongodb/category-scope";
import { Category } from "@/models/Category";
import type { CategoryHubPageCopyDb } from "@/lib/category-hub-defaults";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

function cleanHubEditorial(body: unknown): { title: string; dek: string; advice: string; searches: string[] } | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const dek = typeof o.dek === "string" ? o.dek.trim() : "";
  const advice = typeof o.advice === "string" ? o.advice.trim() : "";
  const searchesRaw = o.searches;
  const searches = Array.isArray(searchesRaw)
    ? searchesRaw.map((s) => String(s).trim()).filter(Boolean)
    : [];
  if (!title || !dek) return null;
  return { title, dek, advice, searches };
}

/** Incoming fields merged into existing `hubPageCopy` (only keys present in `body`). */
function ingestHubPageCopyPatch(body: unknown): CategoryHubPageCopyDb {
  if (!body || typeof body !== "object") return {};
  const o = body as Record<string, unknown>;
  const out: CategoryHubPageCopyDb = {};
  const pick = (key: keyof CategoryHubPageCopyDb, json: string) => {
    if (!(json in o)) return;
    const v = o[json];
    if (typeof v !== "string") return;
    (out as Record<string, string>)[key as string] = v.trim();
  };
  pick("heroEyebrow", "heroEyebrow");
  pick("exploreHeading", "exploreHeading");
  pick("exploreIntro", "exploreIntro");
  pick("subCardBlurb", "subCardBlurb");
  pick("latestHeading", "latestHeading");
  pick("latestIntro", "latestIntro");
  pick("editorsHeading", "editorsHeading");
  pick("editorsIntro", "editorsIntro");
  pick("faqHeading", "faqHeading");
  pick("subHeroEyebrow", "subHeroEyebrow");
  pick("guidesHeading", "guidesHeading");
  pick("guidesIntro", "guidesIntro");
  pick("emptyStateTitle", "emptyStateTitle");
  pick("emptyStateBody", "emptyStateBody");
  pick("howToHeading", "howToHeading");
  pick("relatedHeading", "relatedHeading");

  if ("faqItems" in o && Array.isArray(o.faqItems)) {
    const faq = o.faqItems;
    out.faqItems = faq
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const p = x as Record<string, unknown>;
        const question = typeof p.question === "string" ? p.question.trim() : "";
        const answer = typeof p.answer === "string" ? p.answer.trim() : "";
        if (!question || !answer) return null;
        return { question, answer };
      })
      .filter(Boolean) as { question: string; answer: string }[];
  }

  if ("howToColumns" in o && Array.isArray(o.howToColumns)) {
    const how = o.howToColumns;
    out.howToColumns = how
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const p = x as Record<string, unknown>;
        const t = typeof p.title === "string" ? p.title.trim() : "";
        const b = typeof p.body === "string" ? p.body.trim() : "";
        if (!t || !b) return null;
        return { title: t, body: b };
      })
      .filter(Boolean) as { title: string; body: string }[];
  }

  if ("popularSearches" in o && Array.isArray(o.popularSearches)) {
    out.popularSearches = o.popularSearches.map((s) => String(s).trim()).filter(Boolean);
  }

  return out;
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
  const topSlug = String(o.topSlug || "").trim();
  if (!topSlug) return NextResponse.json({ error: "topSlug is required" }, { status: 400 });

  const subRaw = o.subSlug;
  const subSlug =
    subRaw === undefined || subRaw === null || subRaw === "" ? null : String(subRaw).trim();

  const hasEditorial = o.hubEditorial !== undefined;
  const hasPageCopy = o.hubPageCopy !== undefined;
  if (!hasEditorial && !hasPageCopy) {
    return NextResponse.json({ error: "Send hubEditorial and/or hubPageCopy." }, { status: 400 });
  }

  const hubEditorial = hasEditorial ? cleanHubEditorial(o.hubEditorial) : null;
  if (hasEditorial && hubEditorial === null) {
    return NextResponse.json({ error: "hubEditorial needs a title and short intro (dek)." }, { status: 400 });
  }

  await connectDb();
  const filter =
    subSlug == null ? { ...filterTopLevelBySlug(topSlug), isActive: true } : { slug: subSlug, parentSlug: topSlug, isActive: true };

  if (subSlug) {
    const parent = await Category.findOne({ ...filterTopLevelBySlug(topSlug), isActive: true }).lean();
    if (!parent) return NextResponse.json({ error: "Parent category not found" }, { status: 404 });
  }

  const doc = await Category.findOne(filter);
  if (!doc) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  if (hubEditorial) doc.set("hubEditorial", hubEditorial);

  if (hasPageCopy) {
    const prevRaw = doc.get("hubPageCopy") as CategoryHubPageCopyDb | undefined | null;
    const prev =
      prevRaw && typeof prevRaw === "object"
        ? (JSON.parse(JSON.stringify(prevRaw)) as CategoryHubPageCopyDb)
        : {};
    const incoming = ingestHubPageCopyPatch(o.hubPageCopy);
    doc.set("hubPageCopy", { ...prev, ...incoming });
  }

  await doc.save();
  return NextResponse.json({ ok: true });
}
