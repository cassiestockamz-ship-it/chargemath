import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Range Converter: EPA to Real-World Range Calculator",
  description:
    "Convert EPA range to real-world range: about x0.9 at 70 mph in mild weather, about x0.5 at 70 mph in freezing weather with the heat on. Pick your EV and conditions for your own number.",
  alternates: {
    canonical: "/range",
  },
  openGraph: {
    title: "EV Range Converter: EPA to Real-World Range Calculator",
    description:
      "Convert EPA range to real-world range for your EV, speed and weather. See how many miles cold, heat and highway speed cost you.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
