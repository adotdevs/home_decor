import type {
  AboutMarketingPayload,
  CookiePolicyMarketingPayload,
  GlobalMarketingPayload,
  InspirationFeedMarketingPayload,
  InspirationGalleryMarketingPayload,
  LatestMarketingPayload,
  LegalPageMarketingPayload,
  LegalSection,
  NewsletterMarketingPayload,
  SiteMarketingPageKey,
  TermsMarketingPayload,
} from "@/types/site-page-marketing";

export const DEFAULT_GLOBAL_MARKETING: GlobalMarketingPayload = {
  footerMiniNewsletterLine: "Get weekly interior inspiration in your inbox — join 12,000+ readers",
  footerSubscribeButtonLabel: "Subscribe",
  footerEmailPlaceholder: "Your email address",
};

export const DEFAULT_INSPIRATION_FEED_MARKETING: InspirationFeedMarketingPayload = {
  metaTitle: "Inspiration feed — Pinterest-style decor ideas",
  metaDescription:
    "Scroll an endless-style feed of editorial home decor stories: bedrooms, kitchens, baths, walls, and kids' spaces.",
  eyebrow: "Infinite-scroll mood",
  h1: "Inspiration feed",
  intro:
    "Save-worthy visuals with substance — each tile links to a full article with FAQs, sources, and styling logic. Filter by room to focus your inspiration.",
  editorialListLinkText: "Editorial list view →",
};

export const DEFAULT_NEWSLETTER_MARKETING: NewsletterMarketingPayload = {
  metaTitle: "Newsletter",
  metaDescription:
    "Weekly editorial decor inspiration, seasonal guides, and Pinterest-worthy room ideas in your inbox.",
  heroEyebrow: "Weekly editorial",
  heroTitle: "Your home, beautifully curated",
  heroLeadWithHighlight:
    "Join {highlight} readers who get our weekly edit of the best interior ideas, seasonal guides, and Pinterest-worthy inspiration straight to their inbox.",
  heroLeadWithoutHighlight:
    "Join readers of {siteName} who get our weekly edit of the best interior ideas, seasonal guides, and Pinterest-worthy inspiration straight to their inbox.",
  footerDisclaimer: "One email per week. Unsubscribe any time. No spam.",
  benefitsSectionTitle: "What you'll get",
  benefitsSectionIntro: "Every issue is crafted with the same editorial care we put into our articles.",
  benefits: [
    {
      title: "Weekly curated edits",
      description:
        "Every Friday, a hand-picked selection of the best new decor ideas, room transformations, and styling tips.",
    },
    {
      title: "Seasonal guides first",
      description: "Be the first to receive our in-depth seasonal guides before they're published on the site.",
    },
    {
      title: "Trending picks & mood boards",
      description: "Our editors compile the top Pinterest-worthy ideas of the week into a quick, beautiful digest.",
    },
    {
      title: "No spam, ever",
      description: "We send one email per week, always worth reading. Unsubscribe in one click at any time.",
    },
  ],
  peekSectionTitle: "A peek inside",
  peekSectionIntro: "Here's what a typical Friday edit looks like in your inbox.",
  peekEmailFromPrefix: "From:",
  peekEmailFromBody: "The {siteName} editors",
  peekEmailSubjectPrefix: "Subject:",
  peekEmailSubjectHighlight: "This week's edit: Japandi meets Boho",
  peekInnerTitle: "This week in your home",
  peekInnerBody:
    "Happy Friday! This week we're exploring the beautiful collision of Japandi minimalism and Boho warmth — the decorating philosophy that's taking over Pinterest right now. Plus: the 3 lamps that make any living room feel cosier, and our editor's pick for the best affordable bedding this season.",
  peekImages: [
    { src: "/images/assets/general/design-interior-light-room-minimal-items.jpg", alt: "Newsletter interior inspiration preview" },
    {
      src: "/images/assets/general/contemporary-coolness_-a-minimalist-living-room-in-a-navy-and-gray-palette.jpg",
      alt: "Newsletter interior inspiration preview",
    },
    {
      src: "/images/assets/general/top-5-cozy-living-room-decor-ideas-for-a-stylish-comfortable-space.jpg",
      alt: "Newsletter interior inspiration preview",
    },
  ],
  peekReadFullCta: "Read full issue →",
  reviewsFallbackCopy:
    "As readers leave feedback on guides across the site, warm notes we can feature here will appear automatically — share yours on any article you love.",
  bottomPromptWithHighlight: "Ready to join {highlight} subscribers?",
  bottomPromptWithoutHighlight: "Ready for the weekly edit from our editors?",
  bottomSubscribeCta: "Subscribe free — it only takes 10 seconds",
  featuredReviewIds: [],
};

export const DEFAULT_ABOUT_MARKETING: AboutMarketingPayload = {
  metaTitle: "About Core Fusion Infinity — Our Editorial Mission",
  metaDescription:
    "Learn about Core Fusion Infinity — an editorial home decor platform dedicated to real-room inspiration, seasonal styling guides, and beautifully curated interior ideas for every home.",
  ogTitle: "About Core Fusion Infinity",
  ogDescription:
    "An editorial home decor platform dedicated to real-room inspiration, seasonal styling guides, and beautifully curated interior ideas.",
  heroEyebrow: "Our story",
  heroTitle: "We believe every home has a story worth telling",
  heroLead:
    "Core Fusion Infinity started as a single mood board. Today it's an editorial platform helping thousands of readers find the ideas, confidence, and clarity to make their home feel like themselves.",
  heroBackgroundImageSrc: "",
  heroBackgroundImageAlt: "",
  stats: [
    { value: "200+", label: "Articles published" },
    { value: "6", label: "Room categories" },
    { value: "12K+", label: "Monthly readers" },
    { value: "83+", label: "Curated inspiration photos" },
  ],
  pillarsIntroTitle: "What we believe",
  pillarsIntroBody: "Three editorial principles guide every article, guide, and gallery we publish.",
  pillars: [
    {
      icon: "✦",
      title: "Editorial before commercial",
      body: "Every article we publish is written to genuinely help you make a decision, not to push a product. Our recommendations come from real rooms, real stylists, and real results — not sponsored rankings.",
    },
    {
      icon: "✦",
      title: "Seasonal, not static",
      body: "Your home should evolve with the rhythms of the year. We publish seasonal guides each quarter to keep your spaces feeling alive, current, and deeply personal — whether that's a spring refresh or an autumnal reboot.",
    },
    {
      icon: "✦",
      title: "Accessible luxury",
      body: "Great design is not a budget. It's a point of view. We translate the principles behind high-end interior design into approachable, actionable ideas you can apply this weekend, with what you already own.",
    },
  ],
  howWeWriteTitle: "How we write",
  howWeWriteParagraph1:
    "Every piece of content on this platform goes through the same editorial filter: Would an experienced interior designer recommend this? Is the advice specific enough to act on? Does it feel warm and personal rather than corporate and generic?",
  howWeWriteParagraph2:
    "We write the way a knowledgeable friend would talk to you — clearly, honestly, and with a genuine love for the craft of making a home beautiful.",
  teamSectionTitle: "The team",
  teamSectionIntro:
    "A small, focused team of editors, stylists, and interior-obsessives who care deeply about the advice we give.",
  team: [
    {
      name: "Ahmar",
      role: "Founder & Lead Editor",
      bio: "Former interior stylist turned digital editor. Obsessed with considered spaces, quiet luxury, and the art of doing more with less. Based between Lahore and London.",
      href: "",
      initial: "A",
      colorClass: "bg-amber-100 text-amber-700",
    },
  ],
  newsletterCtaTitle: "Stay in the editorial loop",
  newsletterCtaBody:
    "Get our weekly edit of the best new ideas, seasonal room refreshes, and curated inspiration straight to your inbox. No noise, no spam — just great content.",
  newsletterCtaButtonLabel: "Join 12,000+ readers",
};

export const DEFAULT_INSPIRATION_GALLERY_MARKETING: InspirationGalleryMarketingPayload = {
  metaTitle: "Inspiration Gallery — Real Home Decor Photos & Interior Ideas",
  metaDescription:
    "Browse our curated gallery of real interior design photos spanning living rooms, kitchens, bedrooms, bathrooms, wall decor, and entryways. Filter by room to find your perfect style.",
  ogTitle: "Inspiration Gallery — Real Home Decor Photos",
  ogDescription:
    "Explore hundreds of real interior design photos. Filter by living, kitchen, bedroom, bathroom, wall decor, and entryway for instant style inspiration.",
  breadcrumbCurrentLabel: "Inspiration Gallery",
  heroEyebrow: "Visual inspiration",
  h1: "Inspiration Gallery",
  heroDescriptionTemplate:
    "Real rooms from our published guides plus curated photography. Browse {count}+ interior photos — filter by room. Images from articles link back to the full story.",
  howToTitle: "How to use this gallery",
  howToBody:
    "Do not save only the prettiest photo. Save the reason it works: the repeated wood tone, the way a lamp lowers the light, the scale of art over furniture, or the quiet color that ties the room together. Those are the details you can recreate without copying a room exactly.",
  roomBlurbs: [
    {
      title: "Living rooms",
      body: "Look for sofa scale, lamp height, rug reach, and whether the coffee table has both function and breathing room.",
    },
    {
      title: "Kitchens",
      body: "Notice how boards, ceramics, glassware, and lighting create warmth without stealing working counter space.",
    },
    {
      title: "Walls & entryways",
      body: "Study sightlines: a mirror, console, bench, or framed piece should greet you before the smaller styling details.",
    },
  ],
  bottomCtaTitle: "Want more curated inspiration every week?",
  bottomCtaBody: "Join 12,000+ readers who get our seasonal decor edits straight to their inbox.",
  bottomCtaButtonLabel: "Subscribe free",
};

export const DEFAULT_LATEST_MARKETING: LatestMarketingPayload = {
  metaTitle: "Latest editorials — new room guides & decor ideas",
  metaDescription:
    "Freshly published long-form decor stories: bedrooms, kitchens, baths, kids spaces, and wall moments.",
  h1: "Latest stories",
  intro:
    "Newest publishes first — save this view if you want the magazine cadence without algorithmic reordering. Every story is built as a real styling guide with color palettes, room-specific advice, FAQs, and practical next steps you can apply at home.",
  bulletColumns: [
    {
      title: "Fresh room formulas",
      body: "Newly edited guides for bedrooms, bathrooms, kitchens, walls, and family spaces.",
    },
    {
      title: "Pinterest SEO angles",
      body: "Trend-aware headlines and natural search language designed for saves and discovery.",
    },
    {
      title: "Real-home advice",
      body: "Furniture scale, lighting notes, budget priorities, and maintenance tips, not empty mood captions.",
    },
  ],
};

const privacySections: LegalPageMarketingPayload["sections"] = [
  {
    title: "1. Who we are",
    body: `Core Fusion Infinity ("we", "us", or "our") is an editorial home decor platform. We are committed to protecting your personal information and being transparent about how we use it. This Privacy Policy explains what data we collect, why we collect it, and how we handle it.`,
  },
  {
    title: "2. Information we collect",
    body: `We collect information you provide directly to us — for example, your email address when you subscribe to our newsletter or submit a contact form. We also collect certain information automatically when you visit the Platform, including your IP address, browser type, device information, pages visited, and time spent on those pages. This technical information is collected via analytics tools to help us understand how our content is used and to improve the Platform.`,
  },
  {
    title: "3. How we use your information",
    body: `We use your information to: deliver and personalise content; send our weekly newsletter if you have subscribed (you may unsubscribe at any time); respond to your enquiries; analyse Platform performance and user behaviour to improve our editorial output; comply with legal obligations. We do not sell your personal data to third parties, and we will never share your email address with advertisers without your explicit consent.`,
  },
  {
    title: "4. Cookies",
    body: `We use cookies and similar tracking technologies to enhance your experience on the Platform. These include strictly necessary cookies required for the Platform to function, analytics cookies that help us understand content performance, and preference cookies that remember your settings. You can manage your cookie preferences at any time via our Cookie Policy page. You may also disable cookies through your browser settings, although this may affect the functionality of the Platform.`,
  },
  {
    title: "5. Third-party services",
    body: `We use trusted third-party services to help us operate the Platform. These may include analytics providers (such as Vercel Analytics), email delivery services, and cloud infrastructure providers. Each of these services processes data in accordance with their own privacy policies. We only engage services that offer appropriate data protection commitments.`,
  },
  {
    title: "6. Data retention",
    body: `We retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy, or as required by law. Newsletter subscriber data is retained until you unsubscribe. Analytics data is retained in aggregate, anonymised form. Contact form submissions are retained for up to 12 months and then securely deleted.`,
  },
  {
    title: "7. Your rights",
    body: `You have the right to: access a copy of the personal data we hold about you; request correction of inaccurate data; request deletion of your data (subject to legal obligations); withdraw consent at any time where processing is based on consent; and lodge a complaint with your national data protection authority. To exercise any of these rights, please contact us via the Contact page. We will respond within 30 days.`,
  },
  {
    title: "8. Data security",
    body: `We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Our Platform is served over HTTPS, and sensitive data is encrypted at rest and in transit. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "9. Children's privacy",
    body: `The Platform is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately and we will take steps to delete it.`,
  },
  {
    title: "10. Changes to this policy",
    body: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your data.`,
  },
];

export const DEFAULT_LEGAL_PRIVACY_MARKETING: LegalPageMarketingPayload = {
  metaTitle: "Privacy Policy — Core Fusion Infinity",
  metaDescription:
    "Understand how Core Fusion Infinity collects, uses, and protects your personal data. We are committed to transparency, minimal data collection, and your privacy.",
  pageH1: "Privacy Policy",
  lastUpdatedLabel: "13 May 2026",
  leadParagraph:
    "Your privacy matters to us. This policy explains clearly and plainly what we collect, why we collect it, and what control you have over your data.",
  sections: privacySections,
  footerLink1Label: "Cookie policy →",
  footerLink1Href: "/cookie-policy",
  footerLink2Label: "Contact us with data requests",
  footerLink2Href: "/contact",
};

const termsSections: LegalPageMarketingPayload["sections"] = [
  {
    title: "1. Acceptance of terms",
    body: `By accessing or using Core Fusion Infinity ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using or accessing this Platform. We reserve the right to update these terms at any time without notice, and continued use of the Platform following any changes constitutes your acceptance of the revised terms.`,
  },
  {
    title: "2. Intellectual property",
    body: `All content published on this Platform — including articles, editorial guides, photographs, graphics, copy, and curated imagery — is the intellectual property of Core Fusion Infinity or its content partners and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Platform without prior written permission. Personal, non-commercial use such as bookmarking, sharing links, or printing for private reference is permitted.`,
  },
  {
    title: "3. User conduct",
    body: `You agree to use this Platform only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, any third party. Prohibited activities include transmitting unlawful, threatening, abusive, defamatory, or invasive content; attempting to gain unauthorised access to any part of the Platform or its related systems; and using automated tools to scrape, crawl, or harvest content without our express written consent.`,
  },
  {
    title: "4. Disclaimer of warranties",
    body: `The content on this Platform is provided for general informational and inspirational purposes only. While we make every effort to ensure accuracy, Core Fusion Infinity makes no warranties, express or implied, as to the completeness, reliability, or fitness for a particular purpose of any content. Interior design decisions involve personal taste, structural considerations, and professional judgement; we strongly recommend consulting qualified professionals before undertaking any significant home renovation or design project.`,
  },
  {
    title: "5. Limitation of liability",
    body: `To the fullest extent permitted by applicable law, Core Fusion Infinity shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising from your use of, or inability to use, the Platform or its content. This includes, without limitation, damages for loss of profits, goodwill, data, or other intangible losses, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: "6. Third-party links",
    body: `This Platform may contain links to third-party websites, products, or services. These links are provided for your convenience only. Core Fusion Infinity has no control over the content or practices of third-party sites and accepts no responsibility or liability for them. Inclusion of any linked website does not imply endorsement by Core Fusion Infinity.`,
  },
  {
    title: "7. Privacy",
    body: `Your use of this Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal data.`,
  },
  {
    title: "8. Governing law",
    body: `These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: "9. Contact",
    body: `If you have any questions about these Terms, please contact us via our Contact page. We aim to respond to all enquiries within 2 business days.`,
  },
];

export const DEFAULT_LEGAL_TERMS_MARKETING: TermsMarketingPayload = {
  metaTitle: "Terms of Service — Core Fusion Infinity",
  metaDescription:
    "Read the Terms of Service for Core Fusion Infinity. By accessing our platform, you agree to these terms governing content use, intellectual property, and liability.",
  pageH1: "Terms of Service",
  lastUpdatedLabel: "13 May 2026",
  leadParagraph:
    "Please read these Terms of Service carefully before using Core Fusion Infinity. These terms apply to all visitors, readers, and registered users of our platform.",
  sections: termsSections,
  termsFooterLead: "Have a question about these terms?",
  termsFooterLinkLabel: "Get in touch",
  termsFooterTrail: "and we'll be happy to help.",
};

const cookieSections: LegalSection[] = [
  {
    title: "What is a cookie?",
    body: `A cookie is a small text file that a website stores on your device when you visit. Cookies help the website remember your preferences and understand how you use it. They are widely used to make websites work more efficiently and to provide information to website owners.`,
  },
  {
    title: "How we use cookies",
    body: `We use cookies for several purposes: to make the Platform work properly, to analyse how content is being read and navigated, and to personalise your experience. Each category of cookie we use is described in the table above, along with whether you can disable it.`,
  },
  {
    title: "Managing your cookie preferences",
    body: `You can control and manage cookies in several ways. Most modern browsers allow you to: view cookies stored on your device and delete them; block third-party cookies; block cookies from specific websites; block all cookies; and delete all cookies when you close your browser. Please note that disabling certain cookies may affect the functionality of the Platform and degrade your experience.`,
  },
  {
    title: "Browser-level controls",
    body: `Each browser handles cookie management differently. You can find guidance on managing cookies for the most popular browsers at the following locations: Chrome (Settings → Privacy and security → Cookies), Firefox (Settings → Privacy & Security), Safari (Preferences → Privacy), and Edge (Settings → Cookies and site permissions).`,
  },
  {
    title: "Changes to this policy",
    body: `We may update this Cookie Policy from time to time as our technology or legal requirements change. When we do, we update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.`,
  },
];

export const DEFAULT_LEGAL_COOKIES_MARKETING: CookiePolicyMarketingPayload = {
  metaTitle: "Cookie Policy — Core Fusion Infinity",
  metaDescription:
    "Learn how Core Fusion Infinity uses cookies and similar tracking technologies to improve your experience and analyse Platform performance.",
  pageH1: "Cookie Policy",
  lastUpdatedLabel: "13 May 2026",
  cookieIntro:
    "We believe in being transparent about how we use cookies. Below you'll find a clear explanation of each type of cookie we use and why.",
  leadParagraph: "",
  sections: cookieSections,
  cookieTypes: [
    {
      type: "Strictly necessary",
      purpose:
        "These cookies are essential for the Platform to function correctly. They enable core features such as page navigation, secure access to the admin area, and session management. The Platform cannot function properly without these cookies.",
      examples: "Session tokens, CSRF protection cookies, authentication cookies.",
      canDisable: false,
    },
    {
      type: "Analytics & performance",
      purpose:
        "These cookies help us understand how visitors interact with the Platform by collecting and reporting information anonymously. They allow us to see which articles are most popular, how readers navigate between pages, and where we can improve the experience.",
      examples: "Vercel Analytics, internal page-view tracking.",
      canDisable: true,
    },
    {
      type: "Preference",
      purpose:
        "Preference cookies allow the Platform to remember choices you have made in the past — for example, whether you prefer a dark or light mode interface — so we can provide you with a more personalised experience on return visits.",
      examples: "Theme preference, language settings.",
      canDisable: true,
    },
    {
      type: "Third-party / advertising",
      purpose:
        "We may display editorial-adjacent advertisements on the Platform. These third-party services may set their own cookies to track whether you have seen specific advertisements and to measure campaign effectiveness. We only work with advertising partners who respect user privacy.",
      examples: "Ad network impression cookies (where applicable).",
      canDisable: true,
    },
  ],
  footerLink1Label: "Privacy policy →",
  footerLink1Href: "/privacy-policy",
  footerLink2Label: "Contact us",
  footerLink2Href: "/contact",
};

export const PAGE_MARKETING_DEFAULTS: Record<SiteMarketingPageKey, Record<string, unknown>> = {
  "global-marketing": DEFAULT_GLOBAL_MARKETING as unknown as Record<string, unknown>,
  "inspiration-feed": DEFAULT_INSPIRATION_FEED_MARKETING as unknown as Record<string, unknown>,
  newsletter: DEFAULT_NEWSLETTER_MARKETING as unknown as Record<string, unknown>,
  about: DEFAULT_ABOUT_MARKETING as unknown as Record<string, unknown>,
  "inspiration-gallery": DEFAULT_INSPIRATION_GALLERY_MARKETING as unknown as Record<string, unknown>,
  latest: DEFAULT_LATEST_MARKETING as unknown as Record<string, unknown>,
  "legal-privacy": DEFAULT_LEGAL_PRIVACY_MARKETING as unknown as Record<string, unknown>,
  "legal-terms": DEFAULT_LEGAL_TERMS_MARKETING as unknown as Record<string, unknown>,
  "legal-cookies": DEFAULT_LEGAL_COOKIES_MARKETING as unknown as Record<string, unknown>,
};
