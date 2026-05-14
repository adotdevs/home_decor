import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { isLikelyBotUserAgent } from "@/lib/analytics/request-meta";
import { AnalyticsSession } from "@/models/AnalyticsSession";

const MIN_INTERVAL_MS = 15_000;
const lastPing = new Map<string, number>();

function sanitize(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

function prunePresenceMap() {
  if (lastPing.size <= 40_000) return;
  const now = Date.now();
  const cut = now - 60 * 60 * 1000;
  for (const [k, t] of lastPing) {
    if (t < cut) lastPing.delete(k);
  }
}

/**
 * Extends AnalyticsSession.lastActivityAt while the tab is visible — no AnalyticsEvent rows.
 * Rate-limited per sessionKey to limit write load.
 */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (isLikelyBotUserAgent(ua)) {
    return NextResponse.json({ ok: true });
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
  const o = body as Record<string, unknown>;
  const visitorKey = sanitize(o.visitorKey, 80);
  const sessionKey = sanitize(o.sessionKey, 80);
  if (!visitorKey || visitorKey.length < 8 || !sessionKey || sessionKey.length < 8) {
    return NextResponse.json({ error: "Invalid identifiers" }, { status: 400 });
  }

  const visible = o.visible === true || o.visible === "true";
  if (!visible) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const now = Date.now();
  const prev = lastPing.get(sessionKey) ?? 0;
  if (now - prev < MIN_INTERVAL_MS) {
    return NextResponse.json({ ok: true, throttled: true });
  }
  lastPing.set(sessionKey, now);
  prunePresenceMap();

  await connectDb();
  await AnalyticsSession.updateOne(
    { sessionKey, visitorKey },
    { $set: { lastActivityAt: new Date() } },
  );

  return NextResponse.json({ ok: true });
}
