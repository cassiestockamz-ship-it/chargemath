import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Charging Cost Calculator",
  description:
    "Compare public EV charging costs vs home charging. See how much extra you spend at public stations like Tesla Supercharger, Electrify America, ChargePoint, and EVgo.",
  alternates: {
    canonical: "/public-charging",
  },
  openGraph: {
    title: "Public Charging Cost Calculator",
    description:
      "Compare public EV charging costs vs home charging for 22+ vehicles across all 50 states. Includes network pricing for Tesla Supercharger, Electrify America, and more.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
