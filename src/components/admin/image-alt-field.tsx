"use client";

import { useMemo } from "react";
import { ALT_SOFT_RECOMMENDED, type ImageAltContext, buildAutoImageAlt } from "@/lib/image-alt";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  previewSrc?: string;
  hint?: string;
  /** Shown when value empty — preview of what auto alt will look like */
  autoPreviewContext?: ImageAltContext;
  autoPreviewUrl?: string;
  className?: string;
};

export function ImageAltField({
  id,
  label,
  value,
  onChange,
  previewSrc,
  hint = "Describe what’s in the image for screen readers, Pinterest, and Google Images. Leave blank to generate from headline, room, or filename.",
  autoPreviewContext,
  autoPreviewUrl,
  className,
}: Props) {
  const len = value.trim().length;
  const suggested = useMemo(() => {
    if (!autoPreviewContext && !autoPreviewUrl) return "";
    return buildAutoImageAlt(
      { ...autoPreviewContext, filenameHint: autoPreviewUrl },
      autoPreviewUrl || previewSrc,
    );
  }, [autoPreviewContext, autoPreviewUrl, previewSrc]);

  const showPreview = suggested && !value.trim();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span
          className={cn(
            "text-[11px] tabular-nums",
            len > ALT_SOFT_RECOMMENDED ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground",
          )}
        >
          {len} / {ALT_SOFT_RECOMMENDED}+ recommended · max {180}
        </span>
      </div>
      <textarea
        id={id}
        rows={2}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Modern neutral bedroom decor with warm layered lighting"
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      {showPreview ? (
        <p className="rounded-lg border border-dashed border-primary/25 bg-primary/5 px-3 py-2 text-[11px] text-foreground/90">
          <span className="font-semibold text-primary">Auto if left blank: </span>
          {suggested}
        </p>
      ) : null}
      {previewSrc ? (
        <div className="flex gap-3 rounded-lg border border-border/80 bg-muted/30 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt=""
            className="h-16 w-24 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 text-[11px] text-muted-foreground">
            <p className="font-medium text-foreground/90">Preview</p>
            <p className="mt-1 line-clamp-3">{value.trim() || suggested || "…"}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
