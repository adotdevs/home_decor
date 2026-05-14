import { readAdminCredentials } from "@/lib/admin-credentials";

/** Owner-only tools require `PLATFORM_OWNER_EMAIL` to match the signed-in admin email. */
export function isPlatformOwnerEmail(email: string | undefined | null): boolean {
  const { ownerEmail } = readAdminCredentials();
  if (!ownerEmail || !email) return false;
  return email.trim().toLowerCase() === ownerEmail;
}