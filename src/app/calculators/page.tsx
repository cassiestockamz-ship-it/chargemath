import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All EV Calculators",
  description:
    "31 free EV calculators: live data tools (will-i-make-it-home, winter range forecast by ZIP, charge curve simulator), NEC 220.83 panel load check, ev tire cost, charging costs, range estimates, solar sizing, and more.",
  alternates: { canonical: "/calculators" },
};

const categories = [
  {
    id: "live",
    label: "Live Data + Unique Tools",
    icon: "⚡",
    description: "Tools nobody else has: live weather, real DCFC curves, permit worksheets, and a panic calculator that tells you if you'll make it home tonight.",
    calculators: [
      { title: "Will I Make It Home?", description: "EV panic calculator with real-world arrival SOC", href: "/will-i-make-it-home" },
      { title: "Winter Range Forecast", description: "Live 7-day range forecast by ZIP", href: "/winter-range-forecast" },
      { title: "Charge Curve Simulator", description: "Real DCFC curves for 16 popular EVs", href: "/charge-curve" },
      { title: "Panel Load Check", description: "Free NEC 220.83 + 625.42 permit worksheet", href: "/panel-load-check" },
      { title: "EV Tire Cost", description: "The hidden tire tax nobody told you about", href: "/ev-tire-cost" },
    ],
  },
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
      <span className="cm-eyebrow">Directory</span>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        All EV calculators
      </h1>
      <p className="mt-2 max-w-prose text-[var(--color-ink-3)]">
        {totalCalcs} free calculators powered by real EPA data and state electricity rates. Tap any tool to open it, or press{" "}
        <kbd className="cm-mono rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--color-ink-2)]">
          ⌘K
        </kbd>{" "}
        to search.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id}>
            <div className="mb-3 flex flex-col gap-0.5 border-l-2 border-[var(--color-brand)] pl-3">
              <span className="cm-eyebrow" style={{ color: "var(--color-brand)" }}>
                {cat.icon} {cat.label}
              </span>
              <p className="mt-1 text-sm text-[var(--color-ink-3)]">{cat.description}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.calculators.map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group flex flex-col gap-0.5 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 transition-colors hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
                >
                  <span className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-brand)]">
                    {calc.title}
                  </span>
                  <span className="text-xs text-[var(--color-ink-3)]">
                    {calc.description}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
