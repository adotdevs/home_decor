import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDb } from "@/lib/db";
import { ContactSubmission } from "@/models/ContactSubmission";
import { authCookie, verifyAdminToken } from "@/lib/utils/auth";

const ALLOWED_SUBJECTS = new Set(["editorial", "advertising", "collaboration", "press", "other"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin() {
  const token = (await cookies()).get(authCookie)?.value;
  return Boolean(token && verifyAdminToken(token));
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDb();
  const rows = await ContactSubmission.find().sort({ createdAt: -1 }).limit(300).lean();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  const subject = typeof o.subject === "string" ? o.subject.trim() : "";
  const message = typeof o.message === "string" ? o.message.trim() : "";

  if (!name || name.length > 200) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!ALLOWED_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
  }
  if (!message || message.length > 10000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  try {
    await connectDb();
    await ContactSubmission.create({ name, email, subject, message });
  } catch {
    return NextResponse.json({ error: "Could not save message" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
