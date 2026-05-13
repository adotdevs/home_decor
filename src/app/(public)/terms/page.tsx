import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — CoreFusion",
  description:
    "Read the Terms of Service for CoreFusion. By accessing our platform, you agree to these terms governing content use, intellectual property, and liability.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "13 May 2026";

const sections = [
  {
    title: "1. Acceptance of terms",
    body: `By accessing or using CoreFusion ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using or accessing this Platform. We reserve the right to update these terms at any time without notice, and continued use of the Platform following any changes constitutes your acceptance of the revised terms.`,
  },
  {
    title: "2. Intellectual property",
    body: `All content published on this Platform — including articles, editorial guides, photographs, graphics, copy, and curated imagery — is the intellectual property of CoreFusion or its content partners and is protected by applicable copyright and trademark laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Platform without prior written permission. Personal, non-commercial use such as bookmarking, sharing links, or printing for private reference is permitted.`,
  },
  {
    title: "3. User conduct",
    body: `You agree to use this Platform only for lawful purposes and in a manner that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, any third party. Prohibited activities include transmitting unlawful, threatening, abusive, defamatory, or invasive content; attempting to gain unauthorised access to any part of the Platform or its related systems; and using automated tools to scrape, crawl, or harvest content without our express written consent.`,
  },
  {
    title: "4. Disclaimer of warranties",
    body: `The content on this Platform is provided for general informational and inspirational purposes only. While we make every effort to ensure accuracy, CoreFusion makes no warranties, express or implied, as to the completeness, reliability, or fitness for a particular purpose of any content. Interior design decisions involve personal taste, structural considerations, and professional judgement; we strongly recommend consulting qualified professionals before undertaking any significant home renovation or design project.`,
  },
  {
    title: "5. Limitation of liability",
    body: `To the fullest extent permitted by applicable law, CoreFusion shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising from your use of, or inability to use, the Platform or its content. This includes, without limitation, damages for loss of profits, goodwill, data, or other intangible losses, even if we have been advised of the possibility of such damages.`,
  },
  {
    title: "6. Third-party links",
    body: `This Platform may contain links to third-party websites, products, or services. These links are provided for your convenience only. CoreFusion has no control over the content or practices of third-party sites and accepts no responsibility or liability for them. Inclusion of any linked website does not imply endorsement by CoreFusion.`,
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

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Terms of Service</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: <time dateTime="2026-05-13">{LAST_UPDATED}</time>
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="lead text-muted-foreground">
          Please read these Terms of Service carefully before using CoreFusion. These
          terms apply to all visitors, readers, and registered users of our platform.
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

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          Have a question about these terms?{" "}
          <Link href="/contact" className="font-medium text-amber-600 hover:underline">
            Get in touch
          </Link>{" "}
          and we&rsquo;ll be happy to help.
        </p>
      </div>
    </main>
  );
}
