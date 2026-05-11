import Link from "next/link";

const links: [string, string][] = [
  ["Dashboard", "/admin"],
  ["Analytics", "/admin/analytics"],
  ["Search analytics", "/admin/search-analytics"],
  ["Articles", "/admin/articles"],
  ["Create", "/admin/articles/create"],
  ["Categories", "/admin/categories"],
  ["Ads", "/admin/ads"],
  ["SEO", "/admin/seo"],
  ["Media", "/admin/media"],
  ["Users", "/admin/users"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border bg-card p-4 shadow-sm">
          <p className="mb-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Admin</p>
          <nav className="space-y-1 text-sm">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-lg px-3 py-2 text-foreground/90 transition hover:bg-muted hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 focus:outline-none">{children}</main>
      </div>
    </div>
  );
}
