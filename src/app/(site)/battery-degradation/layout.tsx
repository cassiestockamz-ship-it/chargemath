import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Battery Degradation Estimator",
  description:
    "Estimate how much battery capacity your EV has lost over time based on age, mileage, climate, charging habits, and charge levels. See projected range at 5, 8, and 10 years.",
  alternates: {
    canonical: "/battery-degradation",
  },
  openGraph: {
    title: "EV Battery Degradation Estimator",
    description:
      "Estimate your EV battery's remaining capacity and projected range loss over time. Factor in climate, DCFC usage, charge levels, and annual mileage.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
