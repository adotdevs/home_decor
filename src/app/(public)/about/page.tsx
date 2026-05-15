import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAboutMarketingMerged } from "@/services/site-page-marketing-service";
import { getResolvedSiteBranding } from "@/services/site-settings-service";

export async function generateMetadata(): Promise<Metadata> {
  const [b, m] = await Promise.all([getResolvedSiteBranding(), getAboutMarketingMerged()]);
  return {
    title: `${m.metaTitle} | ${b.name}`,
    description: m.metaDescription,
    alternates: { canonical: "/about" },
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
    },
  };
}

export default async function AboutPage() {
  const m = await getAboutMarketingMerged();
  const heroImg = m.heroBackgroundImageSrc?.trim();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
      <section className="relative isolate min-h-[360px] overflow-hidden rounded-3xl bg-neutral-950 px-8 py-20 text-white sm:px-12 md:py-28">
        {heroImg ? (
          heroImg.startsWith("/") ? (
            <Image
              src={heroImg}
              alt={m.heroBackgroundImageAlt?.trim() || ""}
              fill
              className="object-cover opacity-35"
              sizes="100vw"
              priority
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- admin may set any absolute image URL
            <img
              src={heroImg}
              alt={m.heroBackgroundImageAlt?.trim() || ""}
              className="absolute inset-0 z-0 h-full w-full object-cover opacity-35"
            />
          )
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top_left,rgba(217,119,6,0.2),transparent_60%)]"
        />
        <div className="relative z-[2] max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">{m.heroEyebrow}</p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{m.heroTitle}</h1>
          <p className="mt-6 text-lg leading-relaxed text-white/75">{m.heroLead}</p>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {m.stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card px-6 py-7 text-center">
            <p className="font-heading text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <div className="max-w-xl">
          <h2 className="font-heading text-3xl font-semibold">{m.pillarsIntroTitle}</h2>
          <p className="mt-4 text-muted-foreground">{m.pillarsIntroBody}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {m.pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-7 transition hover:shadow-md"
            >
              <span className="text-2xl text-amber-500">{p.icon}</span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-8 dark:from-amber-950/30 dark:to-rose-950/30 sm:p-10 md:p-12">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-semibold">{m.howWeWriteTitle}</h2>
            <p className="mt-4 text-muted-foreground">{m.howWeWriteParagraph1}</p>
            <p className="mt-4 text-muted-foreground">{m.howWeWriteParagraph2}</p>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-heading text-3xl font-semibold">{m.teamSectionTitle}</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">{m.teamSectionIntro}</p>
        <div className="mt-10 flex flex-wrap gap-6">
          {m.team.map((a) => (
            <div
              key={a.name}
              className="flex w-full max-w-sm items-start gap-5 rounded-2xl border border-border bg-card p-6"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold ${a.colorClass}`}
              >
                {a.initial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{a.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-neutral-950 px-8 py-14 text-center text-white sm:px-12">
        <h2 className="font-heading text-3xl font-semibold">{m.newsletterCtaTitle}</h2>
        <p className="mt-4 text-white/70">{m.newsletterCtaBody}</p>
        <Link
          href="/newsletter"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-7 text-sm font-semibold text-neutral-900 shadow-md transition hover:bg-white/90"
        >
          {m.newsletterCtaButtonLabel}
        </Link>
      </section>
    </main>
  );
}
