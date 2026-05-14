import { NextResponse } from "next/server";
import { ingestAnalyticsBatch, type IngestBody } from "@/services/analytics-ingest-service";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await ingestAnalyticsBatch(body as IngestBody, req.headers);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, accepted: result.accepted });
}
