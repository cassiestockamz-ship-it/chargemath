import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "EV Charging Time Calculator | ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Charging Time Calculator",
    "Compare Level 1, Level 2, and DC Fast charging speeds for your EV",
    "⏱️"
  );
}
