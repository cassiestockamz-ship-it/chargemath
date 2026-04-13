import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "EV Range Calculator | ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Range Calculator",
    "See how temperature, speed, terrain, and cargo affect your real-world EV range",
    "🗺️"
  );
}
