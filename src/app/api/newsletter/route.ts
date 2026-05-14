import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { NewsletterSubscriber } from "@/models/NewsletterSubscriber";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let email = "";
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  try {
    if (ct.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as { email?: unknown } | null;
      email = String(body?.email ?? "").trim().toLowerCase();
    } else {
      const fd = await req.formData().catch(() => null);
      email = String(fd?.get("email") ?? "").trim().toLowerCase();
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await connectDb();
    await NewsletterSubscriber.findOneAndUpdate(
      { email },
      { $set: { email, source: "website", isActive: true } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter] subscribe failed", e);
    return NextResponse.json({ error: "Could not save your subscription. Try again in a moment." }, { status: 500 });
  }
}
