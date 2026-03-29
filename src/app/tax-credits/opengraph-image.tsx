import { makeOgImage, ogSize } from "@/lib/ogImage";

export const runtime = "edge";
export const alt = "EV Tax Credit Estimator — ChargeMath";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "EV Tax Credit Estimator",
    "Check federal and state EV tax credits, rebates, and charger installation incentives",
    "🏛️"
  );
}
