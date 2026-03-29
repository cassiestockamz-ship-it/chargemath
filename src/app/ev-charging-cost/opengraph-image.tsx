import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "EV Charging Cost Calculator — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Charging Cost Calculator",
    "Calculate monthly and annual charging costs for 22+ EVs with real EPA data and state electricity rates",
    "🔌"
  );
}
