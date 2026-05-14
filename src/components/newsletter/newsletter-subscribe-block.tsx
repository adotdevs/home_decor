"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function NewsletterSubscribeBlock() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {status === "success" ? (
        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-5">
          <Check className="mx-auto h-8 w-8 text-green-400" />
          <p className="mt-3 font-semibold text-green-300">You&rsquo;re in!</p>
          <p className="mt-1 text-sm text-green-400/80">Check your inbox for a welcome message.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 rounded-full bg-amber-500 px-7 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400 disabled:opacity-60"
          >
            {status === "loading" ? "Joining…" : "Subscribe free"}
          </button>
        </form>
      )}

      {status === "error" ? (
        <p className="mt-4 text-sm text-red-400">Something went wrong — please try again.</p>
      ) : null}
    </>
  );
}
