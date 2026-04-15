import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Charge Curve Simulator: 16 models, real DCFC data | ChargeMath",
  description:
    "Simulate any popular EV's DC fast-charging curve at any charger. See kW vs SOC, total session time, and energy added. Data from InsideEVs, Out of Spec, and Fastned.",
  alternates: { canonical: "https://chargemath.com/charge-curve" },
  openGraph: {
    title: "EV Charge Curve Simulator",
    description:
      "Real DCFC curves for 16 popular EVs. Pick your car, charger, and SOC target, then see the whole session in one chart.",
    url: "https://chargemath.com/charge-curve",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
