import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All EV Calculators",
  description:
    "22 free EV calculators: charging costs, range estimates, battery health, total cost of ownership, lease vs buy, road trip planning, and more. Powered by real EPA data.",
  alternates: { canonical: "/calculators" },
};

const categories = [
  {
    id: "cost",
    label: "Cost & Savings",
    icon: "💰",
    description: "Compare ownership costs, find savings, and figure out when an EV pays for itself.",
    calculators: [
      { title: "Charging Cost", description: "Monthly & annual charging estimates", href: "/ev-charging-cost", icon: "🔌" },
      { title: "Gas vs Electric", description: "Side-by-side cost & CO2 comparison", href: "/gas-vs-electric", icon: "⚖️" },
      { title: "EV vs Hybrid", description: "Three-way EV, hybrid & gas comparison", href: "/ev-vs-hybrid", icon: "🔄" },
      { title: "Total Cost of Ownership", description: "Full cost: fuel, insurance, maintenance", href: "/total-cost", icon: "📋" },
      { title: "Lease vs Buy", description: "Compare leasing vs buying an EV", href: "/lease-vs-buy", icon: "🔑" },
      { title: "Payback Period", description: "When does your EV pay for itself?", href: "/payback-period", icon: "📊" },
      { title: "Commute Cost", description: "Daily commute savings with an EV", href: "/commute-cost", icon: "🏢" },
      { title: "Used EV Value", description: "Estimate used EV value & battery health", href: "/used-ev-value", icon: "🏷️" },
      { title: "Tax Credits", description: "Federal & state EV incentives", href: "/tax-credits", icon: "🏛️" },
    ],
  },
  {
    id: "charging",
    label: "Charging",
    icon: "🔌",
    description: "Estimate charging time, costs, and find the cheapest way to charge.",
    calculators: [
      { title: "Charging Time", description: "How long to charge at any level", href: "/charging-time", icon: "⏱️" },
      { title: "Charger ROI", description: "Home charger payback calculator", href: "/charger-roi", icon: "🏠" },
      { title: "Bill Impact", description: "How much your electric bill goes up", href: "/bill-impact", icon: "📄" },
      { title: "Public Charging", description: "Public vs home charging costs", href: "/public-charging", icon: "⚡" },
      { title: "TOU Optimizer", description: "Find the cheapest time to charge", href: "/tou-optimizer", icon: "🕐" },
    ],
  },
  {
    id: "range",
    label: "Range & Trips",
    icon: "🗺️",
    description: "Plan trips and estimate real-world range in any conditions.",
    calculators: [
      { title: "Range Calculator", description: "Real-world range by conditions", href: "/range", icon: "🗺️" },
      { title: "Winter Range", description: "Cold weather range impact", href: "/winter-range", icon: "❄️" },
      { title: "Towing Range", description: "Range while towing a trailer", href: "/towing-range", icon: "🚛" },
      { title: "Road Trip Planner", description: "EV road trip cost & charging stops", href: "/road-trip", icon: "🛣️" },
    ],
  },
  {
    id: "battery",
    label: "Battery & Energy",
    icon: "🔋",
    description: "Track battery health, environmental impact, and energy sources.",
    calculators: [
      { title: "Battery Degradation", description: "Estimate battery capacity over time", href: "/battery-degradation", icon: "🔋" },
      { title: "Carbon Footprint", description: "CO2 savings vs a gas car", href: "/carbon-footprint", icon: "🌱" },
      { title: "Solar + EV", description: "Solar panel offset for EV charging", href: "/solar-ev", icon: "☀️" },
      { title: "Fleet Calculator", description: "Fleet electrification ROI", href: "/fleet", icon: "🚐" },
    ],
  },
];

export default function CalculatorsPage() {
  const totalCalcs = categories.reduce((sum, c) => sum + c.calculators.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-[var(--color-text)] sm:text-4xl">
        All EV Calculators
      </h1>
      <p className="mt-3 text-lg text-[var(--color-text-muted)]">
        {totalCalcs} free calculators powered by real EPA data and state electricity rates.
      </p>

      {categories.map((cat) => (
        <section key={cat.id} id={cat.id} className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{cat.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cat.calculators.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
              >
                <span className="mb-2 block text-2xl">{calc.icon}</span>
                <h3 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                  {calc.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {calc.description}
                </p>
                <span className="mt-3 inline-block text-xs font-medium text-[var(--color-primary)]">
                  Try it &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Quick nav */}
      <div className="mt-16 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Quick Jump</h2>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {cat.icon} {cat.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
