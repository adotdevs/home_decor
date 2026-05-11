import Link from "next/link";
import Image from "next/image";
const nav = [
  ["Latest", "/latest"],
  ["Trending", "/trending"],
  ["Feed", "/inspiration/feed"],
  ["Gallery", "/inspiration-gallery"],
  ["Tags", "/tags"],
  ["Newsletter", "/newsletter"],
] as const;
export function SiteHeader() { return <header className="sticky top-0 z-40 border-b border-black/5 bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8"><Link href="/" className="flex items-center gap-3"><Image src="/logo.svg" alt="Luxe Home Decor Ideas logo" width={150} height={30} priority /></Link><nav className="hidden items-center gap-6 text-sm md:flex">{nav.map(([label, href]) => <Link key={href} href={href} className="text-muted-foreground transition-colors hover:text-foreground">{label}</Link>)}</nav><Link href="/admin/login" className="text-sm font-medium">Admin</Link></div></header>; }