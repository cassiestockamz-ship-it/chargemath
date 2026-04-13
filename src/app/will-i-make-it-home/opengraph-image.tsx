import { makeOgImage } from "@/lib/ogImage";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Will I Make It Home?",
    "EV panic calculator. Real-world arrival SOC in 10 seconds.",
    "🚨"
  );
}
