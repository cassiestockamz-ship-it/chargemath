import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Range Converter: WLTP, CLTC, EPA and Real-World Range",
  description:
    "Convert an EV's WLTP or CLTC range to an EPA estimate, then EPA range to real-world range for your car, speed and weather. Pick your EV and conditions for your own number.",
  alternates: {
    canonical: "/range",
  },
  openGraph: {
    title: "EV Range Converter: WLTP, CLTC, EPA and Real-World Range",
    description:
      "Convert WLTP or CLTC range to EPA, then EPA to real-world range for your EV, speed and weather.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
