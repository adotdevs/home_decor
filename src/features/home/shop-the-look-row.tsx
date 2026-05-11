import Link from "next/link";
import Image from "next/image";
import { shopTheLook } from "@/config/curations";

export function ShopTheLookRow() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-3xl font-semibold">Shop the look — editorial picks</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Curated starting points for each room — pair these hubs with our long-form playbooks (affiliate-ready layouts).
          </p>
        </div>
        <Link href="/latest" className="text-sm font-semibold text-primary hover:underline">
          See latest stories
        </Link>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {shopTheLook.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group overflow-hidden rounded-3xl border border-black/5 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 font-heading text-lg text-white drop-shadow">{item.title}</p>
            </div>
            <p className="p-4 text-sm text-muted-foreground">{item.caption}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
