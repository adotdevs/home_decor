"use client";

import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";

export function AnalyticsRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AnalyticsProvider />
      </Suspense>
    </>
  );
}
