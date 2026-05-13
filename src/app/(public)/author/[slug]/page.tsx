export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/article/article-card";

type AuthorProfile = {
  name: string;
  role: string;
  bio: string;
  initial: string;
  color: string;
  socialLinks: { label: string; href: string }[];
};

const AUTHORS: Record<string, AuthorProfile> = {
  ahmar: {
    name: "Ahmar",
    role: "Founder & Lead Editor",
    bio: "Former interior stylist turned digital editor. Ahmar has spent over a decade working with residential clients, furniture brands, and lifestyle publications across South Asia and the UK. Now he channels that hands-on experience into editorial content that helps real people make genuinely beautiful homes — without the designer price tag. When he's not writing, he's rearranging his bookshelves (for the fifth time this month).",
    initial: "A",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "clara-whitmore": {
    name: "Clara Whitmore",
    role: "Senior Textiles Editor",
    bio: "Clara writes about the parts of a room you feel before you notice: bedding weight, curtain fullness, upholstery texture, and the quiet magic of a rug that finally fits. Her work blends boutique-hotel polish with deeply practical advice for homes with laundry days, pets, and real mornings.",
    initial: "C",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "julian-okonkwo": {
    name: "Julian Okonkwo",
    role: "Architecture & Layout Contributor",
    bio: "Julian approaches interiors from the bones outward: sightlines, proportion, lighting height, and the way furniture changes how people move through a room. His articles are especially useful for readers trying to make small spaces feel calm, generous, and more expensive than they are.",
    initial: "J",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "maren-okada": {
    name: "Maren Okada",
    role: "Japandi & Minimalist Interiors Editor",
    bio: "Maren specialises in quiet rooms with texture, restraint, and a strong sense of material honesty. She writes for readers who love clean spaces but still want warmth, patina, and a home that feels lived in rather than staged.",
    initial: "M",
    color: "bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "sofia-reyes": {
    name: "Sofia Reyes",
    role: "Entertaining & Tablescape Editor",
    bio: "Sofia writes about the emotional side of hosting: candle height, glassware rhythm, washable linens, and tables that make guests linger. Her guides turn seasonal gatherings into realistic, beautiful rituals rather than complicated productions.",
    initial: "S",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "elena-marchetti": {
    name: "Elena Marchetti",
    role: "Decor Objects & Styling Editor",
    bio: "Elena covers vignettes, wall moments, shelves, candles, ceramics, and the small objects that give a room memory. She is known for advice that feels elegant but never precious: buy less, scale up, and let every object earn its place.",
    initial: "E",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "noor-siddiqui": {
    name: "Noor Siddiqui",
    role: "Bathroom & Wellness Spaces Writer",
    bio: "Noor focuses on the rooms where daily routines become rituals: bathrooms, vanities, towel storage, and quiet corners for pause. Her writing is practical, sensory, and especially strong on materials that survive real humidity and real families.",
    initial: "N",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "hiba-nadeem": {
    name: "Hiba Nadeem",
    role: "Family Home & Kitchen Editor",
    bio: "Hiba writes for beautiful homes that are also busy homes: kitchens with morning traffic, children’s rooms that change every season, and storage systems that make a space feel calmer without pretending life is perfectly tidy.",
    initial: "H",
    color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
  "sofia-el-amin": {
    name: "Sofia El-Amin",
    role: "Seasonal Entertaining Contributor",
    bio: "Sofia brings a warm, family-scale perspective to seasonal decorating. Her tables are layered but usable, candlelit but safe, and designed around the real rhythms of gathering, serving, clearing, and sitting a little longer.",
    initial: "S",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    socialLinks: [
      { label: "Pinterest", href: "https://pinterest.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = AUTHORS[slug];
  if (!profile) return {};
  return {
    title: `${profile.name} — ${profile.role} | CoreFusion`,
    description: profile.bio.slice(0, 160),
    alternates: { canonical: `/author/${slug}` },
    openGraph: {
      title: `${profile.name} — ${profile.role}`,
      description: profile.bio.slice(0, 160),
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDb();

  const rawArticles = await Article.find({ authorSlug: slug, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(24)
    .lean();

  const articles = rawArticles as Record<string, unknown>[];
  const profile = AUTHORS[slug];

  if (!profile && articles.length === 0) notFound();

  const displayName = profile?.name ?? slug.replace(/-/g, " ");
  const displayRole = profile?.role ?? "Contributor";
  const displayBio =
    profile?.bio ??
    `${displayName} is a contributor to CoreFusion, bringing thoughtful interior perspectives to our editorial platform.`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
      {/* Profile card */}
      <section className="mb-14 flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-start sm:gap-8 md:p-10">
        {/* Avatar */}
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold sm:h-24 sm:w-24 ${profile?.color ?? "bg-neutral-100 text-neutral-600"}`}
        >
          {profile?.initial ?? displayName[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-bold capitalize text-foreground">
              {displayName}
            </h1>
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {displayRole}
            </span>
          </div>

          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{displayBio}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground">{articles.length}</strong>{" "}
              {articles.length === 1 ? "article" : "articles"} published
            </span>
            {profile?.socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-600 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section>
        <h2 className="mb-8 font-heading text-2xl font-semibold">
          {articles.length > 0 ? `All articles by ${displayName}` : "No articles yet"}
        </h2>

        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-8 py-16 text-center">
            <p className="text-muted-foreground">No published articles yet. Check back soon.</p>
            <Link
              href="/latest"
              className="mt-4 inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
            >
              Browse latest articles
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
