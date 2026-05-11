import { jwtVerify } from "jose";

/** HS256 verification compatible with tokens from `jsonwebtoken` (Node API routes). Works in Edge middleware. */
export async function verifyHs256Jwt(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}
