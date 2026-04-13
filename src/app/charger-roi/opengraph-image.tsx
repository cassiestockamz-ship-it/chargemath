import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Home EV Charger ROI Calculator | ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Home EV Charger ROI Calculator",
    "Calculate payback period, monthly savings, and 5-year return on a Level 2 home charger",
    "💰"
  );
}
