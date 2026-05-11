import Link from "next/link";
import { topicHubs } from "@/config/curations";

export function ExploreTopicGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
      <h2 className="font-heading text-3xl font-semibold">Explore by mood &amp; style</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">Deep-dive editorial hubs — FAQs, internal links, and save-worthy imagery.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topicHubs.map((hub) => (
          <Link
            key={hub.slug}
            href={`/topics/${hub.slug}`}
            className="group rounded-3xl border border-black/5 bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Topic hub</p>
            <h3 className="mt-3 font-heading text-xl font-semibold">{hub.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{hub.dek}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">Open guide →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
