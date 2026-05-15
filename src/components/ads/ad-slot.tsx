import { getAdByPlacement } from "@/services/ad-service";
import { cn } from "@/lib/utils";

type AdRow = NonNullable<Awaited<ReturnType<typeof getAdByPlacement>>>;

const placementLayout: Record<
  string,
  { root: string; inner: string }
> = {
  header: {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-center",
  },
  sidebar: {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-3",
  },
  "sticky-mobile": {
    root: "w-full max-w-full min-w-0 max-h-[120px] overflow-hidden sm:max-h-[100px]",
    inner: "flex max-h-[inherit] flex-col justify-center gap-2 overflow-hidden",
  },
  grid: {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-6 [&>*]:max-w-full",
  },
  footer: {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center",
  },
  "in-content": {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-3",
  },
  default: {
    root: "w-full max-w-full min-w-0",
    inner: "flex flex-col gap-3",
  },
};

/** Constrains third-party ad markup so iframes never widen the viewport. */
export async function AdSlot({
  placement,
  className,
  /** When set (e.g. parent already fetched), skips a second DB round-trip. */
  ad: adProp,
}: {
  placement: string;
  className?: string;
  ad?: AdRow | null;
}) {
  const layout = placementLayout[placement] ?? placementLayout.default;
  const ad = adProp !== undefined ? adProp : await getAdByPlacement(placement);

  if (!ad) {
    return (
      <></>
      // <aside
      //   className={cn(
      //     "mx-auto w-full max-w-full min-w-0 break-words rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs leading-snug text-muted-foreground",
      //     layout.root,
      //     className,
      //   )}
      // >
      //   Ad slot: {placement}
      // </aside>
    );
  }

  return (
    <aside className={cn("mx-auto", layout.root, className)} data-ad-placement={placement}>
      <div className="rounded-2xl border bg-card p-2 text-xs text-muted-foreground">Sponsored</div>
      <div
        className={cn(
          "mt-2 max-w-full min-w-0 overflow-x-auto overflow-y-hidden rounded-2xl border bg-background p-2 md:p-4",
          "[&_iframe]:max-w-full [&_iframe]:min-w-0",
          "[&_img]:max-w-full [&_img]:h-auto",
          "[&_div]:max-w-full [&_div]:min-w-0",
          "[&_ins]:max-w-full [&_ins]:min-w-0",
          "[&_table]:max-w-full",
          layout.inner,
        )}
      >
        <div
          className="max-w-full min-w-0 [&_*]:max-w-full [&_iframe]:!max-w-full"
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      </div>
    </aside>
  );
}
