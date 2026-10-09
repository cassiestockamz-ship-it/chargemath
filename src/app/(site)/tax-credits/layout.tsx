import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Tax Credit Estimator",
  description:
    "Federal EV credits 30D, 25E and 30C have ended. See what ended and when, and check state and utility EV incentives and rebates for your state.",
  alternates: {
    canonical: "/tax-credits",
  },
  openGraph: {
    title: "EV Tax Credit Estimator",
    description:
      "Which federal EV credits ended and when, plus state and utility EV rebates that still apply.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
