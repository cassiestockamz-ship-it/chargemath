import { makeOgImage } from "@/lib/ogImage";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return makeOgImage(
    "Winter Range Forecast",
    "Live 7-day EV range forecast by ZIP. Real temperatures. Real %.",
    "❄️"
  );
}
