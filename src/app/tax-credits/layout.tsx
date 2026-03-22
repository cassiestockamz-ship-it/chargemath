import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Tax Credit Estimator",
  description:
    "Estimate your EV tax credits, rebates, and incentives. Check federal and state credits for new and used electric vehicles, plus charger installation credits.",
  alternates: {
    canonical: "/tax-credits",
  },
  openGraph: {
    title: "EV Tax Credit Estimator",
    description:
      "Calculate your federal and state EV tax credits. Check eligibility for new/used vehicle credits, state rebates, and charger installation credits.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
