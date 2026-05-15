"use client";

import { useEffect, useRef } from "react";
import { shouldSkipClientAnalytics } from "@/lib/analytics/client-filter";
import { normalizeSearchQuery } from "@/lib/analytics/normalize-search-query";
import { ANALYTICS_VISITOR_KEY } from "@/lib/analytics/storage-keys";

type Props = {
  q: string;
  page: number;
  /** Best estimate of total matching documents (may equal results on page if count is skipped). */
  resultCount: number;
  /** Hits rendered on this page (for sanity checks / UI state). */
  resultsOnPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  tagSlug?: string;
};

const DEBOUNCE_MS = 800;
const SAME_QUERY_WINDOW_MS = 120_000;

function lsVid(): string {
  try {
    return localStorage.getItem(ANALYTICS_VISITOR_KEY) || "";
  } catch {
    return "";
  }
}

/** Logs one row per executed search intent (debounced, deduped); not per keystroke or RSC render. */
export function SearchAnalyticsBeacon(props: Props) {
  const lastSigRef = useRef<string>("");
  const lastAtRef = useRef<number>(0);

  useEffect(() => {
    if (shouldSkipClientAnalytics()) return;

    const raw = props.q.trim();
    const normalized = normalizeSearchQuery(raw);
    if (normalized.length < 2) return;

    const t = window.setTimeout(() => {
      const visitorKey = lsVid();
      const sig = [
        normalized,
        props.page,
        props.categorySlug || "",
        props.subcategorySlug || "",
        props.tagSlug || "",
      ].join("|");

      const now = Date.now();
      if (lastSigRef.current === sig && now - lastAtRef.current < SAME_QUERY_WINDOW_MS) return;
      lastSigRef.current = sig;
      lastAtRef.current = now;

      void fetch("/api/analytics/search-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorKey: visitorKey.length >= 8 ? visitorKey : undefined,
          q: raw.slice(0, 400),
          normalizedQ: normalized.slice(0, 400),
          page: props.page,
          resultCount: Math.max(0, Math.floor(props.resultCount)),
          resultsOnPage: Math.max(0, Math.floor(props.resultsOnPage)),
          categorySlug: props.categorySlug,
          subcategorySlug: props.subcategorySlug,
          tagSlug: props.tagSlug,
        }),
        keepalive: true,
      }).catch(() => {});
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(t);
  }, [
    props.q,
    props.page,
    props.resultCount,
    props.resultsOnPage,
    props.categorySlug,
    props.subcategorySlug,
    props.tagSlug,
  ]);

  return null;
}
