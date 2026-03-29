import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Commute Cost Calculator",
  description:
    "Calculate your daily commute costs for an EV vs gas car. See monthly and annual savings based on your vehicle, commute distance, and local electricity rates.",
  alternates: {
    canonical: "/commute-cost",
  },
  openGraph: {
    title: "EV Commute Cost Calculator",
    description:
      "Compare daily commute costs between an EV and a gas car. Personalized estimates using EPA data and electricity rates for all 50 states.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
