import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { authCookie, signAdminToken } from "@/lib/utils/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "").trim();

    const adminEmail = env.ADMIN_EMAIL.trim().toLowerCase();

    if (email !== adminEmail) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (password !== env.ADMIN_PASSWORD.trim()) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const token = signAdminToken({ email: env.ADMIN_EMAIL.trim(), role: "superadmin" });
    const res = NextResponse.json({ ok: true });

    const url = new URL(req.url);
    // Browsers only persist Secure cookies on HTTPS. Never use secure on plain http
    // (localhost, 127.0.0.1, LAN IPs, etc.), including `next start` on port 3001.
    const useSecureCookie = url.protocol === "https:";

    res.cookies.set(authCookie, token, {
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
