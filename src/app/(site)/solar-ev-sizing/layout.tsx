import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Panel Sizing for EV Charging | How Many Panels Do You Need?",
  description:
    "Calculate exactly how many solar panels you need to charge your EV. See panel count, system size, roof area needed, and estimated cost for your state.",
  alternates: {
    canonical: "/solar-ev-sizing",
  },
  openGraph: {
    title: "Solar Panel Sizing for EV Charging | How Many Panels Do You Need?",
    description:
      "Find out how many solar panels are needed to charge your electric vehicle. Personalized results based on your EV, driving habits, and state solar data.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
