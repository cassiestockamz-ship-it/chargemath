import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Carbon Footprint Savings Calculator",
  description:
    "Calculate how much CO2 you save by driving an EV instead of a gas car. See annual emissions reduction, equivalent trees planted, and gallons saved based on your state's grid mix.",
  alternates: {
    canonical: "/carbon-footprint",
  },
  openGraph: {
    title: "EV Carbon Footprint Savings Calculator",
    description:
      "Estimate your CO2 savings from driving electric. Compare gas car emissions vs EV emissions using real vehicle data and state-level grid carbon intensity.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
