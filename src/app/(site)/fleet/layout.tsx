import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Electrification Calculator",
  description:
    "Estimate the total cost of switching your vehicle fleet to EVs. Compare fuel costs, maintenance savings, fleet TCO, breakeven year, and annual CO2 reduction.",
  alternates: {
    canonical: "/fleet",
  },
  openGraph: {
    title: "Fleet Electrification Calculator",
    description:
      "Calculate whether switching your business fleet to electric vehicles saves money. See fuel savings, maintenance costs, TCO comparison, and environmental impact.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
