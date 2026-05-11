"use client";

import { useState } from "react";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Enter both email and password.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 500
            ? "Server error while signing in. Check server logs."
            : "Invalid credentials (check ADMIN_EMAIL / ADMIN_PASSWORD in .env.local).",
        );
        return;
      }
      if (data?.ok) {
        window.location.assign("/admin");
        return;
      }
      setError("Unexpected response from server.");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <h1 className="font-heading text-4xl text-foreground">Admin Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with your admin email and password.
      </p>
      <form noValidate onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="admin-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-input bg-background px-3 py-3 text-foreground shadow-sm outline-none ring-ring focus-visible:ring-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-input bg-background px-3 py-3 text-foreground shadow-sm outline-none ring-ring focus-visible:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
