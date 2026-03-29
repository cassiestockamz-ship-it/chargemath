import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Payback Period Calculator",
  description:
    "Calculate when an electric vehicle pays for itself compared to a gas car. See monthly fuel savings, maintenance savings, incentive impact, and year-by-year cumulative savings over 10 years.",
  alternates: {
    canonical: "/payback-period",
  },
  openGraph: {
    title: "EV Payback Period Calculator",
    description:
      "Find out how many years until your EV pays for itself vs a comparable gas car. Factor in fuel savings, maintenance, tax credits, and state incentives.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
