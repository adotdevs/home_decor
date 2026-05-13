import { toSlug } from "@/lib/utils/content";

export function tagToPathSlug(tagLabel: string) {
  return toSlug(tagLabel);
}
