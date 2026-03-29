import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lease vs Buy EV Calculator",
  description:
    "Compare the total cost of leasing versus buying an electric vehicle. See monthly payments, equity buildup, excess mileage fees, and find out which option saves you more money.",
  alternates: {
    canonical: "/lease-vs-buy",
  },
  openGraph: {
    title: "Lease vs Buy EV Calculator",
    description:
      "Should you lease or buy your next EV? Compare total costs, monthly payments, equity, and mileage penalties side by side to find the smarter financial choice.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
