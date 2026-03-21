import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Charging Cost Calculator — ChargeMath",
  description:
    "Calculate your monthly and annual EV charging costs. Select your vehicle and state to see personalized estimates using real EPA data and EIA electricity rates.",
  openGraph: {
    title: "EV Charging Cost Calculator — ChargeMath",
    description:
      "Calculate your monthly and annual EV charging costs with real EPA data for 22+ vehicles and electricity rates for all 50 states.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
