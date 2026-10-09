import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV vs Gas Total Cost of Ownership Calculator",
  description:
    "Compare the total cost of owning an EV vs a gas car over 1-10 years. Includes purchase price, fuel, insurance, and maintenance to find your breakeven point.",
  alternates: {
    canonical: "/total-cost",
  },
  openGraph: {
    title: "EV vs Gas Total Cost of Ownership Calculator",
    description:
      "Compare full ownership costs of an EV vs gas car including purchase price, fuel, insurance, and maintenance. Find your breakeven year.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
