import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const authCookie = "admin_token";
export type AdminToken = { email: string; role: "superadmin"; iat?: number; exp?: number };

export function signAdminToken(payload: AdminToken) { return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" }); }
export function verifyAdminToken(token: string): AdminToken | null { try { return jwt.verify(token, env.JWT_SECRET) as AdminToken; } catch { return null; } }
export async function getCurrentAdmin() { const token = (await cookies()).get(authCookie)?.value; return token ? verifyAdminToken(token) : null; }