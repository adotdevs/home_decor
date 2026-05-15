import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import type { DefaultSeasonalItem } from "@/config/site-defaults";
import { MotionSurface } from "@/features/home/motion-surface";
import { getAdByPlacement } from "@/services/ad-service";

export async function InspirationSidebar({
  seasonalItems,
  seasonalLabel = "Seasonal guides",
  newsletterKicker = "Newsletter",
  newsletterTitle = "Saturday styling letter",
  newsletterDek = "Room formulas, shopping edits, and quiet-luxury notes — weekly.",
}: {
  seasonalItems: DefaultSeasonalItem[];
  seasonalLabel?: string;
  newsletterKicker?: string;
  newsletterTitle?: string;
  newsletterDek?: string;
}) {
  const sidebarAd = await getAdByPlacement("sidebar");
  const hasSidebarAd = Boolean(
    sidebarAd && String((sidebarAd as { code?: string }).code ?? "").trim().length > 0,
  );
  const swipeHint = hasSidebarAd
    ? "Swipe — newsletter · partners · seasons"
    : "Swipe — newsletter · seasons";

  return (
    <aside className="order-1 lg:order-2 lg:col-span-1">
      <p className="mb-3 pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground lg:hidden">
        {swipeHint}
      </p>
      <div
        className="no-scrollbar flex min-w-0 w-full max-w-full snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 ps-0 pe-4 [scrollbar-gutter:stable] lg:flex-col lg:gap-6 lg:overflow-visible lg:pb-0 lg:pe-0"
        style={{ scrollPaddingInlineEnd: "max(1rem, env(safe-area-inset-right))" }}
      >
        <MotionSurface
          className="w-[min(21rem,90%)] max-w-full shrink-0 snap-start snap-always rounded-3xl border border-black/5 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:w-[min(22rem,90%)] lg:w-full lg:min-w-0 lg:shrink lg:snap-none lg:snap-normal"
          delay={0}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{newsletterKicker}</p>
          <p className="mt-3 font-heading text-xl">{newsletterTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{newsletterDek}</p>
          <Link
            href="/newsletter"
            className="mt-4 inline-flex w-full justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
          >
            Subscribe
          </Link>
        </MotionSurface>

        {hasSidebarAd ? (
          <MotionSurface
            className="w-[min(21rem,90%)] max-w-full shrink-0 snap-start snap-always sm:w-[min(22rem,90%)] lg:w-full lg:min-w-0 lg:shrink lg:snap-none lg:snap-normal"
            delay={0.06}
            hoverLift={false}
          >
            <div className="overflow-hidden rounded-3xl border border-black/5 bg-card/50 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <AdSlot placement="sidebar" ad={sidebarAd} />
            </div>
          </MotionSurface>
        ) : null}

        <MotionSurface
          className="w-[min(21rem,90%)] max-w-full shrink-0 snap-start snap-always rounded-3xl border border-black/5 bg-muted/40 p-5 backdrop-blur-sm sm:w-[min(22rem,90%)] lg:w-full lg:min-w-0 lg:shrink lg:snap-none lg:snap-normal"
          delay={hasSidebarAd ? 0.12 : 0.06}
          hoverShadow="0 18px 36px -20px rgba(0,0,0,0.2)"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{seasonalLabel}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {seasonalItems.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/inspiration/seasonal/${s.slug}`}
                  className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
                >
                  {s.name}
                </Link>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ul>
        </MotionSurface>
      </div>
    </aside>
  );
}
