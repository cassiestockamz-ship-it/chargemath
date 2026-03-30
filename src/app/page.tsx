import Link from "next/link";
import CalculatorSearch from "@/components/CalculatorSearch";

const featured = [
  { title: "EV Charging Cost Calculator", description: "Estimate your monthly and annual EV charging costs based on your vehicle, state, and driving habits.", href: "/ev-charging-cost", icon: "🔌" },
  { title: "Gas vs Electric Comparison", description: "See how much you'd save switching from gas to electric with a side-by-side cost and CO2 comparison.", href: "/gas-vs-electric", icon: "⚖️" },
  { title: "Total Cost of Ownership", description: "Compare the full cost of owning an EV vs gas car: purchase, fuel, insurance, and maintenance.", href: "/total-cost", icon: "📋" },
  { title: "Range Calculator", description: "Calculate your real-world EV range based on speed, temperature, and terrain conditions.", href: "/range", icon: "🗺️" },
];

const categories = [
  {
    label: "Cost & Savings",
    icon: "💰",
    items: [
      { title: "Charging Cost", href: "/ev-charging-cost" },
      { title: "Gas vs Electric", href: "/gas-vs-electric" },
      { title: "EV vs Hybrid", href: "/ev-vs-hybrid" },
      { title: "Total Cost of Ownership", href: "/total-cost" },
      { title: "Lease vs Buy", href: "/lease-vs-buy" },
      { title: "Payback Period", href: "/payback-period" },
      { title: "Commute Cost", href: "/commute-cost" },
      { title: "Used EV Value", href: "/used-ev-value" },
      { title: "Tax Credits", href: "/tax-credits" },
    ],
  },
  {
    label: "Charging",
    icon: "🔌",
    items: [
      { title: "Charging Time", href: "/charging-time" },
      { title: "Charger ROI", href: "/charger-roi" },
      { title: "Bill Impact", href: "/bill-impact" },
      { title: "Public Charging", href: "/public-charging" },
      { title: "TOU Optimizer", href: "/tou-optimizer" },
    ],
  },
  {
    label: "Range & Trips",
    icon: "🗺️",
    items: [
      { title: "Range Calculator", href: "/range" },
      { title: "Winter Range", href: "/winter-range" },
      { title: "Towing Range", href: "/towing-range" },
      { title: "Road Trip Planner", href: "/road-trip" },
    ],
  },
  {
    label: "Battery & Energy",
    icon: "🔋",
    items: [
      { title: "Battery Degradation", href: "/battery-degradation" },
      { title: "Carbon Footprint", href: "/carbon-footprint" },
      { title: "Solar + EV", href: "/solar-ev" },
      { title: "Fleet Calculator", href: "/fleet" },
    ],
  },
];

const features = [
  { icon: "📊", title: "Real EPA Data", description: "Vehicle efficiency and range data sourced directly from fueleconomy.gov for 20+ popular EVs." },
  { icon: "🗺️", title: "State-Specific Rates", description: "Electricity rates for all 50 states plus DC, sourced from EIA residential averages." },
  { icon: "💵", title: "Save Money", description: "Find out exactly how much you'll save per month and per year by switching from gas to electric." },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ChargeMath",
        "url": "https://chargemath.com",
        "description": "Free EV calculators powered by real EPA vehicle data and state-specific electricity rates.",
        "publisher": { "@type": "Organization", "name": "ChargeMath", "url": "https://chargemath.com/about" }
      })}} />

      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
          22 Free{" "}
          <span className="text-[var(--color-primary)]">EV Calculators</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-text-muted)] sm:text-xl">
          Charging costs, range estimates, total ownership, battery health, and more.
          Powered by real EPA data and state electricity rates.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/ev-charging-cost" className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[var(--color-primary-dark)]">
            Calculate Charging Cost
          </Link>
          <Link href="/calculators" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)]">
            Browse All Calculators
          </Link>
        </div>
      </section>

      {/* Featured Calculators (top 4 as cards) */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold text-[var(--color-text)]">Most Popular</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
            >
              <span className="mb-2 block text-2xl">{calc.icon}</span>
              <h3 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {calc.title}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                {calc.description}
              </p>
              <span className="mt-3 inline-block text-xs font-medium text-[var(--color-primary)]">
                Try it &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <CalculatorSearch />
      </section>

      {/* All Calculators - compact directory */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-xl font-bold text-[var(--color-text)]">All Calculators</h2>
          <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.label}>
                <div className="mb-3 flex h-8 items-end border-b-2 border-[var(--color-primary)]/20 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    <span className="mr-1.5">{cat.icon}</span>{cat.label}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block text-sm text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/calculators" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
              View all with descriptions &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Why ChargeMath */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-[var(--color-text)]">
          Why ChargeMath?
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <span className="mb-3 inline-block text-3xl">{f.icon}</span>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* State Guides CTA */}
      <section className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">EV Charging by State</h2>
        <p className="mt-3 text-[var(--color-text-muted)]">
          See charging costs, savings, and incentives for all 50 states.
        </p>
        <Link href="/guides" className="mt-6 inline-block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)]">
          View State Guides &rarr;
        </Link>
      </section>
    </>
  );
}
