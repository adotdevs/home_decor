import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

const pepper = () => process.env.REVIEW_OWNER_PEPPER || env.JWT_SECRET;

export function hashOwnerToken(plainToken: string): string {
  return createHash("sha256").update(`${pepper()}:${plainToken}`, "utf8").digest("hex");
}

export function generateOwnerToken(): string {
  return randomBytes(24).toString("hex");
}

export function safeCompareTokenHash(storedHex: string, plainToken: string): boolean {
  const computed = hashOwnerToken(plainToken);
  try {
    const a = Buffer.from(storedHex, "hex");
    const b = Buffer.from(computed, "hex");
    if (a.length !== b.length || a.length === 0) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
