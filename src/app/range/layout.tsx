import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Range Calculator — ChargeMath",
  description:
    "Calculate your EV's real-world range based on temperature, speed, terrain, climate control, and cargo. See how each factor reduces your EPA-rated range.",
  openGraph: {
    title: "EV Range Calculator — ChargeMath",
    description:
      "Calculate your EV's real-world range based on temperature, speed, terrain, climate control, and cargo. See exactly how many miles each factor costs you.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
