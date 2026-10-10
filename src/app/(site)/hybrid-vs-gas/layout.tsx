import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hybrid vs Gas Calculator: Fuel Savings and Payback",
  description:
    "Calculate how much a hybrid saves on gas versus a regular car, how many years it takes to pay back the hybrid price premium, and the net savings over the years you keep the car. EPA MPG and price premiums for popular hybrid and gas pairs.",
  alternates: {
    canonical: "/hybrid-vs-gas",
  },
  openGraph: {
    title: "Hybrid vs Gas Calculator: Fuel Savings and Payback",
    description:
      "Annual gas savings, payback years on the hybrid premium, and net savings over the years you keep the car.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
