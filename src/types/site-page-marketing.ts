/** Keys for Mongo `SitePageMarketing` documents (one row per key). */
export type SiteMarketingPageKey =
  | "global-marketing"
  | "inspiration-feed"
  | "newsletter"
  | "about"
  | "inspiration-gallery"
  | "latest"
  | "legal-privacy"
  | "legal-terms"
  | "legal-cookies";

export type LegalSection = { title: string; body: string };

export type CookieTypeRow = {
  type: string;
  purpose: string;
  examples: string;
  canDisable: boolean;
};

export type BenefitCard = { title: string; description: string };

export type PeekPreviewImage = { src: string; alt: string };

export type AboutStat = { value: string; label: string };

export type AboutPillar = { icon: string; title: string; body: string };

export type AboutTeamMember = {
  name: string;
  role: string;
  bio: string;
  href: string;
  initial: string;
  colorClass: string;
};

export type GalleryRoomBlurb = { title: string; body: string };

export type BulletPair = { title: string; body: string };

/** Stored under `SitePageMarketing.data` for key `global-marketing` */
export type GlobalMarketingPayload = {
  /** Site footer — mini newsletter strip line (above email field) */
  footerMiniNewsletterLine: string;
  /** Site footer — subscribe button label */
  footerSubscribeButtonLabel: string;
  /** Site footer — email input placeholder */
  footerEmailPlaceholder: string;
};

/** `/inspiration/feed` */
export type InspirationFeedMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  editorialListLinkText: string;
};

/** `/newsletter` */
export type NewsletterMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  /** Use {highlight}, {siteName} — highlight may be empty */
  heroLeadWithHighlight: string;
  heroLeadWithoutHighlight: string;
  footerDisclaimer: string;
  benefitsSectionTitle: string;
  benefitsSectionIntro: string;
  benefits: BenefitCard[];
  peekSectionTitle: string;
  peekSectionIntro: string;
  peekEmailFromPrefix: string;
  /** Supports `{siteName}` */
  peekEmailFromBody: string;
  peekEmailSubjectPrefix: string;
  peekEmailSubjectHighlight: string;
  peekInnerTitle: string;
  peekInnerBody: string;
  peekImages: PeekPreviewImage[];
  peekReadFullCta: string;
  reviewsFallbackCopy: string;
  bottomPromptWithHighlight: string;
  bottomPromptWithoutHighlight: string;
  bottomSubscribeCta: string;
  /** Mongo ArticleReview `_id` hex strings; empty = auto-pick reviews */
  featuredReviewIds: string[];
};

/** `/about` */
export type AboutMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroBackgroundImageSrc: string;
  heroBackgroundImageAlt: string;
  stats: AboutStat[];
  pillarsIntroTitle: string;
  pillarsIntroBody: string;
  pillars: AboutPillar[];
  howWeWriteTitle: string;
  howWeWriteParagraph1: string;
  howWeWriteParagraph2: string;
  teamSectionTitle: string;
  teamSectionIntro: string;
  team: AboutTeamMember[];
  newsletterCtaTitle: string;
  newsletterCtaBody: string;
  newsletterCtaButtonLabel: string;
};

/** `/inspiration-gallery` */
export type InspirationGalleryMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  breadcrumbCurrentLabel: string;
  heroEyebrow: string;
  h1: string;
  /** Use {count} for gallery photo count */
  heroDescriptionTemplate: string;
  howToTitle: string;
  howToBody: string;
  roomBlurbs: GalleryRoomBlurb[];
  bottomCtaTitle: string;
  bottomCtaBody: string;
  bottomCtaButtonLabel: string;
};

/** `/latest` */
export type LatestMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  bulletColumns: BulletPair[];
};

export type LegalPageMarketingPayload = {
  metaTitle: string;
  metaDescription: string;
  pageH1: string;
  lastUpdatedLabel: string;
  leadParagraph: string;
  sections: LegalSection[];
  footerLink1Label?: string;
  footerLink1Href?: string;
  footerLink2Label?: string;
  footerLink2Href?: string;
};

export type CookiePolicyMarketingPayload = LegalPageMarketingPayload & {
  cookieIntro: string;
  cookieTypes: CookieTypeRow[];
};

export type TermsMarketingPayload = LegalPageMarketingPayload & {
  termsFooterLead: string;
  termsFooterLinkLabel: string;
  termsFooterTrail: string;
};
