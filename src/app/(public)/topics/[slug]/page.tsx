import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { getTopicHub, topicHubs } from "@/config/curations";
import { searchArticles } from "@/services/article-service";
import { buildMetadata } from "@/lib/utils/seo";

export function generateStaticParams() {
  return topicHubs.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getTopicHub(slug);
  if (!hub) return buildMetadata({ title: "Topic", description: "Editorial decor topic.", path: "/topics" });
  return buildMetadata({
    title: `${hub.title} — ideas, guides & room stories`,
    description: hub.dek.slice(0, 155),
    path: `/topics/${slug}`,
  });
}

export default async function TopicHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = getTopicHub(slug);
  if (!hub) notFound();

  const data = await searchArticles({ q: hub.query, limit: 30, skip: 0 });
  const results = "results" in data ? data.results : [];

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 py-10 sm:px-5 md:px-8 md:py-16">
      {hub.faq?.length ? <JsonLd data={faqSchema(hub.faq)} /> : null}
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{hub.title}</span>
      </nav>
      <h1 className="mt-6 max-w-4xl font-heading text-4xl font-semibold leading-tight md:text-5xl">{hub.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{hub.dek}</p>
      <p className="mt-6 max-w-3xl leading-relaxed text-foreground/90">
        This hub clusters our most relevant playbooks — use it as a starting line for saves, shopping lists, and seasonal refreshes.
        Every card below opens a full editorial with FAQs and internal links to room guides.
      </p>

      <section className="mt-14">
        <h2 className="font-heading text-2xl font-semibold">Stories in this world</h2>
        <div className="mt-8 grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((a) => (
            <ArticleCard key={String(a.slug)} article={a as never} />
          ))}
        </div>
        {!results.length ? (
          <p className="mt-8 text-muted-foreground">More stories are on the way — browse categories or search for similar terms.</p>
        ) : null}
      </section>

      <section className="mt-16 rounded-3xl border border-border bg-muted/25 p-8">
        <h2 className="font-heading text-xl font-semibold">Also explore</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {topicHubs
            .filter((h) => h.slug !== slug)
            .slice(0, 4)
            .map((h) => (
              <Link key={h.slug} href={`/topics/${h.slug}`} className="rounded-full border bg-card px-4 py-2 text-sm hover:border-primary">
                {h.title}
              </Link>
            ))}
          <Link href="/inspiration/feed" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Inspiration feed
          </Link>
        </div>
      </section>
    </div>
  );
}
