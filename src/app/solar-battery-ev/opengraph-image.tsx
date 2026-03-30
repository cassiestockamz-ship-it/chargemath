import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Solar Battery Size Calculator for EV Charging — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Solar + Battery for EV Charging",
    "Size a home battery to charge your EV from solar overnight",
    "🔋"
  );
}
