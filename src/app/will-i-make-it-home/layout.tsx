import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Will I Make It Home? — EV Range Panic Calculator | ChargeMath",
  description:
    "17°F and 23% battery left, 40 miles to go? Find out right now. Real-world EV arrival SOC calculator with temperature, speed, and elevation. Free, no signup.",
  alternates: { canonical: "https://chargemath.com/will-i-make-it-home" },
  openGraph: {
    title: "Will I Make It Home? — EV Panic Calculator",
    description:
      "The calculator that tells you if you'll make it. Real-world arrival SOC with temperature and speed.",
    url: "https://chargemath.com/will-i-make-it-home",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
