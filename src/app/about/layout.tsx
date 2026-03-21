import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ChargeMath",
  description:
    "Learn about ChargeMath, our data sources (EPA, EIA), methodology, and the team behind our free EV charging calculators.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
