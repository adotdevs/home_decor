import Link from "next/link";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-2">
            {i > 0 ? <span className="text-border">/</span> : null}
            {i === items.length - 1 ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground hover:underline">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
