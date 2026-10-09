import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Used EV Value Estimator",
  description:
    "Estimate the value of a used electric vehicle based on battery health, mileage, age, and condition. See how depreciation and battery degradation affect resale price.",
  alternates: {
    canonical: "/used-ev-value",
  },
  openGraph: {
    title: "Used EV Value Estimator",
    description:
      "Estimate the value of a used electric vehicle based on battery health, mileage, age, and condition. Calculate depreciation and remaining range value.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
