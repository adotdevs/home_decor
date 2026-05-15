/**
 * Merged “page copy” for public category hubs — all fields have defaults; Mongo `hubPageCopy` overrides.
 */
export type CategoryHubPageCopy = {
  heroEyebrow: string;
  exploreHeading: string;
  exploreIntro: string;
  subCardBlurb: string;
  latestHeading: string;
  latestIntro: string;
  editorsHeading: string;
  editorsIntro: string;
  faqHeading: string;
  faqItems: { question: string; answer: string }[];
};

export type SubcategoryHubPageCopy = {
  heroEyebrow: string;
  guidesHeading: string;
  guidesIntro: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  howToHeading: string;
  howToColumns: { title: string; body: string }[];
  popularSearches: string[];
  relatedHeading: string;
};

/** Optional overrides stored on Category.hubPageCopy */
export type CategoryHubPageCopyDb = Partial<{
  heroEyebrow: string;
  exploreHeading: string;
  exploreIntro: string;
  subCardBlurb: string;
  latestHeading: string;
  latestIntro: string;
  editorsHeading: string;
  editorsIntro: string;
  faqHeading: string;
  faqItems: { question?: string; answer?: string }[];
  subHeroEyebrow: string;
  guidesHeading: string;
  guidesIntro: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  howToHeading: string;
  howToColumns: { title?: string; body?: string }[];
  popularSearches: string[];
  relatedHeading: string;
}>;

export function defaultTopHubPageCopy(categoryDisplayName: string): CategoryHubPageCopy {
  return {
    heroEyebrow: "Room guide",
    exploreHeading: "Explore by subcategory",
    exploreIntro:
      "Each subcategory opens a focused editorial hub with long-form styling advice, FAQs, and related inspiration.",
    subCardBlurb:
      "Palette ideas, proportion notes, product-adjacent styling, and practical maintenance tips.",
    latestHeading: `Latest ${categoryDisplayName} stories`,
    latestIntro:
      "Long-form, search-friendly articles written like real room consultations rather than thin inspiration cards.",
    editorsHeading: "Editor's first reads",
    editorsIntro:
      "Start here if you want the strongest combination of visual inspiration and practical styling logic — drawn from our site-wide editor's picks in this category.",
    faqHeading: "Category FAQ",
    faqItems: [
      {
        question: "Where should I start if the room feels unfinished?",
        answer:
          "Start with scale and light before accessories. A larger lamp, better curtains, or one substantial rug often solves more than several small objects.",
      },
      {
        question: "How do I keep inspiration from feeling copied?",
        answer:
          "Copy the composition, not the products. Repeat the palette structure and height variation, then add one personal object so the room belongs to you.",
      },
    ],
  };
}

export function defaultSubHubPageCopy(categoryDisplayName: string, subDisplayName: string): SubcategoryHubPageCopy {
  return {
    heroEyebrow: "Focused style guide",
    guidesHeading: `Editorial guides for ${subDisplayName}`,
    guidesIntro:
      "Detailed, SEO-rich articles with practical recommendations, color palette ideas, furniture advice, FAQs, and internal links.",
    emptyStateTitle: "Fresh stories are being edited",
    emptyStateBody: `Our editors are preparing long-form guides for this subcategory. In the meantime, explore related ${categoryDisplayName} articles below.`,
    howToHeading: "How to use this inspiration",
    howToColumns: [
      {
        title: "Save the mood",
        body: "Notice the palette, the light direction, and the amount of negative space before focusing on products.",
      },
      {
        title: "Measure first",
        body: "Write down width, height, depth, and clearance so your saved ideas can become realistic purchases.",
      },
      {
        title: "Style slowly",
        body: "Add one layer at a time, then live with it for a week. Editorial rooms are edited more than they are filled.",
      },
    ],
    popularSearches: [
      `${subDisplayName} ideas`,
      `${subDisplayName} styling`,
      `Pinterest ${subDisplayName}`,
      `${categoryDisplayName} decor`,
    ],
    relatedHeading: `Related ${categoryDisplayName} inspiration`,
  };
}

function mergeFaq(
  db: { question?: string; answer?: string }[] | undefined,
  fallback: { question: string; answer: string }[],
): { question: string; answer: string }[] {
  if (!db?.length) return fallback;
  const cleaned = db
    .map((x) => ({
      question: String(x.question ?? "").trim(),
      answer: String(x.answer ?? "").trim(),
    }))
    .filter((x) => x.question && x.answer);
  return cleaned.length ? cleaned : fallback;
}

function mergeColumns(
  db: { title?: string; body?: string }[] | undefined,
  fallback: { title: string; body: string }[],
): { title: string; body: string }[] {
  if (!db?.length) return fallback;
  const cleaned = db
    .map((x) => ({ title: String(x.title ?? "").trim(), body: String(x.body ?? "").trim() }))
    .filter((x) => x.title && x.body);
  return cleaned.length ? cleaned : fallback;
}

export function mergeTopHubPageCopy(
  displayName: string,
  db: CategoryHubPageCopyDb | null | undefined,
): CategoryHubPageCopy {
  const d = defaultTopHubPageCopy(displayName);
  if (!db) return d;
  return {
    heroEyebrow: db.heroEyebrow?.trim() || d.heroEyebrow,
    exploreHeading: db.exploreHeading?.trim() || d.exploreHeading,
    exploreIntro: db.exploreIntro?.trim() || d.exploreIntro,
    subCardBlurb: db.subCardBlurb?.trim() || d.subCardBlurb,
    latestHeading: db.latestHeading?.trim() || d.latestHeading,
    latestIntro: db.latestIntro?.trim() || d.latestIntro,
    editorsHeading: db.editorsHeading?.trim() || d.editorsHeading,
    editorsIntro: db.editorsIntro?.trim() || d.editorsIntro,
    faqHeading: db.faqHeading?.trim() || d.faqHeading,
    faqItems: mergeFaq(db.faqItems, d.faqItems),
  };
}

export function mergeSubHubPageCopy(
  categoryDisplayName: string,
  subDisplayName: string,
  db: CategoryHubPageCopyDb | null | undefined,
): SubcategoryHubPageCopy {
  const d = defaultSubHubPageCopy(categoryDisplayName, subDisplayName);
  if (!db) return d;
  const searches =
    Array.isArray(db.popularSearches) && db.popularSearches.length > 0
      ? db.popularSearches.map((s) => String(s).trim()).filter(Boolean)
      : d.popularSearches;
  return {
    heroEyebrow: db.subHeroEyebrow?.trim() || d.heroEyebrow,
    guidesHeading: db.guidesHeading?.trim() || d.guidesHeading,
    guidesIntro: db.guidesIntro?.trim() || d.guidesIntro,
    emptyStateTitle: db.emptyStateTitle?.trim() || d.emptyStateTitle,
    emptyStateBody: db.emptyStateBody?.trim() || d.emptyStateBody,
    howToHeading: db.howToHeading?.trim() || d.howToHeading,
    howToColumns: mergeColumns(db.howToColumns, d.howToColumns),
    popularSearches: searches.length ? searches : d.popularSearches,
    relatedHeading: db.relatedHeading?.trim() || d.relatedHeading,
  };
}
