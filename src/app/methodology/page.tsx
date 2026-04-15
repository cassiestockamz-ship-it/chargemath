import Link from "next/link";
import type { Metadata } from "next";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
  title: "Methodology: How ChargeMath calculates everything",
  description:
    "The exact formulas, data sources, and assumptions behind every ChargeMath calculator. EPA FuelEconomy.gov efficiency, EIA state electricity rates, Recurrent cold-weather retention curves, and the 2026 post-30D tax-credit reality.",
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: "ChargeMath Methodology: formulas, sources, assumptions",
    description:
      "How ChargeMath calculates EV charging cost, gas savings, range, payback, and solar coverage. We show our work.",
    url: "https://chargemath.com/methodology",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Methodology: How ChargeMath calculates everything",
  description:
    "Formulas, data sources, and assumptions behind every ChargeMath calculator.",
  datePublished: "2026-04-15",
  dateModified: "2026-04-15",
  author: {
    "@type": "Organization",
    name: "ChargeMath",
    url: "https://chargemath.com",
  },
  publisher: {
    "@type": "Organization",
    name: "ChargeMath",
    url: "https://chargemath.com",
  },
  mainEntityOfPage: "https://chargemath.com/methodology",
};

export default function MethodologyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Methodology", url: "https://chargemath.com/methodology" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-5 sm:px-6 sm:pt-10">
        <header className="mb-6 flex flex-col gap-1">
          <span className="cm-eyebrow">Methodology</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            How ChargeMath calculates everything.
          </h1>
          <p
            className="mt-3 max-w-prose text-base text-[var(--color-ink-2)]"
            data-speakable="true"
          >
            We show our work. Every calculator on this site uses public
            government data and published research, fed through a small set of
            well-understood formulas. No black boxes, no opaque APIs, no AI
            hallucinating numbers. Here is exactly what runs when you move a
            slider.
          </p>
        </header>

        {/* Table of contents */}
        <nav className="mb-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <span className="cm-eyebrow">On this page</span>
          <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
            <li><a className="text-[var(--color-brand)] hover:underline" href="#sources">Data sources</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#formulas">Core formulas</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#range">Real-world range model</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#solar">Solar and grid math</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#credits">Tax credits after 30D</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#excluded">What we do not include</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#updates">Update cadence</a></li>
            <li><a className="text-[var(--color-brand)] hover:underline" href="#contact">Questions or corrections</a></li>
          </ul>
        </nav>

        <article className="calc-prose">
          <h2 id="sources">Data sources</h2>
          <p>
            Everything on this site traces back to one of five
            public sources. We pin versions annually and note where numbers
            came from so you can verify anything that surprises you.
          </p>
          <ul>
            <li>
              <strong>EPA FuelEconomy.gov</strong> (<a href="https://www.fueleconomy.gov" rel="noopener" target="_blank">fueleconomy.gov</a>). Vehicle efficiency in kWh per 100 miles, EPA range rating, battery capacity, MPGe. Updated annually from the EPA Test Car List and the Green Vehicle Guide. This is the same data the window sticker on a new EV is built from.
            </li>
            <li>
              <strong>EIA residential electricity rates</strong> (<a href="https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a" rel="noopener" target="_blank">eia.gov</a>). Average residential cost per kilowatt-hour for each of the 50 states plus DC. The cents-per-kWh number you see in the state selector is a direct copy of the EIA average residential rate for the most recent full year, rounded to two decimals.
            </li>
            <li>
              <strong>AFDC incentive database</strong> (<a href="https://afdc.energy.gov/laws/search" rel="noopener" target="_blank">afdc.energy.gov</a>). State and local EV incentives: rebates, tax credits, HOV access, charging install credits. We only list programs that are currently funded. Expired or paused programs are removed within one update cycle.
            </li>
            <li>
              <strong>Recurrent cold-weather retention data</strong> (<a href="https://www.recurrentauto.com" rel="noopener" target="_blank">recurrentauto.com</a>). Temperature-versus-range curves from real-world telematics across tens of thousands of EVs. This powers the temperature penalty in the range and panic calculators.
            </li>
            <li>
              <strong>EPA CO2 emission factors</strong> and <strong>EIA grid mix</strong>. Gasoline emits 8,887 grams of CO2 per gallon burned (EPA 420-F-14-040a). Electricity emits a state-varying amount of CO2 per kWh based on the local grid mix. We use the 2024 US average of 0.86 lbs per kWh unless the state guide overrides it with a specific number.
            </li>
          </ul>

          <h2 id="formulas">Core formulas</h2>
          <p>
            Here are the four formulas that sit under almost every cost-related
            calculator on the site. If you want to sanity-check a result with a
            calculator app, these are the equations to use.
          </p>
          <p>
            <strong>Annual energy used.</strong> We take your daily miles times
            365, divide by 100, then multiply by the vehicle&apos;s EPA kWh per
            100 miles. For a Tesla Model 3 at 25 kWh per 100 miles driven 35
            miles per day, that is 35 times 365 divided by 100, times 25, equal
            to 3,194 kWh per year.
          </p>
          <p>
            <strong>Annual electricity cost.</strong> Annual energy multiplied
            by your electricity rate in dollars per kWh. For the Tesla Model 3
            at California&apos;s 27.57 cents per kWh, that is 3,194 times
            0.2757, equal to 881 dollars per year.
          </p>
          <p>
            <strong>Annual gas cost for comparison.</strong> Daily miles times
            365, divided by MPG, times dollars per gallon. For a 28 MPG car at
            $3.50 per gallon driven 12,775 miles per year, that is 12,775
            divided by 28 times $3.50, equal to $1,597 per year.
          </p>
          <p>
            <strong>Annual savings.</strong> Annual gas cost minus annual
            electricity cost. In the example above, $1,597 minus $881, equal
            to $716. That is the number the homepage hero shows by default.
          </p>
          <p>
            Cost per mile is just the annual cost divided by annual miles. For
            the same Tesla Model 3 in California, that is $881 divided by
            12,775 miles, equal to about 6.9 cents per mile. A gas car at 28
            MPG and $3.50 per gallon runs 12.5 cents per mile, so the EV is
            about 45 percent cheaper per mile under these assumptions.
          </p>

          <h2 id="range">Real-world range model</h2>
          <p>
            EPA range is a single number from a standardized dyno test at
            73&deg;F, no wind, no climate control, at an average speed around
            48 mph. Real driving is not that. The range calculator and the
            will-i-make-it-home panic calculator both adjust EPA range by five
            multiplicative factors.
          </p>
          <ol>
            <li>
              <strong>Temperature.</strong> Curve fitted to Recurrent&apos;s 2023
              cold-weather study. A battery retains about 100 percent of EPA
              range at 70&deg;F, 92 percent at 60&deg;F, 82 percent at 50&deg;F,
              68 percent at freezing, 59 percent at 0&deg;F, and 50 percent at
              -10&deg;F. Hot-weather range loss is smaller but non-zero: 97
              percent at 90&deg;F, 83 percent above 95&deg;F.
            </li>
            <li>
              <strong>Speed.</strong> Aerodynamic drag rises with the square of
              speed, so highway efficiency drops off quickly past 60 mph. Our
              curve gives 100 percent at 60 mph, 96 percent at 65, 90 percent at
              70, 83 percent at 75, 77 percent at 80. Tuned to Idaho National
              Lab and independent Bjorn Nyland 90 and 110 km/h tests.
            </li>
            <li>
              <strong>Cabin heat or AC.</strong> Cabin heat on a cold day draws
              1.5 to 5 kW, which eats 8 to 17 percent of range for a typical
              commute. AC is much cheaper, around 5 percent. Seat warmers and
              heated steering wheels are near-free compared to full cabin heat.
            </li>
            <li>
              <strong>Terrain.</strong> Flat ground is the baseline. Hilly
              terrain costs roughly 10 percent through net elevation change and
              more time at load. Mountainous driving costs about 25 percent.
              Net-downhill highway driving can actually recover some range via
              regenerative braking but we do not model regen gains above EPA.
            </li>
            <li>
              <strong>Cargo and passengers.</strong> An extra two adults costs
              about 3 percent. A fully loaded car plus cargo costs about 8
              percent. Towing is the most brutal, typically 40 to 50 percent
              range loss depending on trailer weight and frontal area. The
              towing calculator has its own dedicated model for that.
            </li>
          </ol>
          <p>
            We multiply these five factors together, so a 70 mph highway run on
            a 30&deg;F day with cabin heat on at 3 kW, flat terrain, driver
            only, gives 0.9 times 0.68 times 0.83 times 1.0 times 1.0, equal
            to about 51 percent of EPA. That is what the panic calculator
            returns for that input combination.
          </p>

          <h2 id="solar">Solar and grid math</h2>
          <p>
            Solar calculators on this site use a flat annual-energy model:
            system size in kilowatts times state peak sun hours times 365,
            adjusted for a 0.8 performance ratio to account for real-world
            losses from inverter efficiency, wiring, panel soiling, and
            orientation. That gives annual kWh produced. We then subtract the
            EV&apos;s annual kWh need to get net-to-grid or net-from-grid
            energy.
          </p>
          <p>
            Payback math uses cash basis, not levelized cost. System cost
            (after any available state-lease or PPA credit) divided by annual
            grid savings equals payback in years. We do not bake in ITC for
            owner-installed systems because Section 25D was repealed in 2025.
            See the tax-credits section below for the long version.
          </p>

          <h2 id="credits">Tax credits after 30D and 25D</h2>
          <p>
            Two major federal EV-related credits changed dramatically in 2025.
            Our tax-credits calculator reflects the new reality. Most other
            sites do not.
          </p>
          <p>
            <strong>Section 30D (new clean vehicle credit).</strong> Repealed
            for vehicles placed in service after September 30, 2025. If you
            bought or leased a new EV on or before that date, you may still
            claim up to $7,500 on your 2025 return. For anyone buying now,
            assume $0 federal credit on a new purchase. Some state credits
            still apply. Several states have their own point-of-sale rebates
            ranging from $1,000 to $7,500 for income-qualified buyers.
          </p>
          <p>
            <strong>Section 25D (residential clean energy).</strong> Eliminated
            by the OBBBA (July 4, 2025) for homeowner-owned solar systems. The
            30 percent federal credit is gone for cash or loan purchases placed
            in service in 2026 and later. Third-party owned systems (leases and
            PPAs) can still claim Section 48E through 2027 and are usually
            structured so the installer captures the credit and passes part of
            it back as a lower lease payment.
          </p>
          <p>
            <strong>Section 30C (charger installation credit).</strong> Extended
            through 2032 by the IRA, but subject to census tract eligibility.
            Thirty percent of equipment plus installation, capped at $1,000 for
            residential. Check the IRS&apos;s census tract lookup before
            assuming you qualify.
          </p>
          <p>
            <strong>Section 25E (used clean vehicle credit).</strong> Still
            alive. Thirty percent of the purchase price up to $4,000 on used
            EVs at least two model years old, with income caps of $75,000
            single or $150,000 married filing jointly.
          </p>

          <h2 id="excluded">What we do not include</h2>
          <p>
            Every calculator on this site is an estimate. We exclude several
            line items that would move results one way or the other, on the
            theory that it is better to tell you what we left out than to make
            up numbers.
          </p>
          <ul>
            <li>
              <strong>Maintenance.</strong> EVs typically save $500 to $1,000
              per year on maintenance (no oil changes, fewer brake pads,
              regen-assisted slowing). We do not bake that in. If you want to
              claim it, add it to the savings number you see.
            </li>
            <li>
              <strong>Insurance.</strong> EV insurance runs roughly 10 to 15
              percent higher than comparable gas cars because repair costs are
              higher. We do not include this either.
            </li>
            <li>
              <strong>Battery replacement risk.</strong> Most modern EV
              batteries retain 90 percent or more of capacity after 200,000
              miles. Out-of-warranty replacements cost $5,000 to $15,000 but
              are extremely rare on 2020-or-newer cars. We do not model this
              as a line item.
            </li>
            <li>
              <strong>Time-of-use electricity plans.</strong> Many utilities
              offer overnight rates 30 to 50 percent below the flat-rate
              average. We use the flat residential rate unless you override it
              with a custom cents-per-kWh input.
            </li>
            <li>
              <strong>Demand charges and solar net-metering buyback rates.</strong> We
              assume standard residential billing without special rate
              structures. If your utility has a heavy demand charge or a poor
              net-metering deal, the numbers shift.
            </li>
            <li>
              <strong>Depreciation.</strong> Only the Total Cost of Ownership
              calculator includes this. Every other calculator treats
              depreciation as out of scope.
            </li>
          </ul>

          <h2 id="updates">Update cadence</h2>
          <p>
            Data refreshes annually. EIA electricity rates update in late Q1
            each year when the latest full-year averages publish. Vehicle
            efficiency updates when the EPA publishes the new model year, in
            late Q3. State incentives update whenever legislation changes,
            usually Q1 and Q3. Tax-credit language updates whenever federal
            policy shifts.
          </p>

          <h2 id="contact">Questions, corrections, or a number that feels wrong?</h2>
          <p>
            We publish our methodology precisely so you can challenge it. If a
            calculator returns a number you cannot reconcile with your own
            spreadsheet, or if you spot a stale data point, the fastest path to
            a fix is the <Link href="/about">About page</Link>, which has our
            contact details. We read every email.
          </p>
        </article>

        <nav className="mt-12 flex flex-wrap gap-3 text-sm">
          <Link
            href="/calculators"
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
          >
            All calculators
          </Link>
          <Link
            href="/guides"
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
          >
            State guides
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
          >
            About ChargeMath
          </Link>
        </nav>
      </div>
    </>
  );
}
