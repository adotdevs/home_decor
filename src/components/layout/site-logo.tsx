import Image from "next/image";
import { cn } from "@/lib/utils";

/** Matches header/footer lockup in `public/logo.png`. */
export const SITE_LOGO_WIDTH = 200;
export const SITE_LOGO_HEIGHT = 42;

export function SiteLogo({
  siteName,
  className,
  priority,
}: {
  siteName: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={siteName}
      width={SITE_LOGO_WIDTH}
      height={SITE_LOGO_HEIGHT}
      className={cn("h-auto w-[200px] max-w-full", className)}
      priority={priority}
    />
  );
}
