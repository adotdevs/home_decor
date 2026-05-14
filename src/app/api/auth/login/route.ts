import { NextResponse } from "next/server";
import { readAdminCredentials } from "@/lib/admin-credentials";
import { authCookie, signAdminToken } from "@/lib/utils/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "").replace(/\r$/, "").trim();

    const cred = readAdminCredentials();
    const allowed =
      email === cred.adminEmail || (!!cred.ownerEmail && email === cred.ownerEmail);
    if (!allowed) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    if (password !== cred.adminPassword) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const tokenEmail =
      cred.ownerEmail && email === cred.ownerEmail ? cred.ownerRaw! : cred.adminEmailDisplay;
    const token = signAdminToken({ email: tokenEmail, role: "superadmin" });
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
