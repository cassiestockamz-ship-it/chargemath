import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Solar Panel Sizing for EV Charging Calculator — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Solar Panel Sizing for EV",
    "Calculate how many solar panels you need to charge your electric vehicle",
    "🔢"
  );
}
