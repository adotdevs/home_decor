import { NextResponse } from "next/server";
import { clientIpFromHeaders } from "@/lib/analytics/request-meta";
import type { GeoHeaders } from "@/lib/analytics/request-meta";
import { isNonRoutableClientIp, resolveGeoForIngest } from "@/lib/analytics/ip-geo-lookup";

const emptyGeo = (): GeoHeaders => ({
  country: "",
  city: "",
  region: "",
  timezone: "",
});

/**
 * One-shot geo for the browser: resolved from the request IP (ipwho.is on the server).
 * Client should cache the JSON in localStorage and attach it to /api/analytics/ingest.
 */
export async function GET(req: Request) {
  return resolveClientGeoResponse(req.headers);
}

async function resolveClientGeoResponse(requestHeaders: Headers): Promise<NextResponse> {
  const ip = clientIpFromHeaders(requestHeaders);
  if (!ip || isNonRoutableClientIp(ip)) {
    return NextResponse.json({ ok: false, ...emptyGeo() });
  }

  const geo = await resolveGeoForIngest(emptyGeo(), ip);
  if (!geo.country) {
    return NextResponse.json({ ok: false, ...geo });
  }

  return NextResponse.json({
    ok: true,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    timezone: geo.timezone,
  });
}
