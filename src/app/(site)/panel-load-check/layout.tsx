import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Panel Load Calculator (NEC 220.83 + 625.42)",
  description:
    "Check if your home electrical panel can handle an EV charger. Uses NEC 220.83 existing-dwelling load calculation plus 625.42 continuous-load multiplier. Free, permit-ready worksheet.",
  alternates: { canonical: "https://chargemath.com/panel-load-check" },
  openGraph: {
    title: "EV Panel Load Calculator: NEC 220.83 + 625.42",
    description:
      "Will your 100A / 150A / 200A panel handle a new EV charger? Free NEC-compliant load calculator with a printable permit worksheet.",
    url: "https://chargemath.com/panel-load-check",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
