/**
 * Read admin login credentials per request so `.env.local` is always respected
 * (avoids stale values from an eager `env` parse).
 */
function clean(v: string | undefined, fallback: string): string {
  return String(v ?? fallback)
    .replace(/^\uFEFF/, "")
    .trim();
}

export function readAdminCredentials() {
  const adminEmailRaw = clean(process.env.ADMIN_EMAIL, "admin@example.com") || "admin@example.com";
  const adminEmail = adminEmailRaw.toLowerCase();

  const adminPassword = clean(process.env.ADMIN_PASSWORD, "changeme");

  const ownerFull = process.env.PLATFORM_OWNER_EMAIL?.replace(/^\uFEFF/, "").trim() ?? "";
  const ownerRaw = ownerFull.length > 0 ? ownerFull : undefined;
  const ownerEmail = ownerRaw?.toLowerCase() ?? "";

  return {
    adminEmail,
    adminEmailDisplay: adminEmailRaw,
    adminPassword,
    ownerRaw,
    ownerEmail,
  };
}
