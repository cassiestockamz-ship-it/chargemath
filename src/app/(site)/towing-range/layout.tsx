import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Towing Range Calculator",
  description:
    "Estimate how towing a trailer or heavy load affects your EV's range. Calculate range reduction based on weight, speed, terrain, and wind conditions.",
  alternates: {
    canonical: "/towing-range",
  },
  openGraph: {
    title: "EV Towing Range Calculator",
    description:
      "See exactly how much range you lose when towing with your EV. Factor in trailer weight, speed, terrain, and headwind to plan your trip.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
