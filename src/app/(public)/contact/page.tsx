"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const SUBJECTS = [
  { value: "", label: "Select a topic" },
  { value: "editorial", label: "Editorial enquiry" },
  { value: "advertising", label: "Advertising & partnerships" },
  { value: "collaboration", label: "Brand collaboration" },
  { value: "press", label: "Press & media" },
  { value: "other", label: "Other" },
];

const FAQ = [
  {
    q: "How long does it take to get a reply?",
    a: "We aim to respond to all messages within 2 business days. For urgent partnership enquiries, please mention it in your message and we&rsquo;ll prioritise accordingly.",
  },
  {
    q: "Do you accept guest articles or contributor pitches?",
    a: "Yes — we welcome pitches from interior designers, stylists, and passionate home enthusiasts. Please select &ldquo;Editorial enquiry&rdquo; and include a short bio and three article ideas.",
  },
  {
    q: "Can I feature my product or brand on the platform?",
    a: "Absolutely. We work with home décor and lifestyle brands whose values align with our editorial mission. Select &ldquo;Advertising & partnerships&rdquo; to start the conversation.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Request failed");
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <title>Contact Us — CoreFusion</title>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-8">
        {/* Page header */}
        <div className="mb-12 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            Get in touch
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold leading-tight sm:text-5xl">
            We&rsquo;d love to hear from you
          </h1>
          <p className="mt-4 text-muted-foreground">
            Whether you have a story idea, a partnership proposal, or just want to say hello —
            we read every message and reply to each one personally.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: context + FAQ */}
          <aside className="space-y-10">
            <div>
              <h2 className="font-heading text-xl font-semibold">Before you write</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Check if your question is covered in our frequently asked questions below. If not,
                fill in the form and we&rsquo;ll get back to you within 2 business days.
              </p>
            </div>

            {/* FAQ accordion */}
            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border px-5 py-4">
                      <p
                        className="text-sm leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item.a }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 p-6 dark:from-amber-950/30 dark:to-rose-950/30">
              <p className="text-sm font-medium text-foreground">Looking for editorial content?</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse our full article library, seasonal guides, and inspiration galleries.
              </p>
              <Link
                href="/latest"
                className="mt-4 inline-flex h-9 items-center rounded-full bg-neutral-900 px-5 text-xs font-semibold text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
              >
                Browse articles
              </Link>
            </div>
          </aside>

          {/* Right: form */}
          <div>
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-green-200 bg-green-50 px-8 py-16 text-center dark:border-green-900 dark:bg-green-950/30">
                <div className="text-4xl">✓</div>
                <h2 className="mt-4 font-heading text-xl font-semibold text-green-800 dark:text-green-400">
                  Message received!
                </h2>
                <p className="mt-3 text-sm text-green-700 dark:text-green-300">
                  Thank you for reaching out. We&rsquo;ll reply within 2 business days.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm font-medium text-green-700 underline dark:text-green-300"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-3xl border border-border bg-card p-8"
              >
                <h2 className="font-heading text-xl font-semibold">Send a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-foreground">Name</span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                      className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-foreground">Email</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@email.com"
                      className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-foreground">Topic</span>
                  <div className="relative">
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-4 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value} disabled={!s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-foreground">Message</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Tell us what's on your mind…"
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>

                {status === "error" && (
                  <p className="text-sm text-red-500">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white shadow transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                >
                  {status === "loading" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
