import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winter Range Calculator - Cold Weather EV Range Estimator",
  description:
    "Estimate how cold weather affects your EV's range. See how temperature, cabin heating, preconditioning, and driving style impact winter range for any electric vehicle.",
  alternates: {
    canonical: "/winter-range",
  },
  openGraph: {
    title: "Winter Range Calculator - Cold Weather EV Range Estimator",
    description:
      "Estimate how cold weather reduces your EV's range. Calculate winter miles lost from temperature, heating, and driving conditions for any electric vehicle.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
