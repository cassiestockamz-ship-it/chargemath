import { makeOgImage } from "@/lib/ogImage";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Panel Load Calculator",
    "NEC 220.83 + 625.42. Free. Permit-ready worksheet.",
    "🔌"
  );
}
