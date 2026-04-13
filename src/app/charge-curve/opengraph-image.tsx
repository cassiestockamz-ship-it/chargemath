import { makeOgImage } from "@/lib/ogImage";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Charge Curve Simulator",
    "16 EVs, real DCFC data, one-chart session visualization.",
    "📈"
  );
}
