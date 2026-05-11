import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/ads/ad-slot";
import { ArticleShareRow } from "@/components/article/article-share-row";
import { ReadingProgress } from "@/components/article/reading-progress";
import { RelatedArticlesRail } from "@/components/article/related-articles-rail";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

type Block = {
  type: string;
  content: string;
  level?: number;
  alt?: string;
};

function slugifyHeading(text: string, i: number) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `section-${i}`
  );
}

export function ArticleDetail({
  article,
  related,
  shareBaseUrl,
}: {
  article: Record<string, unknown>;
  related: Array<Record<string, unknown>>;
  shareBaseUrl: string;
}) {
  const blocks = (article.contentBlocks || []) as Block[];
  const toc = blocks
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.type === "heading")
    .map(({ b, i }) => ({ text: b.content, id: slugifyHeading(b.content, i) }));

  const categorySlug = String(article.categorySlug || "");
  const subSlug = String(article.subcategorySlug || "");

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-6xl px-4 py-8 md:py-14 md:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: categorySlug ? categorySlug.replace(/-/g, " ") : "Ideas", href: `/category/${categorySlug}` },
            ...(subSlug
              ? [{ label: subSlug.replace(/-/g, " "), href: `/category/${categorySlug}/${subSlug}` }]
              : []),
            { label: String(article.title || "").slice(0, 48), href: `/article/${article.slug}` },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{categorySlug.replace(/-/g, " ")}</p>
            <h1 className="font-heading mt-3 text-4xl leading-[1.08] md:text-5xl lg:text-6xl">{String(article.title)}</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">{String(article.excerpt || "")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.authorName ? (
                <Link href={`/author/${article.authorSlug}`} className="font-medium text-foreground hover:underline">
                  {String(article.authorName)}
                </Link>
              ) : null}
              <span>{article.readingTime ? `${article.readingTime} min read` : "Feature"}</span>
              {article.publishedAt ? (
                <time dateTime={new Date(article.publishedAt as string).toISOString()}>
                  {new Date(article.publishedAt as string).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              ) : null}
            </div>
            <ArticleShareRow baseUrl={shareBaseUrl} title={String(article.title)} slug={String(article.slug)} />

            {article.featuredImage ? (
              <div className="relative mt-10 aspect-[21/9] w-full overflow-hidden rounded-3xl border border-black/5 shadow-lg md:aspect-[2.4/1]">
                <Image
                  src={String(article.featuredImage)}
                  alt={`${String(article.title)} — hero photograph for editorial decor feature`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                />
              </div>
            ) : null}

            {toc.length > 0 ? (
              <nav aria-label="In this article" className="mt-10 rounded-2xl border border-black/5 bg-card/50 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">In this story</p>
                <ol className="mt-4 space-y-2 text-sm">
                  {toc.map((row) => (
                    <li key={row.id}>
                      <a href={`#${row.id}`} className="text-foreground underline-offset-4 hover:underline">
                        {row.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="prose prose-neutral mt-12 max-w-none space-y-6 dark:prose-invert">
              {blocks.map((block, i) => {
                if (block.type === "heading") {
                  const id = slugifyHeading(block.content, i);
                  const level = block.level || 2;
                  const Tag = level === 3 ? "h3" : "h2";
                  return (
                    <Tag key={i} id={id} className="font-heading scroll-mt-28 text-2xl font-semibold md:text-3xl">
                      {block.content}
                    </Tag>
                  );
                }
                if (block.type === "image") {
                  return (
                    <figure key={i} className="my-10 overflow-hidden rounded-2xl border border-black/5 shadow-sm">
                      <div className="relative aspect-[16/10] w-full">
                        <Image
                          src={block.content}
                          alt={block.alt || "Decor inspiration photograph supporting the article"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 800px"
                        />
                      </div>
                    </figure>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={i}
                      className="border-l-4 border-primary/40 py-2 pl-6 font-heading text-xl italic leading-relaxed text-foreground/90"
                    >
                      {block.content}
                    </blockquote>
                  );
                }
                if (block.type === "list") {
                  const lines = block.content.split("\n").filter(Boolean);
                  return (
                    <ul key={i} className="list-disc space-y-2 pl-6 text-base leading-relaxed">
                      {lines.map((line, j) => (
                        <li key={j}>{line}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="text-base leading-relaxed text-foreground/90 md:text-lg">
                    {block.content}
                  </p>
                );
              })}
            </div>

            <div className="my-12">
              <AdSlot placement="in-content" />
            </div>

            {Array.isArray(article.faq) && article.faq.length > 0 ? (
              <section className="mt-12 rounded-3xl border border-black/5 bg-muted/20 p-6 md:p-8">
                <h2 className="font-heading text-2xl font-semibold">Questions readers ask</h2>
                <div className="mt-6 space-y-3">
                  {(article.faq as { question: string; answer: string }[]).map((f, idx) => (
                    <details key={idx} className="group rounded-2xl border bg-card px-4 py-3">
                      <summary className="cursor-pointer font-medium">{f.question}</summary>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            {Array.isArray(article.internalLinks) && article.internalLinks.length > 0 ? (
              <section className="mt-10">
                <h2 className="font-heading text-xl font-semibold">Keep exploring</h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {(article.internalLinks as string[]).map((href) => (
                    <li key={href}>
                      <Link href={href} className="rounded-full border bg-card px-4 py-2 text-sm hover:bg-muted">
                        {href.replace(/\//g, " ").trim() || href}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sponsored</p>
                <div className="mt-4">
                  <AdSlot placement="sidebar" />
                </div>
              </div>
              <RelatedArticlesRail articles={related} />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
