import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Electricity Bill Impact Calculator",
  description:
    "See exactly how much your monthly electricity bill will increase when you add an EV. Enter your current bill, vehicle, and driving habits for a personalized estimate.",
  alternates: {
    canonical: "/bill-impact",
  },
  openGraph: {
    title: "EV Electricity Bill Impact Calculator",
    description:
      "See exactly how much your monthly electricity bill will increase when you add an EV. Enter your current bill, vehicle, and driving habits for a personalized estimate.",
    type: "website",
  },
};

export default function BillImpactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
