import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hybrid vs Gas Calculator: Fuel Savings and Payback",
  description:
    "Calculate how much a hybrid saves on gas versus a regular car, how many years it takes to pay back the hybrid price premium, and the 10-year net savings. EPA MPG examples for Corolla, RAV4 and Accord.",
  alternates: {
    canonical: "/hybrid-vs-gas",
  },
  openGraph: {
    title: "Hybrid vs Gas Calculator: Fuel Savings and Payback",
    description:
      "Annual gas savings, payback years on the hybrid premium, and 10-year net savings for a hybrid versus a gas car.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
