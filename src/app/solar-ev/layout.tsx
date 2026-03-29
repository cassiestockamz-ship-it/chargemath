import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar + EV Calculator | How Solar Panels Offset EV Charging Costs",
  description:
    "Calculate how solar panels can offset your EV charging costs. See solar coverage percentage, payback period, monthly savings, and 25-year total savings for your state.",
  alternates: {
    canonical: "/solar-ev",
  },
  openGraph: {
    title: "Solar + EV Calculator | How Solar Panels Offset EV Charging Costs",
    description:
      "Estimate how much a solar panel system can save on EV charging and home electricity. Personalized results for all 50 states with real electricity rates.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
