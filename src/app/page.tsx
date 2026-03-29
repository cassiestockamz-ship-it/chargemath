import Link from "next/link";

const categories = [
  {
    id: "cost",
    label: "Cost & Savings",
    icon: "💰",
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
    calculators: [
      { title: "Battery Degradation", description: "Estimate battery capacity over time", href: "/battery-degradation", icon: "🔋" },
      { title: "Carbon Footprint", description: "CO2 savings vs a gas car", href: "/carbon-footprint", icon: "🌱" },
      { title: "Solar + EV", description: "Solar panel offset for EV charging", href: "/solar-ev", icon: "☀️" },
      { title: "Fleet Calculator", description: "Fleet electrification ROI", href: "/fleet", icon: "🚐" },
    ],
  },
];

const features = [
  {
    icon: "📊",
    title: "Real EPA Data",
    description:
      "Vehicle efficiency and range data sourced directly from fueleconomy.gov for 20+ popular EVs.",
  },
  {
    icon: "🗺️",
    title: "State-Specific Rates",
    description:
      "Electricity rates for all 50 states plus DC, sourced from EIA residential averages.",
  },
  {
    icon: "💵",
    title: "Save Money",
    description:
      "Find out exactly how much you'll save per month and per year by switching from gas to electric.",
  },
];

const totalCalcs = categories.reduce((s, c) => s + c.calculators.length, 0);

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "ChargeMath",
        "url": "https://chargemath.com",
        "description": "Free EV calculators powered by real EPA vehicle data and state-specific electricity rates.",
        "publisher": {
          "@type": "Organization",
          "name": "ChargeMath",
          "url": "https://chargemath.com/about"
        }
      })}} />
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
          {totalCalcs} Free{" "}
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

      {/* Calculator Cards by Category */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {categories.map((cat) => (
          <div key={cat.id} className="mb-12">
            <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
              <span className="mr-2">{cat.icon}</span>{cat.label}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.calculators.map((calc) => (
                <Link
                  key={calc.href}
                  href={calc.href}
                  className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
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
          </div>
        ))}
      </section>

      {/* Why ChargeMath */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-[var(--color-text)]">
            Why ChargeMath?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <span className="mb-3 inline-block text-3xl">{f.icon}</span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State Guides CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
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
