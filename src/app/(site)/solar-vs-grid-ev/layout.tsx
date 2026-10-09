import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar vs Grid EV Charging Cost | Long-Term Comparison Calculator",
  description: "Compare the total cost of charging your EV from solar panels vs the grid over 10, 15, or 25 years. See break-even year, cost per mile, and cumulative savings.",
  alternates: { canonical: "/solar-vs-grid-ev" },
  openGraph: {
    title: "Solar vs Grid EV Charging Cost | Long-Term Comparison Calculator",
    description: "Is solar or grid charging cheaper for your EV? Calculate cumulative costs over time with rising utility rates and panel degradation.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
