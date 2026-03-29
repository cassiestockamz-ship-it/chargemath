import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import {
  getAllStateGuides,
  getStateGuide,
  getStateSlugs,
} from "@/data/state-guides";
import { NATIONAL_AVERAGE_RATE } from "@/data/electricity-rates";

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

export function generateStaticParams() {
  return getStateSlugs().map((state) => ({ state }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const guide = getStateGuide(state);
  if (!guide) return {};

  const title = `EV Charging Costs in ${guide.state} (2026)`;
  const description = `How much does it cost to charge an EV in ${guide.state}? At ${guide.rate}¢/kWh, a Tesla Model 3 costs ${fmt.format(guide.monthlyCharging)}/month to charge. See full breakdown, savings vs gas, and calculator links.`;

  return {
    title,
    description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title, description },
  };
}

export default async function StateGuidePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: stateSlug } = await params;
  const guide = getStateGuide(stateSlug);
  if (!guide) notFound();

  const allGuides = getAllStateGuides().sort((a, b) => a.rate - b.rate);
  const ratePosition =
    guide.rateVsNational > 5
      ? "above"
      : guide.rateVsNational < -5
        ? "below"
        : "near";
  const rateLabel =
    ratePosition === "above"
      ? `${Math.abs(guide.rateVsNational).toFixed(0)}% above the national average`
      : ratePosition === "below"
        ? `${Math.abs(guide.rateVsNational).toFixed(0)}% below the national average`
        : "near the national average";

  // Neighboring states by rank for comparison
  const neighbors = allGuides.filter(
    (s) => Math.abs(s.rank - guide.rank) <= 3 && s.code !== guide.code
  ).slice(0, 5);

  const faqs = [
    {
      question: `How much does it cost to charge an EV in ${guide.state}?`,
      answer: `At ${guide.state}'s average residential rate of ${guide.rate}¢/kWh, charging a Tesla Model 3 (60 kWh battery) from empty costs ${fmt.format(guide.costPerFullCharge)}. For a typical driver covering 35 miles/day, monthly charging costs are about ${fmt.format(guide.monthlyCharging)}.`,
    },
    {
      question: `Is it cheaper to drive an EV than a gas car in ${guide.state}?`,
      answer: `Yes. An EV in ${guide.state} costs about $${guide.costPerMile.toFixed(3)}/mile for electricity, compared to $0.125/mile for a 28 MPG gas car at $3.50/gallon. That saves roughly ${fmtShort.format(guide.annualGasSavings)} per year on fuel.`,
    },
    {
      question: `How does ${guide.state}'s electricity rate compare to other states?`,
      answer: `${guide.state} ranks #${guide.rank} out of 51 (50 states + DC) for cheapest residential electricity at ${guide.rate}¢/kWh. The national average is ${NATIONAL_AVERAGE_RATE}¢/kWh, so ${guide.state} is ${rateLabel}.`,
    },
    {
      question: `How much will my electric bill go up if I charge an EV in ${guide.state}?`,
      answer: `Charging a Tesla Model 3 at home in ${guide.state} adds approximately ${fmt.format(guide.monthlyCharging)} to your monthly electricity bill, assuming 35 miles of daily driving. A time-of-use rate plan can reduce this by 30-50%.`,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "State Guides", url: "https://chargemath.com/guides" },
          {
            name: guide.state,
            url: `https://chargemath.com/guides/${guide.slug}`,
          },
        ]}
      />


      {/* Hero */}
      <div className="mb-8 text-center">
        <Link
          href="/guides"
          className="mb-3 inline-block text-sm text-[var(--color-primary)] hover:underline"
        >
          ← All State Guides
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
          EV Charging Costs in {guide.state}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
          At {guide.rate}¢/kWh, {guide.state} is {rateLabel} (
          {NATIONAL_AVERAGE_RATE}¢/kWh). Ranked #{guide.rank} cheapest out of 51.
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Data: EIA residential electricity rates · EPA vehicle efficiency · March
          2026
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Monthly Charging Cost
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-ev-green)]">
            {fmt.format(guide.monthlyCharging)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            Tesla Model 3 · 35 mi/day
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Annual Charging Cost
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-text)]">
            {fmtShort.format(guide.annualCharging)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">/year</div>
        </div>
        <div className="rounded-xl border border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Annual Savings vs Gas
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-ev-green)]">
            {fmtShort.format(guide.annualGasSavings)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            vs 28 MPG @ $3.50/gal
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Electricity Rate
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-text)]">
            {guide.rate}¢
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            per kWh · Rank #{guide.rank}/51
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Cost Per Mile
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-text)]">
            ${guide.costPerMile.toFixed(3)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            vs $0.125 gas
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] p-5">
          <div className="text-sm font-medium text-[var(--color-text-muted)]">
            Full Charge Cost
          </div>
          <div className="mt-1 text-3xl font-bold text-[var(--color-text)]">
            {fmt.format(guide.costPerFullCharge)}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            60 kWh battery · 272 mi range
          </div>
        </div>
      </div>

      {/* Calculator links with state pre-selected */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          Calculate Your Costs in {guide.state}
        </h2>
        <p className="mb-5 text-sm text-[var(--color-text-muted)]">
          These links open our calculators with {guide.state}&apos;s electricity rate
          pre-selected — customize with your actual vehicle and driving habits.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: `/ev-charging-cost?state=${guide.code}`,
              icon: "🔌",
              label: "Charging Cost",
              desc: "Monthly & annual costs",
            },
            {
              href: `/gas-vs-electric?state=${guide.code}`,
              icon: "⚖️",
              label: "Gas vs Electric",
              desc: "Side-by-side comparison",
            },
            {
              href: `/charger-roi?state=${guide.code}`,
              icon: "💰",
              label: "Charger ROI",
              desc: "Home charger payback",
            },
            {
              href: `/bill-impact?state=${guide.code}`,
              icon: "📄",
              label: "Bill Impact",
              desc: "Electric bill increase",
            },
            {
              href: `/tax-credits?state=${guide.code}`,
              icon: "🏛️",
              label: "Tax Credits",
              desc: "Federal & state incentives",
            },
            {
              href: "/range",
              icon: "🗺️",
              label: "Range Calculator",
              desc: "Real-world range estimate",
            },
          ].map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-md"
            >
              <span className="text-2xl">{calc.icon}</span>
              <div>
                <div className="text-sm font-semibold text-[var(--color-text)]">
                  {calc.label}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {calc.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby states comparison */}
      {neighbors.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
            Similar States by Electricity Rate
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
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                    Monthly Cost
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-primary)]/5">
                  <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                    {guide.state} (you)
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-primary)]">
                    {guide.rate}¢
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-primary)]">
                    {fmt.format(guide.monthlyCharging)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-primary)]">
                    #{guide.rank}
                  </td>
                </tr>
                {neighbors.map((s) => (
                  <tr
                    key={s.code}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/guides/${s.slug}`}
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {s.state}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text)]">
                      {s.rate}¢
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text)]">
                      {fmt.format(s.monthlyCharging)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                      #{s.rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editorial content */}
      <div className="mt-10 space-y-4 text-[var(--color-text-muted)]">
        <h2 className="text-lg font-bold text-[var(--color-text)]">
          EV Charging in {guide.state}: What You Need to Know
        </h2>
        <p>
          {guide.state}&apos;s residential electricity rate of {guide.rate}¢/kWh is{" "}
          {rateLabel}. For a typical EV owner driving 35 miles per day, this
          translates to about {fmt.format(guide.monthlyCharging)} per month in
          charging costs — or {fmt.format(guide.annualCharging)} annually. Compared
          to fueling a 28 MPG gas car at $3.50/gallon, you save{" "}
          {fmtShort.format(guide.annualGasSavings)} per year.
        </p>
        <p>
          At ${guide.costPerMile.toFixed(3)} per mile for electricity versus $0.125
          per mile for gas, driving electric in {guide.state} costs{" "}
          {((1 - guide.costPerMile / 0.125) * 100).toFixed(0)}% less per mile. Over
          5 years of typical driving (12,775 miles/year), that adds up to{" "}
          {fmtShort.format(guide.annualGasSavings * 5)} in fuel savings alone —
          before accounting for reduced maintenance costs.
        </p>
        <p>
          A full charge on a Tesla Model 3 (60 kWh battery, 272 miles of range)
          costs {fmt.format(guide.costPerFullCharge)} in {guide.state}. Most daily
          charging sessions only use 20-40% of the battery, so a typical overnight
          charge costs {fmt.format(guide.costPerFullCharge * 0.3)} to{" "}
          {fmt.format(guide.costPerFullCharge * 0.4)}.
        </p>
      </div>

      <FAQSection questions={faqs} />

      {/* Back to hub */}
      <div className="mt-10 text-center">
        <Link
          href="/guides"
          className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          ← View All State Guides
        </Link>
      </div>
    </div>
  );
}
