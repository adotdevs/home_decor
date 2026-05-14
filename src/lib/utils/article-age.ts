/** True if published in the last `days` calendar days (compared to now). */
export function isPublishedWithinLastDays(publishedAt: string | Date | undefined | null, days: number): boolean {
  if (publishedAt == null) return false;
  const d = publishedAt instanceof Date ? publishedAt : new Date(publishedAt);
  if (Number.isNaN(d.getTime())) return false;
  const ms = days * 24 * 60 * 60 * 1000;
  const age = Date.now() - d.getTime();
  return age >= 0 && age <= ms;
}
