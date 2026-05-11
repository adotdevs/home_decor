import { images } from "@/config/images";

/** Hand-edited flagship articles (full library also includes generated catalog). */
export const legacyEditorialArticles = [
  {
    title: "How to Layer Bedroom Textures That Feel Boutique-Hotel Luxurious",
    slug: "layer-bedroom-textures-boutique-luxury",
    excerpt:
      "A practical guide to mixing sheets, throws, and cushions for a bedroom that looks expensive but still feels livable.",
    categorySlug: "bedroom",
    subcategorySlug: "bedding-sheets",
    tags: ["bedroom ideas", "layering", "luxury look", "textile mixing"],
    status: "published" as const,
    authorName: "Ahmar",
    authorSlug: "ahmar",
    featuredImage: images.categories.bedroom,
    seoTitle: "Bedroom Texture Layering Tips for a Luxury Look",
    seoDescription:
      "Learn designer-approved ways to layer bedding textures, colors, and accessories for a warm, luxurious bedroom.",
    focusKeyword: "bedroom texture layering",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "The easiest way to make a bedroom feel high-end is to stop thinking in sets and start thinking in layers. Big-box bundles can read flat because every piece carries the same finish. Luxury, by contrast, is almost always tonal variation: matte beside soft sheen, crisp beside rumpled.",
      },
      { type: "heading" as const, level: 2, content: "Start With a Quiet Base" },
      {
        type: "paragraph" as const,
        content:
          "Use one calm base color for your duvet and fitted sheet, then add tonal contrast with throws and cushions. If you need a rule, keep 70% of what you see within two neighboring hues — warm white with sand, or cool gray with graphite — and let the remaining 30% introduce a single accent.",
      },
      {
        type: "image" as const,
        content: "/images/articles/bedding-texture.jpg",
        alt: "Layered neutral bedding with textured throw and soft morning light",
      },
      { type: "heading" as const, level: 2, content: "Mix Three Textures, Not Ten Colors" },
      {
        type: "paragraph" as const,
        content:
          "Try linen or percale for sheets, a chunkier knit or waffle weave for the throw, and velvet or sateen for one pair of cushions. Your eye reads the room as considered because the materials behave differently in light — not because you chased every trending shade.",
      },
      {
        type: "quote" as const,
        content:
          "Boutique bedrooms rarely shout their budget. They whisper with weight — heavier fabric, denser inserts, slower draping.",
      },
      {
        type: "list" as const,
        content:
          "Upgrade pillow inserts before pillow covers\nIron only what sits in the hero stack; let the throw look lived-in\nKeep bedside lamps at eye level when seated for a flattering glow",
      },
    ],
    faq: [
      {
        question: "How many pillows are too many?",
        answer: "For most queen beds, four to six is enough for comfort and style without blocking artwork or feeling theatrical.",
      },
      {
        question: "Can I mix warm and cool neutrals?",
        answer:
          "Yes — choose one dominant temperature and borrow the other in small accents only, so the room does not feel muddy.",
      },
    ],
    internalLinks: ["/category/bedroom", "/latest"],
  },
  {
    title: "Bathroom Counter Styling Ideas That Survive Real Mornings",
    slug: "bathroom-counter-styling-practical",
    excerpt: "Simple styling systems that keep countertops beautiful and functional through busy routines.",
    categorySlug: "bathroom",
    subcategorySlug: "bathroom-accessories",
    tags: ["bathroom decor", "styling", "organization", "organic modern"],
    status: "published" as const,
    authorName: "Noor Siddiqui",
    authorSlug: "noor-siddiqui",
    featuredImage: images.categories.bathroom,
    seoTitle: "Bathroom Counter Styling That Stays Tidy",
    seoDescription: "Create a premium bathroom look with practical tray systems, towel layering, and elevated accessories.",
    focusKeyword: "bathroom counter styling",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "Beautiful bathrooms are usually built on tiny routines. The trick is giving every daily object a visual home so your eye can rest. Trays are not decorative fluff — they are hierarchy. They tell you what belongs to the morning ritual versus the guest-ready shelf.",
      },
      { type: "heading" as const, level: 2, content: "Use a Three-Zone Layout" },
      {
        type: "paragraph" as const,
        content:
          "Zone one holds what you touch before leaving — toothbrush, serum, hand soap in a pump you actually like. Zone two is display: a small vessel, a candle, or a folded hand towel that reads like a moment. Zone three is breathing room — nothing but surface and grout lines.",
      },
      {
        type: "image" as const,
        content: "/images/heroes/spa-bathroom.jpg",
        alt: "Minimal bathroom counter with stone tray and neutral accessories",
      },
    ],
    faq: [
      {
        question: "What material tray holds up best near sinks?",
        answer: "Resin, sealed stone, or powder-coated metal forgive splashes better than raw wood. If you love wood, seal it and wipe aggressively.",
      },
    ],
    internalLinks: ["/category/bathroom", "/inspiration-gallery"],
  },
  {
    title: "Kitchen Counter Decor That Looks Styled, Not Cluttered",
    slug: "kitchen-counter-decor-styled-not-cluttered",
    excerpt: "Create an editorial kitchen look with trays, ceramics, and practical everyday zoning.",
    categorySlug: "kitchen-and-table",
    subcategorySlug: "kitchen-accessories",
    tags: ["kitchen decor", "counter styling", "home organization", "small-space styling"],
    status: "published" as const,
    authorName: "Hiba Nadeem",
    authorSlug: "hiba-nadeem",
    featuredImage: images.categories.kitchen,
    seoTitle: "Kitchen Counter Decor Ideas for a Clean Luxury Look",
    seoDescription:
      "Learn how to style kitchen counters with practical decor groupings that still feel elegant and functional.",
    focusKeyword: "kitchen counter decor ideas",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "The secret to beautiful countertops is limiting visual noise. Group items by purpose, then style those groups intentionally — your brain should understand the story in one glance.",
      },
      { type: "heading" as const, level: 2, content: "Use One Hero Tray Per Zone" },
      {
        type: "paragraph" as const,
        content:
          "A coffee zone and a prep zone instantly make your counter look planned instead of crowded. Keep the tray footprint modest so work space still exists.",
      },
      {
        type: "image" as const,
        content: "/images/heroes/open-kitchen.jpg",
        alt: "Styled kitchen counter with tray, ceramics, and natural light",
      },
    ],
    faq: [
      {
        question: "How much counter should stay empty?",
        answer: "Aim to keep at least 35% clear for prep and for the room to visually breathe.",
      },
    ],
    internalLinks: ["/category/kitchen-and-table", "/latest"],
  },
  {
    title: "Warm Lighting Corners With Lamps and Candles",
    slug: "warm-lighting-corners-lamps-candles",
    excerpt: "Layer ambient lighting to create cozy evening moods in living and bedroom spaces.",
    categorySlug: "decoration",
    subcategorySlug: "lamps",
    tags: ["ambient lighting", "cozy decor", "lamps", "mood lighting"],
    status: "published" as const,
    authorName: "Ahmar",
    authorSlug: "ahmar",
    featuredImage: images.categories.decoration,
    seoTitle: "How to Style Warm Lighting Corners at Home",
    seoDescription: "Practical lamp and candle combinations to design warm, relaxing decor corners.",
    focusKeyword: "warm lighting decor",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "If a room feels flat, it usually needs layered light. Overheads alone rarely create atmosphere — they erase shadows that make textures feel expensive.",
      },
      { type: "heading" as const, level: 2, content: "Combine Heights and Glow Temperatures" },
      {
        type: "paragraph" as const,
        content:
          "Pair a mid-height lamp with lower candlelight for depth. Keep bulb temperatures consistent in each vignette so mixed white reads intentional.",
      },
    ],
    faq: [
      {
        question: "Should every corner have a lamp?",
        answer: "No — choose one or two mood zones per room so the layout still feels disciplined.",
      },
    ],
    internalLinks: ["/category/decoration", "/trending"],
  },
  {
    title: "Wall Canvas Arrangement Formulas That Always Work",
    slug: "wall-canvas-arrangement-formulas",
    excerpt: "Spacing and composition rules for gallery walls without guesswork.",
    categorySlug: "wall-decor",
    subcategorySlug: "wall-canvas-art",
    tags: ["wall decor", "canvas art", "gallery wall", "heritage details"],
    status: "published" as const,
    authorName: "Noor Siddiqui",
    authorSlug: "noor-siddiqui",
    featuredImage: images.categories.wallDecor,
    seoTitle: "Wall Canvas Layout Ideas for Modern Homes",
    seoDescription: "Composition formulas to style wall canvas art like an interior editor.",
    focusKeyword: "wall canvas layout ideas",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "Great wall art starts with alignment. Choose your center line at seated eye level for living rooms and slightly higher in hallways with movement.",
      },
      { type: "heading" as const, level: 2, content: "Start at Eye Level, Then Expand Outward" },
      {
        type: "paragraph" as const,
        content:
          "Ripple outward with 2–3 inch gaps for a tight editorial grid, or 4–6 inches if you want each piece to breathe.",
      },
    ],
    faq: [
      {
        question: "What spacing works between frames?",
        answer: "Two to three inches reads high-end for salon-style walls; measure once with painter's tape first.",
      },
    ],
    internalLinks: ["/category/wall-decor", "/inspiration-gallery"],
  },
  {
    title: "Kids Bedroom Decor That Grows With Their Personality",
    slug: "kids-bedroom-decor-that-grows",
    excerpt: "Design a playful room that still feels tidy and adaptable as children grow.",
    categorySlug: "kids-ideas",
    subcategorySlug: "bedroom",
    tags: ["kids room", "bedroom styling", "family home", "kid-proof design"],
    status: "published" as const,
    authorName: "Hiba Nadeem",
    authorSlug: "hiba-nadeem",
    featuredImage: images.categories.kids,
    seoTitle: "Kids Bedroom Decor Ideas for Long-Term Flexibility",
    seoDescription: "Colorful yet practical kids spaces with adaptable decor layers and storage.",
    focusKeyword: "kids bedroom decor ideas",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "Keep permanent pieces neutral and let personality arrive through easy swaps: bedding, art prints, and hooks for rotating collections.",
      },
      { type: "heading" as const, level: 2, content: "Use Flexible Color in Textiles" },
      {
        type: "paragraph" as const,
        content:
          "Sheets and cushions evolve faster than furniture. Aim for washable layers you can replace in a season.",
      },
    ],
    faq: [
      {
        question: "How many accent colors should a kids room use?",
        answer: "One base neutral plus two playful accents keeps energy high without visual overload.",
      },
    ],
    internalLinks: ["/category/kids-ideas", "/latest"],
  },
  {
    title: "Bathroom Towel Styling for a Spa-Like Everyday Routine",
    slug: "bathroom-towel-styling-spa-look",
    excerpt: "Towel stacks and hanging sets that look polished and still work daily.",
    categorySlug: "bathroom",
    subcategorySlug: "towels",
    tags: ["bathroom towels", "spa decor", "bathroom styling", "coastal calm"],
    status: "published" as const,
    authorName: "Ahmar",
    authorSlug: "ahmar",
    featuredImage: images.categories.bathroom,
    seoTitle: "Bathroom Towel Styling Ideas for a Spa-Like Look",
    seoDescription: "Towel folding and color pairing tips to elevate bathroom decor.",
    focusKeyword: "bathroom towel styling",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "Texture beats pattern in towels. Mix ribbed with velour finishes in close tones for subtle variation.",
      },
      { type: "heading" as const, level: 2, content: "Pick Two Neutrals and One Accent" },
      {
        type: "paragraph" as const,
        content:
          "Two calm neutrals keep the rack quiet; one accent — blush, sage, or ink — adds editorial punch without theme-park color.",
      },
    ],
    faq: [
      {
        question: "Should bath mats match towels exactly?",
        answer: "Tonal variation looks richer than an exact match set.",
      },
    ],
    internalLinks: ["/category/bathroom", "/trending"],
  },
  {
    title: "Bedroom Rug Placement Rules for Softer, Bigger-Looking Rooms",
    slug: "bedroom-rug-placement-rules",
    excerpt: "Rug proportions and placement to visually enlarge and warm your bedroom.",
    categorySlug: "bedroom",
    subcategorySlug: "floor-mats-and-rugs",
    tags: ["bedroom rugs", "room layout", "interior styling", "layered neutrals"],
    status: "published" as const,
    authorName: "Noor Siddiqui",
    authorSlug: "noor-siddiqui",
    featuredImage: images.categories.bedroom,
    seoTitle: "Bedroom Rug Placement Ideas That Make Rooms Look Larger",
    seoDescription: "Rug positioning for queen and king beds with designer proportions.",
    focusKeyword: "bedroom rug placement",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "A rug should anchor the bed so your first step lands on softness. Floating rugs shrink rooms psychologically.",
      },
      { type: "heading" as const, level: 2, content: "Let the Rug Extend Beyond Side Tables" },
      {
        type: "paragraph" as const,
        content:
          "Try at least 24 inches visible beyond the bed sides on queen layouts; kings need more width or layered rugs.",
      },
    ],
    faq: [
      {
        question: "Can you layer rugs in a bedroom?",
        answer: "Yes — a larger jute base with a smaller vintage top adds texture while protecting spend.",
      },
    ],
    internalLinks: ["/category/bedroom", "/search?q=rug"],
  },
  {
    title: "Decorative Storage Baskets That Look Intentional in Every Room",
    slug: "decorative-storage-baskets-intentional",
    excerpt: "Basket materials, scale, and placement that blend storage into your visual story.",
    categorySlug: "decoration",
    subcategorySlug: "baskets-and-boxes",
    tags: ["storage decor", "baskets", "organization", "Pinterest-worthy"],
    status: "published" as const,
    authorName: "Hiba Nadeem",
    authorSlug: "hiba-nadeem",
    featuredImage: images.categories.decoration,
    seoTitle: "Decorative Storage Basket Ideas for Stylish Organization",
    seoDescription: "Woven, leather, and fabric basket arrangements for modern interiors.",
    focusKeyword: "decorative storage baskets",
    contentBlocks: [
      {
        type: "paragraph" as const,
        content:
          "Storage reads luxe when scale matches the furniture. Tiny baskets beside an oversized sofa look apologetic — choose one confident size.",
      },
      { type: "heading" as const, level: 2, content: "Group in Odd Numbers" },
      {
        type: "paragraph" as const,
        content:
          "A trio in graduated sizes feels collected. Keep finishes related — warm naturals together, cool naturals together.",
      },
    ],
    faq: [
      {
        question: "Where do large baskets belong?",
        answer: "Beside sofas, at the foot of beds, or under console tables — anywhere traffic still flows.",
      },
    ],
    internalLinks: ["/category/decoration", "/inspiration-gallery"],
  },
];
