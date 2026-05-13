"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/config/local-assets";
import type { GalleryItem } from "@/services/gallery-service";

type FilterId = (typeof GALLERY_CATEGORIES)[number]["id"];

interface GalleryGridProps {
  items: GalleryItem[];
  initialFilter?: FilterId;
}

function isOptimizableLocalPath(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

function GalleryCard({ item }: { item: GalleryItem }) {
  const href = item.articleSlug ? `/article/${item.articleSlug}` : "/inspiration/feed";
  const cta = item.articleSlug ? "Read article" : "View inspiration";

  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-neutral-100">
      <div className="relative w-full overflow-hidden">
        {isOptimizableLocalPath(item.src) ? (
          <Image
            src={item.src}
            alt={item.alt}
            width={600}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.alt}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Eye className="h-7 w-7 text-white/90" />
          <p className="max-w-[80%] text-center text-xs font-medium leading-snug text-white/90">{item.alt}</p>
          {item.articleTitle ? (
            <p className="max-w-[90%] truncate text-center text-[11px] text-white/75">{item.articleTitle}</p>
          ) : null}
          <Link
            href={href}
            className="mt-1 inline-flex h-8 cursor-pointer items-center rounded-full bg-white px-4 text-xs font-semibold text-neutral-900 shadow transition hover:bg-white/90"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({ items, initialFilter = "all" }: GalleryGridProps) {
  const [active, setActive] = useState<FilterId>(initialFilter);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((a) => a.category === active)),
    [active, items],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id as FilterId)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
              active === cat.id
                ? "bg-neutral-900 text-white shadow"
                : "border border-border bg-background text-muted-foreground hover:border-neutral-400 hover:text-foreground"
            }`}
          >
            {cat.label}
            {active === cat.id ? <span className="ml-1.5 text-white/70">{filtered.length}</span> : null}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {filtered.map((item) => (
          <GalleryCard key={`${item.src}-${item.articleSlug ?? item.source}`} item={item} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No images in this category yet.</div>
      ) : null}
    </div>
  );
}
