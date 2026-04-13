import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Tire Cost Calculator — The Hidden Tire Tax | ChargeMath",
  description:
    "EV tires wear 20% faster than ICE tires and cost more. Calculate your 5-year EV tire spend, the hidden tire tax, and when premium low-rolling-resistance tires actually pay off.",
  alternates: { canonical: "https://chargemath.com/ev-tire-cost" },
  openGraph: {
    title: "EV Tire Cost Calculator — the hidden tire tax",
    description:
      "EV tires wear 20% faster than ICE equivalents. Calculate your 5-year tire spend and whether premium LRR tires are worth it for your mileage.",
    url: "https://chargemath.com/ev-tire-cost",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
