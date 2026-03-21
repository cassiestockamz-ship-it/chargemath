import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home EV Charger ROI Calculator",
  description:
    "Calculate the payback period for installing a Level 2 home EV charger. Compare costs vs public charging, see monthly savings, break-even timeline, and 5-year net savings.",
  openGraph: {
    title: "Home EV Charger ROI Calculator",
    description:
      "Find out how quickly a home Level 2 EV charger pays for itself. Compare against public charging costs with real electricity rates for all 50 states.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
