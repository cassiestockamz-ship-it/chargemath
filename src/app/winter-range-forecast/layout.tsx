import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winter Range Forecast: 7-Day by ZIP | ChargeMath",
  description:
    "Live 7-day EV range forecast for your ZIP code. Uses real NOAA / Open-Meteo temperatures and Recurrent Motors cold-weather data to show you exactly how much range to expect each day this week.",
  alternates: { canonical: "https://chargemath.com/winter-range-forecast" },
  openGraph: {
    title: "Winter Range Forecast: 7 days ahead by ZIP",
    description:
      "Live EV range forecast for the next 7 days at your location. Real temperatures, real data, real percentages.",
    url: "https://chargemath.com/winter-range-forecast",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
