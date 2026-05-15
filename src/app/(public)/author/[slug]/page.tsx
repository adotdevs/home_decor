import { permanentRedirect } from "next/navigation";

/** Author profile URLs are no longer served; keep route so external links land safely. */
export default function AuthorDeprecatedRedirect() {
  permanentRedirect("/");
}
