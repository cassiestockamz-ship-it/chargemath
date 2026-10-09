import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gas vs Electric Cost Comparison Calculator",
  description:
    "Compare the true cost of driving electric vs gas. See fuel savings, cost per mile, and CO2 reduction with a side-by-side comparison using real EPA vehicle data.",
  alternates: {
    canonical: "/gas-vs-electric",
  },
  openGraph: {
    title: "Gas vs Electric Cost Comparison",
    description:
      "Side-by-side cost comparison of electric vs gas vehicles. Calculate fuel savings, cost per mile, and environmental impact.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
