import Link from "next/link";
import Image from "next/image";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { ArticleCard } from "@/components/article/article-card";
import { buildMetadata } from "@/lib/utils/seo";
import { resolveCategoryHeroImage } from "@/services/category-service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ categorySlug: string; subcategorySlug: string }> };

function pretty(slug: string) {
  return slug.replaceAll("-", " ");
}

function subcategoryIntro(categorySlug: string, subName: string) {
  const cat = pretty(categorySlug);
  return {
    headline: `${subName} ideas for a ${cat} that feels intentional`,
    dek: `This hub gathers long-form editorial guides for ${subName.toLowerCase()} inside ${cat}. Expect realistic color palettes, material notes, styling formulas, layout advice, and FAQ answers written for homes that are actually lived in.`,
    tip: `Before you buy anything, decide what ${subName.toLowerCase()} needs to solve: softness, storage, light, rhythm, height, or a clearer focal point. The most beautiful rooms usually start with one precise problem solved beautifully.`,
  };
}

export async function generateMetadata({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  const catLabel = categorySlug.replaceAll("-", " ");
  const subLabel = subcategorySlug.replaceAll("-", " ");
  return await buildMetadata({
    title: `${subLabel} — ${catLabel} decor guides & ideas`,
    description: `Curated ${subLabel} inspiration inside ${catLabel}: styling notes, FAQs, and shoppable-adjacent editorial picks.`,
    path: `/category/${categorySlug}/${subcategorySlug}`,
    keywords: [subLabel, catLabel, "home decor", "interior styling"],
  });
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  const heroImage = await resolveCategoryHeroImage(categorySlug);
  await connectDb();
  const [subDoc, dbArticles, relatedRows] = await Promise.all([
    Category.findOne({ slug: subcategorySlug, parentSlug: categorySlug, isActive: true }).lean(),
    Article.find({ categorySlug, subcategorySlug, status: "published" }).sort({ publishedAt: -1 }).limit(24).lean(),
    Article.find({
      categorySlug,
      subcategorySlug: { $ne: subcategorySlug },
      status: "published",
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const subName =
    (subDoc as { name?: string } | null)?.name || pretty(subcategorySlug);
  const catName = pretty(categorySlug);
  const intro = subcategoryIntro(categorySlug, subName);
  const articles =
    (dbArticles as Record<string, unknown>[]).length > 0 ? (dbArticles as Record<string, unknown>[]) : [];
  const related = relatedRows as Record<string, unknown>[];

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-14">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${categorySlug}`} className="capitalize hover:underline">
          {catName}
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-foreground">{subName}</span>
      </nav>
      <header className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-6 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Focused style guide</p>
            <h1 className="mt-3 font-heading text-4xl capitalize leading-tight md:text-5xl">{intro.headline}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{intro.dek}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/80">{intro.tip}</p>
          </div>
          <div className="relative min-h-72">
            <Image
              src={heroImage}
              alt={`${subName} inspiration for ${catName} decor`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
              unoptimized={heroImage.startsWith("http")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Editorial guides for {subName}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Detailed, SEO-rich articles with practical recommendations, color palette ideas, furniture advice, FAQs, and internal links.
            </p>
          </div>
          <Link href="/inspiration-gallery" className="text-sm font-semibold text-primary hover:underline">
            Browse visual gallery
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center">
            <h2 className="font-heading text-xl font-semibold">Fresh stories are being edited</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our editors are preparing long-form guides for this subcategory. In the meantime, explore related {catName} articles below.
            </p>
          </div>
        )}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-2xl font-semibold">How to use this inspiration</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["Save the mood", "Notice the palette, the light direction, and the amount of negative space before focusing on products."],
              ["Measure first", "Write down width, height, depth, and clearance so your saved ideas can become realistic purchases."],
              ["Style slowly", "Add one layer at a time, then live with it for a week. Editorial rooms are edited more than they are filled."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-background p-4">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold">Popular searches</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[`${subName} ideas`, `${subName} styling`, `Pinterest ${subName}`, `${catName} decor`].map((search) => (
              <Link
                key={search}
                href={`/search?q=${encodeURIComponent(search)}`}
                className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold">Related {catName} inspiration</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={String(a.slug)} article={a as never} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
