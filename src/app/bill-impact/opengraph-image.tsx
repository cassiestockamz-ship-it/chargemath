import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "EV Bill Impact Calculator — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Electricity Bill Impact Calculator",
    "See exactly how much your monthly bill increases when you start charging an EV at home",
    "📄"
  );
}
