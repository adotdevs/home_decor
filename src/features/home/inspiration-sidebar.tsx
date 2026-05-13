import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import type { DefaultSeasonalItem } from "@/config/site-defaults";
import { MotionSurface } from "@/features/home/motion-surface";

export function InspirationSidebar({ seasonalItems }: { seasonalItems: DefaultSeasonalItem[] }) {
  return (
    <aside className="order-1 lg:order-2 lg:col-span-1">
      <p className="mb-3 pl-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground lg:hidden">
        Swipe — newsletter · partners · seasons
      </p>
      <div
        className="no-scrollbar flex min-w-0 w-full max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-1 lg:flex-col lg:gap-6 lg:overflow-visible lg:pb-0"
        style={{ scrollPaddingInline: "1rem" }}
      >
        <MotionSurface
          className="w-[min(21rem,calc(100vw-2.5rem))] shrink-0 snap-center rounded-3xl border border-black/5 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:w-[min(22rem,calc(100vw-3rem))] lg:w-full lg:min-w-0 lg:shrink lg:snap-none"
          delay={0}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Newsletter</p>
          <p className="mt-3 font-heading text-xl">Saturday styling letter</p>
          <p className="mt-2 text-sm text-muted-foreground">Room formulas, shopping edits, and quiet-luxury notes — weekly.</p>
          <Link
            href="/newsletter"
            className="mt-4 inline-flex w-full justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
          >
            Subscribe
          </Link>
        </MotionSurface>

        <MotionSurface
          className="w-[min(21rem,calc(100vw-2.5rem))] shrink-0 snap-center sm:w-[min(22rem,calc(100vw-3rem))] lg:w-full lg:min-w-0 lg:shrink lg:snap-none"
          delay={0.06}
          hoverLift={false}
        >
          <div className="overflow-hidden rounded-3xl border border-black/5 bg-card/50 shadow-sm transition-shadow duration-300 hover:shadow-md">
            <AdSlot placement="sidebar" />
          </div>
        </MotionSurface>

        <MotionSurface
          className="w-[min(21rem,calc(100vw-2.5rem))] shrink-0 snap-center rounded-3xl border border-black/5 bg-muted/40 p-5 backdrop-blur-sm sm:w-[min(22rem,calc(100vw-3rem))] lg:w-full lg:min-w-0 lg:shrink lg:snap-none"
          delay={0.12}
          hoverShadow="0 18px 36px -20px rgba(0,0,0,0.2)"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Seasonal guides</p>
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
