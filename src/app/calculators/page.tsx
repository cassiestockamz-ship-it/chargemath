import Link from "next/link";
import CalculatorSearch from "@/components/CalculatorSearch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All EV Calculators",
  description:
    "26 free EV calculators: charging costs, range estimates, solar sizing, battery storage, total cost of ownership, and more. Powered by real EPA data.",
  alternates: { canonical: "/calculators" },
};

const categories = [
  {
    id: "cost",
    label: "Cost & Savings",
    icon: "💰",
    description: "Compare ownership costs, find savings, and figure out when an EV pays for itself.",
    calculators: [
      { title: "Charging Cost", description: "Monthly & annual charging estimates", href: "/ev-charging-cost" },
      { title: "Gas vs Electric", description: "Side-by-side cost & CO2 comparison", href: "/gas-vs-electric" },
      { title: "EV vs Hybrid", description: "Three-way EV, hybrid & gas comparison", href: "/ev-vs-hybrid" },
      { title: "Total Cost of Ownership", description: "Full cost: fuel, insurance, maintenance", href: "/total-cost" },
      { title: "Lease vs Buy", description: "Compare leasing vs buying an EV", href: "/lease-vs-buy" },
      { title: "Payback Period", description: "When does your EV pay for itself?", href: "/payback-period" },
      { title: "Commute Cost", description: "Daily commute savings with an EV", href: "/commute-cost" },
      { title: "Used EV Value", description: "Estimate used EV value & battery health", href: "/used-ev-value" },
      { title: "Tax Credits", description: "Federal & state EV incentives", href: "/tax-credits" },
    ],
  },
  {
    id: "charging",
    label: "Charging",
    icon: "🔌",
    description: "Estimate charging time, costs, and find the cheapest way to charge.",
    calculators: [
      { title: "Charging Time", description: "How long to charge at any level", href: "/charging-time" },
      { title: "Charger ROI", description: "Home charger payback calculator", href: "/charger-roi" },
      { title: "Bill Impact", description: "How much your electric bill goes up", href: "/bill-impact" },
      { title: "Public Charging", description: "Public vs home charging costs", href: "/public-charging" },
      { title: "TOU Optimizer", description: "Find the cheapest time to charge", href: "/tou-optimizer" },
    ],
  },
  {
    id: "range",
    label: "Range & Trips",
    icon: "🗺️",
    description: "Plan trips and estimate real-world range in any conditions.",
    calculators: [
      { title: "Range Calculator", description: "Real-world range by conditions", href: "/range" },
      { title: "Winter Range", description: "Cold weather range impact", href: "/winter-range" },
      { title: "Towing Range", description: "Range while towing a trailer", href: "/towing-range" },
      { title: "Road Trip Planner", description: "EV road trip cost & charging stops", href: "/road-trip" },
    ],
  },
  {
    id: "solar",
    label: "Solar & Energy",
    icon: "☀️",
    description: "Solar panel sizing, payback analysis, battery storage, and environmental impact.",
    calculators: [
      { title: "Solar + EV", description: "Solar panel offset for EV charging", href: "/solar-ev" },
      { title: "Solar Panel Sizing", description: "How many panels to charge your EV", href: "/solar-ev-sizing" },
      { title: "Solar Payback", description: "Payback period with vs without an EV", href: "/solar-payback" },
      { title: "Solar + Battery", description: "Size a battery for overnight EV charging", href: "/solar-battery-ev" },
      { title: "Solar vs Grid Cost", description: "Long-term solar vs grid EV cost comparison", href: "/solar-vs-grid-ev" },
      { title: "Battery Degradation", description: "Estimate battery capacity over time", href: "/battery-degradation" },
      { title: "Carbon Footprint", description: "CO2 savings vs a gas car", href: "/carbon-footprint" },
      { title: "Fleet Calculator", description: "Fleet electrification ROI", href: "/fleet" },
    ],
  },
];

export default function CalculatorsPage() {
  const totalCalcs = categories.reduce((sum, c) => sum + c.calculators.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
        All EV Calculators
      </h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        {totalCalcs} free calculators powered by real EPA data and state electricity rates.
      </p>

      <div className="mt-6 mb-10">
        <CalculatorSearch />
      </div>

      {categories.map((cat) => (
        <section key={cat.id} id={cat.id} className="mb-10">
          <div className="mb-4 flex h-8 items-end border-b-2 border-[var(--color-primary)]/20 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
              <span className="mr-1.5">{cat.icon}</span>{cat.label}
            </h2>
          </div>
          <p className="mb-3 text-xs text-[var(--color-text-muted)]">{cat.description}</p>
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {cat.calculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group rounded-lg py-2 transition-colors"
              >
                <div className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                  {calc.title}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {calc.description}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
