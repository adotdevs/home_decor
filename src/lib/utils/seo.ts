import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function absoluteUrl(path = "") {
  const base = siteConfig.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata(input: { title: string; description: string; path?: string; keywords?: string[] }): Metadata {
  const url = absoluteUrl(input.path || "");
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: { title: input.title, description: input.description, url, siteName: siteConfig.name, type: "website", images: [{ url: absoluteUrl(siteConfig.ogImage), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [absoluteUrl(siteConfig.ogImage)] },
  };
}