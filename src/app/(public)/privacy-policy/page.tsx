import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — CoreFusion",
  description:
    "Understand how CoreFusion collects, uses, and protects your personal data. We are committed to transparency, minimal data collection, and your privacy.",
  alternates: { canonical: "/privacy-policy" },
};

const LAST_UPDATED = "13 May 2026";

const sections = [
  {
    title: "1. Who we are",
    body: `CoreFusion ("we", "us", or "our") is an editorial home decor platform. We are committed to protecting your personal information and being transparent about how we use it. This Privacy Policy explains what data we collect, why we collect it, and how we handle it.`,
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

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: <time dateTime="2026-05-13">{LAST_UPDATED}</time>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="lead text-muted-foreground">
          Your privacy matters to us. This policy explains clearly and plainly what we collect,
          why we collect it, and what control you have over your data.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-heading text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cookie-policy"
          className="inline-flex h-9 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cookie policy →
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Contact us with data requests
        </Link>
      </div>
    </main>
  );
}
