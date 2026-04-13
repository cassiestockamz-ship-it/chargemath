import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "Solar vs Grid EV Charging Cost Calculator | ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Solar vs Grid: EV Charging Cost",
    "Compare long-term EV charging costs: solar panels vs utility grid",
    "⚡"
  );
}
