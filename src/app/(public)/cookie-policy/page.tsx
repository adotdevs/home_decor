import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — CoreFusion",
  description:
    "Learn how CoreFusion uses cookies and similar tracking technologies to improve your experience and analyse Platform performance.",
  alternates: { canonical: "/cookie-policy" },
};

const LAST_UPDATED = "13 May 2026";

const cookieTypes = [
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
];

const sections = [
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

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Cookie Policy</span>
      </nav>

      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: <time dateTime="2026-05-13">{LAST_UPDATED}</time>
        </p>
      </header>

      <p className="mb-10 leading-relaxed text-muted-foreground">
        We believe in being transparent about how we use cookies. Below you&rsquo;ll find a clear
        explanation of each type of cookie we use and why.
      </p>

      {/* Cookie type table */}
      <div className="mb-12 space-y-4">
        {cookieTypes.map((ct) => (
          <div
            key={ct.type}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="font-semibold text-foreground">{ct.type}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  ct.canDisable
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                }`}
              >
                {ct.canDisable ? "Optional" : "Required"}
              </span>
            </div>
            <div className="px-5 py-4 space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">{ct.purpose}</p>
              <p className="text-xs text-muted-foreground">
                <strong className="font-medium text-foreground">Examples:</strong> {ct.examples}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prose sections */}
      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-lg font-semibold text-foreground">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/privacy-policy"
          className="inline-flex h-9 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Privacy policy →
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
