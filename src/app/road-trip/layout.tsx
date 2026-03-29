import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Road Trip Cost Planner",
  description:
    "Plan your EV road trip costs including charging stops, time spent charging, and total cost compared to a gas car. Estimate savings and cost per mile.",
  alternates: {
    canonical: "/road-trip",
  },
  openGraph: {
    title: "EV Road Trip Cost Planner",
    description:
      "Plan your EV road trip costs including charging stops, time spent charging, and total cost compared to a gas car. See how much you save driving electric.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
