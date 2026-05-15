import Link from "next/link";

const LINKS: { href: string; label: string; hint: string }[] = [
  { href: "/admin/pages/global-marketing", label: "Site footer newsletter strip", hint: "Mini signup row above footer on all pages" },
  { href: "/admin/pages/inspiration-feed", label: "Inspiration feed (/inspiration/feed)", hint: "" },
  { href: "/admin/pages/newsletter", label: "Newsletter (/newsletter)", hint: "" },
  { href: "/admin/pages/about", label: "About (/about)", hint: "" },
  { href: "/admin/pages/inspiration-gallery", label: "Inspiration gallery (/inspiration-gallery)", hint: "" },
  { href: "/admin/pages/latest", label: "Latest (/latest)", hint: "" },
  { href: "/admin/pages/legal", label: "Legal (privacy, terms, cookies)", hint: "" },
  { href: "/admin/pages/seasonal", label: "Seasonal hubs (/inspiration/seasonal/…)", hint: "" },
];

export default function AdminPagesHub() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Public page marketing</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Edit visible copy and marketing images for standalone routes. Site name / global meta description still live under Site &
          seasons.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="font-medium text-foreground">{l.label}</span>
              {l.hint ? <p className="mt-1 text-xs text-muted-foreground">{l.hint}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
