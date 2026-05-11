import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyHs256Jwt } from "@/lib/utils/jwt-verify-edge";

function forwardPathname(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return requestHeaders;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = forwardPathname(req);

  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/login/";

  if (isLoginPage) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  const token = req.cookies.get("admin_token")?.value;
  // jsonwebtoken does not run reliably in Edge — verify with jose instead.
  if (!token || !(await verifyHs256Jwt(token, env.JWT_SECRET))) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = { matcher: ["/admin/:path*"] };
