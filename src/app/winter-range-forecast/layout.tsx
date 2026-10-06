import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winter Range Forecast by ZIP",
  description:
    "Live EV range forecast for your ZIP code. Uses real National Weather Service temperatures and Recurrent Motors cold-weather data to show you exactly how much range to expect each day this week.",
  alternates: { canonical: "https://chargemath.com/winter-range-forecast" },
  openGraph: {
    title: "Winter Range Forecast: this week by ZIP",
    description:
      "Live EV range forecast for the days ahead at your location. Real temperatures, real data, real percentages.",
    url: "https://chargemath.com/winter-range-forecast",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
