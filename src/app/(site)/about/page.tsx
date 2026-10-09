import Link from "next/link";

const calculators = [
  { href: "/ev-charging-cost", name: "EV Charging Cost Calculator", desc: "Estimate your monthly and annual EV charging costs" },
  { href: "/gas-vs-electric", name: "Gas vs Electric Calculator", desc: "Compare total fuel costs between gas and electric vehicles" },
  { href: "/charging-time", name: "Charging Time Calculator", desc: "Find out how long it takes to charge any EV" },
  { href: "/charger-roi", name: "Home Charger ROI Calculator", desc: "Calculate the payback period for a Level 2 home charger" },
  { href: "/range", name: "Range Calculator", desc: "Estimate real-world range under different conditions" },
  { href: "/tax-credits", name: "EV Tax Credit Calculator", desc: "Check federal tax credit eligibility and savings" },
  { href: "/bill-impact", name: "Electric Bill Impact Calculator", desc: "See how EV charging affects your electricity bill" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
        About ChargeMath
      </h1>

      <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-muted)]">
        ChargeMath provides free, accurate EV charging calculators powered by
        real EPA vehicle data and state-specific electricity rates from the EIA.
        Our goal is to help current and prospective EV owners make informed
        decisions about charging costs, vehicle comparisons, and home charger
        investments.
      </p>

      {/* Data Sources */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Our Data Sources
        </h2>
        <ul className="mt-4 space-y-3 text-[var(--color-text-muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-[var(--color-primary)]">&#9889;</span>
            <span>
              <strong className="text-[var(--color-text)]">EPA FuelEconomy.gov</strong>{" "}
              : Official fuel economy and EV efficiency ratings for every
              vehicle sold in the United States.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-[var(--color-primary)]">&#9889;</span>
            <span>
              <strong className="text-[var(--color-text)]">EIA (U.S. Energy Information Administration)</strong>{" "}
              : State-by-state residential electricity rates updated
              regularly from official government data.
            </span>
          </li>
        </ul>
      </section>

      {/* Why Trust Us */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Why Trust Our Calculators
        </h2>
        <ul className="mt-4 space-y-3 text-[var(--color-text-muted)]">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-green-500">&#10003;</span>
            <span>
              <strong className="text-[var(--color-text)]">Real government data</strong>{" "}
              : Every calculation uses official EPA and EIA figures, not
              estimates or averages pulled from thin air.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-green-500">&#10003;</span>
            <span>
              <strong className="text-[var(--color-text)]">Transparent methodology</strong>{" "}
              : We show you the inputs and formulas so you can verify
              results yourself.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-green-500">&#10003;</span>
            <span>
              <strong className="text-[var(--color-text)]">No paywalls</strong>{" "}
              : Every calculator is 100% free, no account required.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-green-500">&#10003;</span>
            <span>
              <strong className="text-[var(--color-text)]">Regularly updated</strong>{" "}
              : Vehicle data and electricity rates are refreshed as new
              government data becomes available.
            </span>
          </li>
        </ul>
      </section>

      {/* Author */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Who We Are
        </h2>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Built by a team of EV enthusiasts and data analysts who wanted to make
          EV ownership math transparent and accessible. We believe the switch to
          electric should be driven by clear numbers, not marketing hype.
        </p>
      </section>

      {/* Calculators */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Our Calculators
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-alt)]"
            >
              <h3 className="font-semibold text-[var(--color-text)]">
                {calc.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {calc.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
