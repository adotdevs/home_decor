import type { Metadata } from "next";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export function absoluteUrl(path = "", baseUrl?: string): string {
  const base = (baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
  const raw = String(path || "").trim();
  if (!raw) return base;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const p = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${p}`;
}

export async function buildMetadata(input: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Promise<Metadata> {
  const b = await getResolvedSiteBranding();
  const url = absoluteUrl(input.path || "", b.url);
  const og = absoluteUrl(b.ogImage, b.url);
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: b.name,
      type: "website",
      images: [{ url: og, width: 1200, height: 630, alt: b.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [og],
    },
  };
}
