import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import StateCalculatorEmbed from "@/components/StateCalculatorEmbed";
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
  const description = `At ${guide.rate}¢/kWh, a Tesla Model 3 in ${guide.state} costs ${fmt.format(guide.monthlyCharging)}/month to charge. See the live calculator, savings vs gas, and state comparisons.`;

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

  const neighbors = allGuides
    .filter((s) => Math.abs(s.rank - guide.rank) <= 3 && s.code !== guide.code)
    .slice(0, 5);

  const faqs = [
    {
      question: `How much does it cost to charge an EV in ${guide.state}?`,
      answer: `At ${guide.state}'s average residential rate of ${guide.rate}¢/kWh, charging a Tesla Model 3 (60 kWh battery) from empty costs ${fmt.format(guide.costPerFullCharge)}. For a typical driver covering 35 miles per day, monthly charging costs are about ${fmt.format(guide.monthlyCharging)}.`,
    },
    {
      question: `Is it cheaper to drive an EV than a gas car in ${guide.state}?`,
      answer: `Yes. An EV in ${guide.state} costs about $${guide.costPerMile.toFixed(3)} per mile for electricity, compared to $0.125 per mile for a 28 MPG gas car at $3.50 per gallon. That saves roughly ${fmtShort.format(guide.annualGasSavings)} per year on fuel.`,
    },
    {
      question: `How does ${guide.state}'s electricity rate compare to other states?`,
      answer: `${guide.state} ranks number ${guide.rank} out of 51 (50 states plus DC) for cheapest residential electricity at ${guide.rate}¢/kWh. The national average is ${NATIONAL_AVERAGE_RATE}¢/kWh, so ${guide.state} is ${rateLabel}.`,
    },
    {
      question: `How much will my electric bill go up if I charge an EV in ${guide.state}?`,
      answer: `Charging a Tesla Model 3 at home in ${guide.state} adds approximately ${fmt.format(guide.monthlyCharging)} to your monthly electricity bill, assuming 35 miles of daily driving. A time-of-use rate plan can reduce this by 30 to 50 percent.`,
    },
  ];

  // Dataset JSON-LD for the state rate data (EIA source, CC0)
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${guide.state} Residential Electricity Rate`,
    description: `${guide.state} average residential electricity rate of ${guide.rate}¢/kWh, used for EV charging cost calculations. ${rateLabel} vs the ${NATIONAL_AVERAGE_RATE}¢/kWh national average. Ranked ${guide.rank} of 51 for cheapest residential electricity.`,
    keywords: [
      "EV charging cost",
      "electricity rate",
      guide.state,
      "EIA residential",
      "kWh price",
    ],
    url: `https://chargemath.com/guides/${guide.slug}`,
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    creator: {
      "@type": "Organization",
      name: "ChargeMath",
      url: "https://chargemath.com",
    },
    sourceOrganization: {
      "@type": "Organization",
      name: "U.S. Energy Information Administration",
      url: "https://www.eia.gov",
    },
    temporalCoverage: "2025/2026",
    spatialCoverage: {
      "@type": "Place",
      name: guide.state,
    },
    variableMeasured: [
      { "@type": "PropertyValue", name: "Residential electricity rate", unitText: "cents per kWh", value: guide.rate },
      { "@type": "PropertyValue", name: "Monthly EV charging cost", unitText: "USD per month", value: guide.monthlyCharging },
      { "@type": "PropertyValue", name: "Annual EV fuel savings", unitText: "USD per year", value: guide.annualGasSavings },
      { "@type": "PropertyValue", name: "Cost per mile", unitText: "USD per mile", value: Number(guide.costPerMile.toFixed(3)) },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `EV Charging Costs in ${guide.state} (2026)`,
    description: `Live calculator and complete cost breakdown for EV charging in ${guide.state}. State rate, monthly costs, savings vs gas, and state comparisons.`,
    datePublished: "2026-01-01",
    dateModified: "2026-04-15",
    author: { "@type": "Organization", name: "ChargeMath" },
    publisher: { "@type": "Organization", name: "ChargeMath", url: "https://chargemath.com" },
    mainEntityOfPage: `https://chargemath.com/guides/${guide.slug}`,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Compact header */}
      <header className="mb-4 flex flex-col gap-1">
        <Link
          href="/guides"
          className="cm-eyebrow inline-block transition-colors hover:text-[var(--color-brand)]"
        >
          All state guides
        </Link>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl">
          EV Charging Costs in {guide.state}
        </h1>
        <p
          className="mt-1 max-w-prose text-sm text-[var(--color-ink-3)] sm:text-base"
          data-speakable="true"
        >
          At {guide.rate}¢/kWh, {guide.state} is {rateLabel} ({NATIONAL_AVERAGE_RATE}¢/kWh). Ranked number {guide.rank} cheapest out of 51.
        </p>
      </header>

      {/* Live calculator locked to this state */}
      <StateCalculatorEmbed
        stateName={guide.state}
        stateCode={guide.code}
        ratePerKwhCents={guide.rate}
      />

      {/* Nearby states comparison */}
      {neighbors.length > 0 && (
        <section className="mt-10">
          <h2 className="cm-eyebrow mb-3">Similar states by rate</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--color-ink)]">State</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">Monthly</th>
                  <th className="px-4 py-3 text-right font-semibold text-[var(--color-ink)]">Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-brand-soft)]">
                  <td className="px-4 py-3 font-bold text-[var(--color-brand)]">{guide.state} (you)</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-brand)]">{guide.rate}¢</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-brand)]">{fmt.format(guide.monthlyCharging)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-brand)]">#{guide.rank}</td>
                </tr>
                {neighbors.map((s) => (
                  <tr key={s.code} className="border-b border-[var(--color-border)] last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href={`/guides/${s.slug}`} className="text-[var(--color-brand)] hover:underline">
                        {s.state}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-ink)]">{s.rate}¢</td>
                    <td className="px-4 py-3 text-right text-[var(--color-ink)]">{fmt.format(s.monthlyCharging)}</td>
                    <td className="px-4 py-3 text-right text-[var(--color-ink-3)]">#{s.rank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Editorial rail */}
      <section className="mt-10">
        <h2 className="cm-eyebrow mb-3">What the rate means for you</h2>
        <div className="calc-prose rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
          <p>
            {guide.state}&apos;s residential electricity rate of {guide.rate}¢/kWh is {rateLabel}. For a typical EV owner driving 35 miles per day, this translates to about {fmt.format(guide.monthlyCharging)} per month in charging costs, or {fmt.format(guide.annualCharging)} annually. Compared to fueling a 28 MPG gas car at $3.50 per gallon, you save {fmtShort.format(guide.annualGasSavings)} per year.
          </p>
          <p>
            At ${guide.costPerMile.toFixed(3)} per mile for electricity versus $0.125 per mile for gas, driving electric in {guide.state} costs {((1 - guide.costPerMile / 0.125) * 100).toFixed(0)}% less per mile. Over 5 years of typical driving (12,775 miles per year), that adds up to {fmtShort.format(guide.annualGasSavings * 5)} in fuel savings alone, before accounting for reduced maintenance costs.
          </p>
          <p>
            A full charge on a Tesla Model 3 (60 kWh battery, 272 miles of range) costs {fmt.format(guide.costPerFullCharge)} in {guide.state}. Most daily charging sessions only use 20 to 40 percent of the battery, so a typical overnight charge costs {fmt.format(guide.costPerFullCharge * 0.3)} to {fmt.format(guide.costPerFullCharge * 0.4)}.
          </p>
        </div>
      </section>

      <FAQSection questions={faqs} />

      <div className="mt-10 text-center">
        <Link
          href="/guides"
          className="rounded-xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-alt)]"
        >
          View all state guides
        </Link>
      </div>
    </div>
  );
}
