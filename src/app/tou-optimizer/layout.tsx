import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Time-of-Use Optimizer Calculator",
  description:
    "Find the cheapest time to charge your EV on a Time-of-Use electricity plan. Compare peak, off-peak, and super-off-peak rates to maximize savings.",
  alternates: {
    canonical: "/tou-optimizer",
  },
  openGraph: {
    title: "Time-of-Use Optimizer Calculator",
    description:
      "Find the cheapest time to charge your EV on a Time-of-Use electricity plan. Compare peak, off-peak, and super-off-peak rates to maximize savings.",
    type: "website",
  },
};

export default function TOUOptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
