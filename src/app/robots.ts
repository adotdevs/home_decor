import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils/seo";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const b = await getResolvedSiteBranding();
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: absoluteUrl("/sitemap.xml", b.url) };
}
