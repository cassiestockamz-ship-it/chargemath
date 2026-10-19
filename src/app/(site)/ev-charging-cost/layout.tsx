import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Charging Cost Calculator: Cost to Charge an Electric Car",
  description:
    "EV charging cost calculator: pick your EV, state and daily miles to see what charging costs a month, a year, per mile and per full charge, at home or at public fast chargers, using EPA efficiency and EIA state rates.",
  alternates: {
    canonical: "/ev-charging-cost",
  },
  openGraph: {
    title: "EV Charging Cost Calculator: Cost to Charge an Electric Car",
    description:
      "See what charging your EV costs a month, a year and per charge, with EPA efficiency data and every state's electricity rate.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
