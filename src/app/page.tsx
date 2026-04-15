import Link from "next/link";
import HomeLiveHero from "@/components/HomeLiveHero";
import CalculatorSearch from "@/components/CalculatorSearch";

const categories = [
  {
    label: "Live Data + Unique Tools",
    eyebrow: "Only on ChargeMath",
    items: [
      { title: "Will I Make It Home?", href: "/will-i-make-it-home", blurb: "Real-world arrival SOC with temperature, speed, and heat load." },
      { title: "Winter Range Forecast", href: "/winter-range-forecast", blurb: "7-day range forecast by ZIP with cold-weather retention data." },
      { title: "Charge Curve Simulator", href: "/charge-curve", blurb: "Real DCFC curves for 16 popular EVs, full-session chart." },
      { title: "Panel Load Check", href: "/panel-load-check", blurb: "NEC 220.83 + 625.42 worksheet. Can your panel take a Level 2?" },
      { title: "EV Tire Cost", href: "/ev-tire-cost", blurb: "The hidden line item on the EV ledger nobody tells you about." },
    ],
  },
  {
    label: "Cost & Savings",
    eyebrow: "Money in, money out",
    items: [
      { title: "Charging Cost", href: "/ev-charging-cost", blurb: "Your monthly bill impact by car, state, and habits." },
      { title: "Gas vs Electric", href: "/gas-vs-electric", blurb: "The fuel savings number, side by side." },
      { title: "EV vs Hybrid", href: "/ev-vs-hybrid", blurb: "The middle-ground math nobody runs." },
      { title: "Total Cost of Ownership", href: "/total-cost", blurb: "5 years, purchase to resale, every line." },
      { title: "Lease vs Buy", href: "/lease-vs-buy", blurb: "Break even month, cash flow, depreciation risk." },
      { title: "Payback Period", href: "/payback-period", blurb: "When the EV premium pays for itself." },
      { title: "Commute Cost", href: "/commute-cost", blurb: "Per-trip fuel and wear math for your route." },
      { title: "Used EV Value", href: "/used-ev-value", blurb: "Residual, battery health, and fair-price math." },
      { title: "Tax Credits", href: "/tax-credits", blurb: "Federal and state credits, post-September 2025 rules." },
    ],
  },
  {
    label: "Charging",
    eyebrow: "Plug in the math",
    items: [
      { title: "Charging Time", href: "/charging-time", blurb: "Level 1, Level 2, DC fast. From X% to Y%." },
      { title: "Charger ROI", href: "/charger-roi", blurb: "How fast a home Level 2 pays off vs public charging." },
      { title: "Bill Impact", href: "/bill-impact", blurb: "What the EV adds to your monthly utility bill." },
      { title: "Public Charging", href: "/public-charging", blurb: "Tesla, EA, ChargePoint, EVgo pricing per session." },
      { title: "TOU Optimizer", href: "/tou-optimizer", blurb: "When to plug in. When not to plug in." },
    ],
  },
  {
    label: "Range & Trips",
    eyebrow: "Can you make it?",
    items: [
      { title: "Range Calculator", href: "/range", blurb: "Real-world range by speed, temp, terrain." },
      { title: "Winter Range", href: "/winter-range", blurb: "Cold-weather retention curves." },
      { title: "Towing Range", href: "/towing-range", blurb: "Drag penalty math for trailers." },
      { title: "Road Trip Planner", href: "/road-trip", blurb: "Session count, DCFC stop length, total drive time." },
    ],
  },
  {
    label: "Solar & Energy",
    eyebrow: "Make the grid work",
    items: [
      { title: "Solar + EV", href: "/solar-ev", blurb: "How much panel for how many EV miles." },
      { title: "Solar Panel Sizing", href: "/solar-ev-sizing", blurb: "kW from roof, peak sun hours, annual yield." },
      { title: "Solar Payback", href: "/solar-payback", blurb: "Post-ITC repeal math for homeowners." },
      { title: "Solar + Battery", href: "/solar-battery-ev", blurb: "Storage sizing, self-consumption ratio." },
      { title: "Solar vs Grid Cost", href: "/solar-vs-grid-ev", blurb: "Levelized cost, head to head." },
      { title: "Battery Degradation", href: "/battery-degradation", blurb: "Calendar + cycle aging over a decade." },
      { title: "Carbon Footprint", href: "/carbon-footprint", blurb: "Grid mix vs gas, lbs of CO2 per year." },
      { title: "Fleet Calculator", href: "/fleet", blurb: "Depot charging math for small business fleets." },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ChargeMath",
            url: "https://chargemath.com",
            description:
              "Free EV calculators powered by real EPA vehicle data and state electricity rates.",
            publisher: {
              "@type": "Organization",
              name: "ChargeMath",
              url: "https://chargemath.com/about",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://chargemath.com/calculators?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Live hero — the answer is already on screen before the user does anything */}
      <HomeLiveHero />

      {/* Calculator search */}
      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <CalculatorSearch />
      </section>

      {/* Directory — every tool on one page, no burial */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex flex-col gap-1">
            <span className="cm-eyebrow">All calculators</span>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-3xl">
              Every EV question, one tool each.
            </h2>
          </div>
          <div className="grid items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.label} className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5 border-l-2 border-[var(--color-brand)] pl-3">
                  <span className="cm-eyebrow" style={{ color: "var(--color-brand)" }}>
                    {cat.eyebrow}
                  </span>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">{cat.label}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {cat.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex flex-col gap-0.5 rounded-lg border border-transparent bg-white/60 px-3 py-2 transition-colors hover:border-[var(--color-border)] hover:bg-white"
                      >
                        <span className="text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-brand)]">
                          {item.title}
                        </span>
                        <span className="text-xs text-[var(--color-ink-3)]">{item.blurb}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State guides CTA */}
      <section className="border-t border-[var(--color-border)] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <span className="cm-eyebrow">State guides</span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            EV charging cost, state by state.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-ink-3)] sm:text-base">
            Electricity rates vary by 3x across the country. Your state decides how fast the math works in your favor.
          </p>
          <Link
            href="/guides"
            className="mt-6 inline-block rounded-xl bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[var(--color-brand-hi)]"
          >
            View all 51 state guides
          </Link>
        </div>
      </section>
    </>
  );
}
