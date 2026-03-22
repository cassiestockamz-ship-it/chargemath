import Link from "next/link";

const calculators = [
  {
    title: "EV Charging Cost Calculator",
    description:
      "Estimate your monthly and annual EV charging costs based on your vehicle, state, and driving habits.",
    href: "/ev-charging-cost",
    icon: "🔌",
    live: true,
  },
  {
    title: "Gas vs Electric Comparison",
    description:
      "See how much you'd save switching from gas to electric with a side-by-side cost and CO2 comparison.",
    href: "/gas-vs-electric",
    icon: "⚖️",
    live: true,
  },
  {
    title: "Charging Time Estimator",
    description:
      "Find out how long it takes to charge your EV at home or at a public station.",
    href: "/charging-time",
    icon: "⏱️",
    live: true,
  },
  {
    title: "Home Charger ROI Calculator",
    description:
      "Calculate the payback period for installing a Level 2 home charger vs public charging.",
    href: "/charger-roi",
    icon: "💰",
    live: true,
  },
  {
    title: "Range Calculator",
    description:
      "Calculate your real-world EV range based on speed, temperature, and terrain.",
    href: "/range",
    icon: "🗺️",
    live: true,
  },
  {
    title: "EV Tax Credit Estimator",
    description:
      "Check which federal and state EV tax credits and incentives you may qualify for.",
    href: "/tax-credits",
    icon: "🏛️",
    live: true,
  },
  {
    title: "Electricity Bill Impact",
    description:
      "See exactly how much your monthly electricity bill will increase when you start charging an EV.",
    href: "/bill-impact",
    icon: "📄",
    live: true,
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
          Calculate Your{" "}
          <span className="text-[var(--color-primary)]">EV Charging</span> Costs
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--color-text-muted)] sm:text-xl">
          Free, accurate calculators powered by real EPA vehicle data and
          state-specific electricity rates. No sign-up required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/ev-charging-cost" className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[var(--color-primary-dark)]">
            Calculate Charging Cost
          </Link>
          <Link href="/gas-vs-electric" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition-colors hover:bg-[var(--color-surface-alt)]">
            Compare Gas vs Electric
          </Link>
        </div>
        <p className="mx-auto mt-4 text-sm text-[var(--color-text-muted)]">
          Plus: <Link href="/charging-time" className="text-[var(--color-primary)] hover:underline">Charge Time</Link> &middot; <Link href="/charger-roi" className="text-[var(--color-primary)] hover:underline">Charger ROI</Link> &middot; <Link href="/range" className="text-[var(--color-primary)] hover:underline">Range</Link> &middot; <Link href="/tax-credits" className="text-[var(--color-primary)] hover:underline">Tax Credits</Link> &middot; <Link href="/bill-impact" className="text-[var(--color-primary)] hover:underline">Bill Impact</Link>
        </p>
      </section>

      {/* Calculator Cards */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--color-text)]">
          EV Calculators
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((calc) => {
            const cardClass = `group relative rounded-xl border bg-[var(--color-surface)] p-6 transition-all ${
              calc.live
                ? "border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)]/30 hover:shadow-md"
                : "border-dashed border-[var(--color-border)] opacity-70"
            }`;
            const cardContent = (
              <>
                {!calc.live && (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Coming Soon
                  </span>
                )}
                <span className="mb-3 block text-2xl">{calc.icon}</span>
                <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                  {calc.title}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                  {calc.description}
                </p>
                {calc.live && (
                  <span className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)]">
                    Try it &rarr;
                  </span>
                )}
              </>
            );
            return calc.live ? (
              <Link key={calc.title} href={calc.href} className={cardClass}>
                {cardContent}
              </Link>
            ) : (
              <div key={calc.title} className={cardClass}>
                {cardContent}
              </div>
            );
          })}
        </div>
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
    </>
  );
}
