import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Gas vs Electric Cost Comparison — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Gas vs Electric Cost Comparison",
    "Side-by-side fuel savings, cost per mile, and CO2 impact analysis",
    "⚖️"
  );
}
