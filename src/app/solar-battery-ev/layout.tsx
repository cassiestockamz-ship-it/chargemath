import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Battery Size Calculator for EV Charging | Home Battery Sizing",
  description: "Calculate the right home battery size to charge your EV from solar overnight. See required capacity, equivalent products, solar system size, and cost estimates.",
  alternates: { canonical: "/solar-battery-ev" },
  openGraph: {
    title: "Solar Battery Size Calculator for EV Charging | Home Battery Sizing",
    description: "Size a home battery to store solar energy for overnight EV charging. Find the right battery capacity, solar system, and cost for your setup.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
