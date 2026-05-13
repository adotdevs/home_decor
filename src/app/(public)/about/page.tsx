import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About CoreFusion — Our Editorial Mission",
  description:
    "Learn about CoreFusion — an editorial home decor platform dedicated to real-room inspiration, seasonal styling guides, and beautifully curated interior ideas for every home.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About CoreFusion",
    description:
      "An editorial home decor platform dedicated to real-room inspiration, seasonal styling guides, and beautifully curated interior ideas.",
  },
};

const pillars = [
  {
    icon: "✦",
    title: "Editorial before commercial",
    body: "Every article we publish is written to genuinely help you make a decision, not to push a product. Our recommendations come from real rooms, real stylists, and real results — not sponsored rankings.",
  },
  {
    icon: "✦",
    title: "Seasonal, not static",
    body: "Your home should evolve with the rhythms of the year. We publish seasonal guides each quarter to keep your spaces feeling alive, current, and deeply personal — whether that's a spring refresh or an autumnal reboot.",
  },
  {
    icon: "✦",
    title: "Accessible luxury",
    body: "Great design is not a budget. It's a point of view. We translate the principles behind high-end interior design into approachable, actionable ideas you can apply this weekend, with what you already own.",
  },
];

const stats = [
  { value: "200+", label: "Articles published" },
  { value: "6", label: "Room categories" },
  { value: "12K+", label: "Monthly readers" },
  { value: "83+", label: "Curated inspiration photos" },
];

const authors = [
  {
    name: "Ahmar",
    role: "Founder & Lead Editor",
    bio: "Former interior stylist turned digital editor. Obsessed with considered spaces, quiet luxury, and the art of doing more with less. Based between Lahore and London.",
    href: "/author/ahmar",
    initial: "A",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-950 px-8 py-20 text-white sm:px-12 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,119,6,0.2),transparent_60%)]"
        />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
            Our story
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            We believe every home has a story worth telling
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/75">
            CoreFusion started as a single mood board. Today it&rsquo;s an editorial
            platform helping thousands of readers find the ideas, confidence, and clarity to make
            their home feel like themselves.
          </p>
        </div>
      </section>

      {/* Stats row */}
      <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card px-6 py-7 text-center"
          >
            <p className="font-heading text-3xl font-bold text-foreground">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {/* What we believe */}
      <section className="mt-20">
        <div className="max-w-xl">
          <h2 className="font-heading text-3xl font-semibold">What we believe</h2>
          <p className="mt-4 text-muted-foreground">
            Three editorial principles guide every article, guide, and gallery we publish.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {pillars.map((p) => (
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

      {/* How we write */}
      <section className="mt-20">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-8 dark:from-amber-950/30 dark:to-rose-950/30 sm:p-10 md:p-12">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl font-semibold">How we write</h2>
            <p className="mt-4 text-muted-foreground">
              Every piece of content on this platform goes through the same editorial filter: Would
              an experienced interior designer recommend this? Is the advice specific enough to act
              on? Does it feel warm and personal rather than corporate and generic?
            </p>
            <p className="mt-4 text-muted-foreground">
              We write the way a knowledgeable friend would talk to you — clearly, honestly, and
              with a genuine love for the craft of making a home beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mt-20">
        <h2 className="font-heading text-3xl font-semibold">The team</h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          A small, focused team of editors, stylists, and interior-obsessives who care deeply about
          the advice we give.
        </p>
        <div className="mt-10 flex flex-wrap gap-6">
          {authors.map((a) => (
            <Link
              key={a.name}
              href={a.href}
              className="group flex w-full max-w-sm items-start gap-5 rounded-2xl border border-border bg-card p-6 transition hover:shadow-md"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold ${a.color}`}
              >
                {a.initial}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {a.bio}
                </p>
                <p className="mt-3 text-xs font-medium text-amber-600 transition group-hover:underline">
                  View articles →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mt-20 rounded-3xl bg-neutral-950 px-8 py-14 text-center text-white sm:px-12">
        <h2 className="font-heading text-3xl font-semibold">
          Stay in the editorial loop
        </h2>
        <p className="mt-4 text-white/70">
          Get our weekly edit of the best new ideas, seasonal room refreshes, and curated
          inspiration straight to your inbox. No noise, no spam — just great content.
        </p>
        <Link
          href="/newsletter"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-7 text-sm font-semibold text-neutral-900 shadow-md transition hover:bg-white/90"
        >
          Join 12,000+ readers
        </Link>
      </section>
    </main>
  );
}
