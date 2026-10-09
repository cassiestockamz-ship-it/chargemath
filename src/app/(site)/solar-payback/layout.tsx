import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Payback Calculator | With vs Without an EV",
  description: "Compare solar payback periods with and without an EV. See how EV ownership shortens your solar ROI with year-by-year savings for your state.",
  alternates: { canonical: "/solar-payback" },
  openGraph: {
    title: "Solar Payback Calculator | With vs Without an EV",
    description: "Calculate how much faster solar pays for itself when you own an EV. Side-by-side comparison with year-by-year cumulative savings.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
