import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV vs Hybrid vs Gas Cost Comparison Calculator",
  description:
    "Compare the true fuel costs of electric, hybrid, and gas vehicles side by side. See monthly savings, cost per mile, and CO2 emissions for all three drivetrains.",
  alternates: {
    canonical: "/ev-vs-hybrid",
  },
  openGraph: {
    title: "EV vs Hybrid vs Gas Cost Comparison",
    description:
      "Three-way cost comparison of EV, hybrid, and gas vehicles. Calculate fuel savings, cost per mile, and environmental impact for each drivetrain.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
