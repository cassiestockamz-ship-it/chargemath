import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { getAllStateGuides } from "@/data/state-guides";
import { US_GAS_PRICE } from "@/data/fuel-prices";
import { ELECTRICITY_RATES, RATES_AS_OF, RATES_YEAR } from "@/data/electricity-rates";

const RATES_SORTED = Object.values(ELECTRICITY_RATES).sort((a, b) => a.residential - b.residential);
const LOW = RATES_SORTED[0];
const HIGH = RATES_SORTED[RATES_SORTED.length - 1];
// Tesla Model 3, 35 miles a day, 25 kWh per 100 miles (methodology worked example)
const MODEL3_KWH_MONTH = ((35 * 365) / 100) * 25 / 12;

export const metadata: Metadata = {
  title: `EV Charging Cost by State: Complete ${RATES_YEAR} Guide`,
  description:
    "Compare EV charging costs across all 50 states. See monthly costs, electricity rates, gas savings, and cost per mile for every state with real EIA and EPA data.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: `EV Charging Cost by State: ${RATES_YEAR} Guide`,
    description:
      "Compare EV charging costs across all 50 states with real EIA electricity rates and EPA vehicle data.",
  },
};

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtShort = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function GuidesHubPage() {
  const states = getAllStateGuides().sort((a, b) =>
    a.state.localeCompare(b.state)
  );

  const cheapest = [...states].sort((a, b) => a.rate - b.rate).slice(0, 5);
  const mostExpensive = [...states]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "EV Charging by State",
            url: "https://chargemath.com/guides",
          },
        ]}
      />

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
          EV Charging Cost by State
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
          Electricity rates vary by more than 3x across the U.S., from {LOW.residential}¢/kWh
          in {LOW.state} to {HIGH.residential}¢/kWh in {HIGH.state}. See exactly what EV charging costs in
          your state.
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Electricity rates: {RATES_AS_OF}
        </p>
      </div>

      {/* Top 5 cheapest / most expensive */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-6">
          <h2 className="mb-4 text-base font-bold text-[var(--color-ev-green)]">
            5 Cheapest States to Charge an EV
          </h2>
          <ol className="space-y-2">
            {cheapest.map((s, i) => (
              <li key={s.code} className="flex items-center justify-between">
                <Link
                  href={`/guides/${s.slug}`}
                  className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
                >
                  {i + 1}. {s.state}
                </Link>
                <span className="text-sm font-semibold text-[var(--color-ev-green)]">
                  {s.rate}¢/kWh · {fmt.format(s.monthlyCharging)}/mo
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border border-[var(--color-gas-red)]/30 bg-[var(--color-gas-red)]/5 p-6">
          <h2 className="mb-4 text-base font-bold text-[var(--color-gas-red)]">
            5 Most Expensive States to Charge an EV
          </h2>
          <ol className="space-y-2">
            {mostExpensive.map((s, i) => (
              <li key={s.code} className="flex items-center justify-between">
                <Link
                  href={`/guides/${s.slug}`}
                  className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
                >
                  {i + 1}. {s.state}
                </Link>
                <span className="text-sm font-semibold text-[var(--color-gas-red)]">
                  {s.rate}¢/kWh · {fmt.format(s.monthlyCharging)}/mo
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Full state table */}
      <h2 className="mb-5 text-xl font-bold text-[var(--color-text)]">
        All 50 States + DC
      </h2>
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                State
              </th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                Rate
              </th>
              <th className="hidden px-4 py-3 text-right font-semibold text-[var(--color-text)] sm:table-cell">
                Monthly Cost
              </th>
              <th className="hidden px-4 py-3 text-right font-semibold text-[var(--color-text)] md:table-cell">
                Annual Savings vs Gas
              </th>
              <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr
                key={s.code}
                className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-alt)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/guides/${s.slug}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {s.state}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  {s.rate}¢/kWh
                </td>
                <td className="hidden px-4 py-3 text-right text-[var(--color-text)] sm:table-cell">
                  {fmt.format(s.monthlyCharging)}
                </td>
                <td className="hidden px-4 py-3 text-right font-semibold text-[var(--color-ev-green)] md:table-cell">
                  {fmtShort.format(s.annualGasSavings)}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                  #{s.rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editorial content */}
      <div className="mt-12 space-y-6 text-[var(--color-text-muted)]">
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Understanding EV Charging Costs Across the U.S.
        </h2>
        <p>
          The cost of charging an electric vehicle depends almost entirely on your
          local electricity rate. A Tesla Model 3 owner in {LOW.state} ({LOW.residential}¢/kWh)
          pays about {`$${Math.round((MODEL3_KWH_MONTH * LOW.residential) / 100)}`}/month to charge, while the same driver in {HIGH.state}{" "}
          ({HIGH.residential}¢/kWh) pays about {`$${Math.round((MODEL3_KWH_MONTH * HIGH.residential) / 100)}`}/month. That {(HIGH.residential / LOW.residential).toFixed(1)}x difference makes state
          electricity rates the single most important factor in EV ownership costs.
        </p>
        <p>
          Despite this variation, EV charging is cheaper than gasoline in every
          single U.S. state. Even in {HIGH.state}, the most expensive state for
          electricity, an EV costs roughly {`$${((0.25 * HIGH.residential) / 100).toFixed(2)}`}/mile compared to {`$${(US_GAS_PRICE / 28).toFixed(2)}`}/mile
          for a 28 MPG gas car at the US average of{" "}
          {`$${US_GAS_PRICE.toFixed(2)}`}/gallon. In the cheapest state,{" "}
          {LOW.state}, EV fuel costs drop to about {`$${((0.25 * LOW.residential) / 100).toFixed(2)}`}/mile.
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          Why Rates Vary So Much
        </h3>
        <p>
          Electricity rates reflect the generation mix (coal, natural gas, hydro,
          nuclear, renewables), transmission infrastructure, regulatory
          environment, and demand patterns in each state. States with abundant
          hydroelectric power (Washington, Idaho, Oregon) tend to have the
          cheapest rates. States with aging infrastructure, island grids (Hawaii),
          or high demand tend to have the highest.
        </p>
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          How to Lower Your Charging Costs
        </h3>
        <p>
          Regardless of your state, switching to a time-of-use (TOU) electricity
          plan can reduce charging costs. Most utilities offer overnight
          rates below the standard residential rate; the{" "}
          <Link href="/tou-optimizer">TOU Optimizer</Link> works out what yours saves. A smart Level 2
          charger can automatically schedule charging during these off-peak windows.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate your exact charging cost →
          </Link>
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Compare gas vs electric →
          </Link>
          <Link
            href="/bill-impact"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            See your bill impact →
          </Link>
        </div>
      </div>
    </div>
  );
}
