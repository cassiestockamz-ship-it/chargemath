import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "ChargeMath affiliate disclosure. Learn how we earn revenue through affiliate links while keeping our EV calculators free and unbiased.",
  alternates: {
    canonical: "/disclosure",
  },
};

export default function DisclosureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
