import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Charging Time Calculator — ChargeMath",
  description:
    "Calculate how long it takes to charge your EV at Level 1, Level 2, and DC Fast charging speeds. Compare charge times for 22+ vehicles with real EPA data.",
  openGraph: {
    title: "EV Charging Time Calculator — ChargeMath",
    description:
      "Calculate how long it takes to charge your EV at Level 1, Level 2, and DC Fast charging speeds. Compare all three charging levels side by side.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
