/**
 * Default homepage hero when SiteEditorialConfig has no slides saved.
 */
import { images } from "@/config/images";

export type HeroSlideConfig = {
  src: string;
  alt: string;
  href: string;
  kicker: string;
  headline: string;
  dek: string;
  detail: string;
};

export const DEFAULT_HERO_SLIDES: HeroSlideConfig[] = [
  {
    src: images.heroes.editorialLiving,
    alt: "Sunlit living room with layered neutral decor",
    href: "/category/decoration",
    kicker: "Living",
    headline: "Rooms that feel lived in, still editorial",
    dek: "Light, seating, and quiet contrast — ideas you can copy without a full reno.",
    detail:
      "Browse layouts that balance negative space with tactile pieces: rugs that anchor the floor plan, lamps that draw the eye, and a sofa line that still leaves room for circulation.",
  },
  {
    src: images.heroes.luxeBedroom,
    alt: "Serene bedroom with soft textiles",
    href: "/category/bedroom",
    kicker: "Bedroom",
    headline: "Calm layers for real sleep",
    dek: "Bedding, drapes, and tones that stay soft after laundry day, not just install day.",
    detail:
      "We favor breathable layers you can refresh seasonally, blackout solutions that still feel romantic, and nightstand setups with cord discipline — small edits that read luxe on camera and off.",
  },
  {
    src: images.heroes.openKitchen,
    alt: "Bright kitchen with natural materials",
    href: "/category/kitchen-and-table",
    kicker: "Kitchen & table",
    headline: "Tables worth lingering at",
    dek: "Serveware, surfaces, and styling notes for hosts who care about the Tuesday night meal, too.",
    detail:
      "From counter vignettes that survive coffee spills to table stories built on mix-and-match ceramics, these guides prioritize function first — then the polish that makes guests linger.",
  },
];
