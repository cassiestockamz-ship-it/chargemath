import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed ChargeMath Calculators on Your Site",
  description: "Add free EV charging calculators to your website. Copy one line of code; attribution link included.",
  alternates: { canonical: "/embed" },
  robots: { index: true, follow: true },
};

export default function EmbedShowcaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
