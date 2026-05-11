"use client";

export function ArticleShareRow({ baseUrl, title, slug }: { baseUrl: string; title: string; slug: string }) {
  const origin = baseUrl.replace(/\/$/, "");
  const url = `${origin}/article/${slug}`;
  const pin = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-black/5 py-4">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Share</span>
      <a
        href={pin}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        Pinterest
      </a>
      <button
        type="button"
        className="rounded-full border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
        onClick={() => navigator.clipboard.writeText(url)}
      >
        Copy link
      </button>
    </div>
  );
}
