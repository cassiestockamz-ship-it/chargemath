import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Solar Payback Calculator — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Solar Payback: With vs Without EV",
    "See how EV ownership shortens your solar payback period",
    "📊"
  );
}
