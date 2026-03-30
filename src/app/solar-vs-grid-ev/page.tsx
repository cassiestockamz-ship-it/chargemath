"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";
import {
  SOLAR_DATA,
  NATIONAL_AVG_SOLAR_PRODUCTION,
  NATIONAL_AVG_COST_PER_WATT,
} from "@/data/solar-data";

/* ── Formatters ── */
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

/* ── FAQ data (inline) ── */
const solarVsGridFAQ = [
  {
    question: "Is it cheaper to charge an EV with solar or grid electricity?",
    answer:
      "Over a long enough time horizon, solar almost always wins. Grid electricity costs compound every year due to utility rate escalation (historically 3-5% annually), while solar costs are mostly fixed upfront. A typical homeowner who installs solar to charge their EV will break even within 8-12 years and then enjoy effectively free EV charging for the remaining life of the panels. The longer your analysis window, the larger the solar advantage.",
  },
  {
    question: "How much does it cost to charge an EV from the grid over 25 years?",
    answer:
      "It depends on your state's electricity rate and how much you drive. A driver covering 35 miles per day in a mid-efficiency EV at the national average rate of about 16 cents per kWh pays roughly $800-$1,000 per year in EV charging costs. With 3% annual rate escalation, that compounds to approximately $27,000-$35,000 over 25 years. High-rate states like California or Connecticut can push that figure to $50,000 or more.",
  },
  {
    question: "What if my solar panels don't produce enough for my EV?",
    answer:
      "This calculator accounts for that scenario. If your solar system's annual output is less than your EV's annual charging need, the shortfall is purchased from the grid at the prevailing rate for that year. The solar total cost includes the install cost plus any grid top-up costs. You can increase the system size slider to see when solar fully covers your driving needs.",
  },
  {
    question: "Does solar charging really save money if the tax credit is gone?",
    answer:
      "Yes, for most homeowners. The federal residential solar tax credit (Section 25D) was eliminated by the One Big Beautiful Bill Act signed in July 2025. Even without that credit, solar systems still break even in 9-14 years in most states and generate net savings after that. Third-party-owned systems (leases and PPAs) may still access the Section 48E commercial credit at 30% through 2027. Many states also offer their own rebates and incentives that reduce the net cost.",
  },
  {
    question: "How does utility rate escalation affect EV charging costs?",
    answer:
      "Dramatically, over long periods. If you pay 16 cents per kWh today and rates rise 3% per year, you will pay about 21 cents in year 10, 29 cents in year 20, and 34 cents in year 25. That means your annual EV charging bill roughly doubles over 25 years. Solar locks in a near-zero marginal cost for charging because the panels are already paid for. The higher your assumed escalation rate, the faster solar pays off and the larger the long-term savings.",
  },
];

/* ── Analysis period options ── */
const PERIOD_OPTIONS = [
  { value: "10", label: "10 years" },
  { value: "15", label: "15 years" },
  { value: "25", label: "25 years" },
];

/* ── Milestone years for the comparison table ── */
const MILESTONE_YEARS = [1, 5, 10, 15, 20, 25];

export default function SolarVsGridEvPage() {
  /* ── State ── */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [systemSizeKw, setSystemSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [escalationPct, setEscalationPct] = useState(3);
  const [degradationPct, setDegradationPct] = useState(0.5);
  const [analysisPeriod, setAnalysisPeriod] = useState("25");

  /* ── Auto-detect state ── */
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  /* ── URL sync ── */
  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: String(dailyMiles),
      solar: String(systemSizeKw),
      cost: String(installCost),
      esc: String(escalationPct),
      deg: String(degradationPct),
      period: analysisPeriod,
    },
    useCallback(
      (p: Record<string, string>) => {
        if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
          setVehicleId(p.vehicle);
        if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
        if (p.miles) setDailyMiles(Number(p.miles));
        if (p.solar) setSystemSizeKw(Number(p.solar));
        if (p.cost) setInstallCost(Number(p.cost));
        if (p.esc) setEscalationPct(Number(p.esc));
        if (p.deg) setDegradationPct(Number(p.deg));
        if (p.period && ["10", "15", "25"].includes(p.period))
          setAnalysisPeriod(p.period);
      },
      []
    )
  );

  /* ── Derived ── */
  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const electricityRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100; // $/kWh
  }, [stateCode]);

  const solarProduction =
    SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;

  /* ── Calculations ── */
  const results = useMemo(() => {
    const period = Number(analysisPeriod);
    const annualEvKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles * 365;

    // Year-by-year arrays (index 0 = year 0, index n = after year n)
    const gridCumulative: number[] = [0];
    const solarCumulative: number[] = [installCost]; // year 0: upfront cost only
    const annualGridCosts: number[] = [0];
    const annualSolarOutputs: number[] = [0];
    const annualSolarDeficits: number[] = [0];

    let gridRunning = 0;
    let solarRunning = installCost;

    for (let year = 1; year <= period; year++) {
      const rate = electricityRate * Math.pow(1 + escalationPct / 100, year);
      const gridChargingCost = annualEvKwh * rate;
      gridRunning += gridChargingCost;
      gridCumulative.push(gridRunning);
      annualGridCosts.push(gridChargingCost);

      const solarOutput =
        systemSizeKw * solarProduction * Math.pow(1 - degradationPct / 100, year);
      const solarDeficit = Math.max(annualEvKwh - solarOutput, 0) * rate;
      solarRunning += solarDeficit;
      solarCumulative.push(solarRunning);
      annualSolarOutputs.push(solarOutput);
      annualSolarDeficits.push(solarDeficit);
    }

    // Break-even year: first year where grid cumulative exceeds solar cumulative
    let breakEvenYear: number | null = null;
    for (let year = 1; year <= period; year++) {
      if (gridCumulative[year] > solarCumulative[year]) {
        breakEvenYear = year;
        break;
      }
    }

    const totalGridCost = gridCumulative[period];
    const totalSolarCost = solarCumulative[period];
    const totalSavings = totalGridCost - totalSolarCost;

    const totalMiles = dailyMiles * 365 * period;
    const costPerMileGrid = totalMiles > 0 ? totalGridCost / totalMiles : 0;
    const costPerMileSolar = totalMiles > 0 ? totalSolarCost / totalMiles : 0;

    // CO2 saved: 0.85 lbs CO2/kWh grid avg, 2000 lbs per ton
    const co2SavedTons = (annualEvKwh * period * 0.85) / 2000;

    // Milestone rows for table
    const milestoneRows = MILESTONE_YEARS.filter((y) => y <= period).map(
      (year) => ({
        year,
        gridAnnual: annualGridCosts[year],
        gridCumulative: gridCumulative[year],
        solarOutput: annualSolarOutputs[year],
        solarDeficit: annualSolarDeficits[year],
        solarCumulative: solarCumulative[year],
      })
    );

    // Bar widths (normalize to 100% of the larger value)
    const maxCost = Math.max(totalGridCost, totalSolarCost);
    const gridBarPct = maxCost > 0 ? (totalGridCost / maxCost) * 100 : 0;
    const solarBarPct = maxCost > 0 ? (totalSolarCost / maxCost) * 100 : 0;

    return {
      period,
      totalGridCost,
      totalSolarCost,
      totalSavings,
      breakEvenYear,
      costPerMileGrid,
      costPerMileSolar,
      co2SavedTons,
      milestoneRows,
      gridBarPct,
      solarBarPct,
    };
  }, [
    analysisPeriod,
    dailyMiles,
    vehicle,
    installCost,
    electricityRate,
    escalationPct,
    systemSizeKw,
    solarProduction,
    degradationPct,
  ]);

  /* ── Options ── */
  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}\u00a2/kWh)`,
    }));

  const breakEvenDisplay =
    results.breakEvenYear !== null ? `Year ${results.breakEvenYear}` : "Never";

  const shareText =
    results.totalSavings > 0
      ? `Solar EV charging saves ${fmtShort.format(results.totalSavings)} vs. the grid over ${results.period} years. Break-even: ${breakEvenDisplay}.`
      : `Grid charging is cheaper than solar for my EV over ${results.period} years by ${fmtShort.format(Math.abs(results.totalSavings))}.`;

  return (
    <CalculatorLayout
      title="Solar vs Grid EV Charging Cost"
      description="See whether charging from solar panels or the grid is cheaper over 10, 15, or 25 years."
      intro="Grid electricity rates have risen at roughly 3-5% per year historically, which means the cost of charging your EV from the utility compounds over time. Solar panels have a large upfront cost but near-zero marginal charging cost for their 25+ year lifespan. This calculator builds a year-by-year model so you can see exactly when solar breaks even and how much it saves over the long run."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Solar vs Grid EV Charging Cost Calculator"
        description="Compare the total long-term cost of charging an electric vehicle from solar panels versus grid electricity. Includes break-even year, cost per mile, and cumulative savings over 10, 15, or 25 years."
        url="https://chargemath.com/solar-vs-grid-ev"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Solar vs Grid EV Charging Cost",
            url: "https://chargemath.com/solar-vs-grid-ev",
          },
        ]}
      />

      {/* ── Inputs ── */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery \u2022 ${vehicle.epaRangeMiles} mi EPA range \u2022 ${vehicle.kwhPer100Miles} kWh/100mi`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText={`${solarProduction.toLocaleString()} kWh/kW/yr solar production \u2022 ${ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE}\u00a2/kWh`}
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Daily Miles Driven"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={10}
            max={150}
            step={5}
            unit="miles"
            showValue
          />
        </div>

        <div className="sm:col-span-2">
          <SliderInput
            label="Solar System Size"
            value={systemSizeKw}
            onChange={setSystemSizeKw}
            min={3}
            max={15}
            step={1}
            unit="kW"
            showValue
          />
        </div>

        <NumberInput
          label="Solar Installation Cost"
          value={installCost}
          onChange={setInstallCost}
          min={5000}
          max={60000}
          step={500}
          unit="$"
          helpText={`National avg: ${fmtShort.format(systemSizeKw * NATIONAL_AVG_COST_PER_WATT * 1000)} for ${systemSizeKw} kW`}
        />

        <SelectInput
          label="Analysis Period"
          value={analysisPeriod}
          onChange={setAnalysisPeriod}
          options={PERIOD_OPTIONS}
          helpText="How many years to compare total costs"
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Utility Rate Escalation"
            value={escalationPct}
            onChange={setEscalationPct}
            min={0}
            max={8}
            step={0.5}
            unit="%/yr"
            showValue
          />
        </div>

        <div className="sm:col-span-2">
          <SliderInput
            label="Panel Degradation Rate"
            value={degradationPct}
            onChange={setDegradationPct}
            min={0}
            max={2}
            step={0.1}
            unit="%/yr"
            showValue
          />
        </div>
      </div>

      {/* ── Primary Results Row ── */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          {results.period}-Year Cost Comparison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Break-Even Year"
            value={breakEvenDisplay}
            unit=""
            highlight
            icon="📅"
          />
          <ResultCard
            label="Grid Total Cost"
            value={fmtShort.format(results.totalGridCost)}
            unit={`over ${results.period} yr`}
            icon="🔌"
          />
          <ResultCard
            label="Solar Total Cost"
            value={fmtShort.format(results.totalSolarCost)}
            unit={`over ${results.period} yr`}
            highlight
            icon="☀️"
          />
          <ResultCard
            label="You Save With Solar"
            value={fmtShort.format(results.totalSavings)}
            unit="vs grid"
            highlight={results.totalSavings > 0}
            icon="💰"
          />
        </div>

        {/* ── Cost Comparison Bars ── */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-5 text-sm font-semibold text-[var(--color-text)]">
            Total Cost Comparison Over {results.period} Years
          </h3>
          <div className="space-y-4">
            {/* Grid bar */}
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text)]">
                  🔌 Grid Charging
                </span>
                <span className="font-bold text-[var(--color-text)]">
                  {fmtShort.format(results.totalGridCost)}
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-lg bg-[var(--color-border)]">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-3 text-xs font-semibold text-white transition-all duration-500"
                  style={{
                    width: `${results.gridBarPct}%`,
                    backgroundColor: "#ef4444",
                    minWidth: "2rem",
                  }}
                >
                  {results.gridBarPct >= 15 ? "Grid" : ""}
                </div>
              </div>
            </div>
            {/* Solar bar */}
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text)]">
                  ☀️ Solar Charging
                </span>
                <span className="font-bold text-[var(--color-ev-green)]">
                  {fmtShort.format(results.totalSolarCost)}
                </span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-lg bg-[var(--color-border)]">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-3 text-xs font-semibold text-white transition-all duration-500"
                  style={{
                    width: `${results.solarBarPct}%`,
                    backgroundColor: "#16a34a",
                    minWidth: "2rem",
                  }}
                >
                  {results.solarBarPct >= 15 ? "Solar" : ""}
                </div>
              </div>
            </div>
          </div>
          {results.totalSavings > 0 && (
            <p className="mt-4 text-center text-sm text-[var(--color-ev-green)]">
              Solar saves {fmtShort.format(results.totalSavings)} over {results.period} years
              {results.breakEvenYear !== null
                ? ` and breaks even in year ${results.breakEvenYear}.`
                : "."}
            </p>
          )}
          {results.totalSavings <= 0 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Grid charging is cheaper over {results.period} years by{" "}
              {fmtShort.format(Math.abs(results.totalSavings))}. Try a longer
              analysis period or lower install cost.
            </p>
          )}
        </div>

        {/* ── Year-by-Year Milestone Table ── */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                  Year
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Grid Annual
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Grid Total
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Solar Output
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Solar Gap Cost
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Solar Total
                </th>
              </tr>
            </thead>
            <tbody>
              {results.milestoneRows.map((row, i) => {
                const solarAhead = row.solarCumulative < row.gridCumulative;
                return (
                  <tr
                    key={row.year}
                    className={`border-b border-[var(--color-border)] ${
                      i % 2 === 0 ? "" : "bg-[var(--color-surface-alt)]"
                    } ${
                      results.breakEvenYear === row.year
                        ? "ring-1 ring-inset ring-[var(--color-primary)]"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {row.year}
                      {results.breakEvenYear === row.year && (
                        <span className="ml-2 rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-xs text-white">
                          break-even
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                      {fmtShort.format(row.gridAnnual)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {fmtShort.format(row.gridCumulative)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                      {Math.round(row.solarOutput).toLocaleString()} kWh
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                      {row.solarDeficit > 0 ? fmtShort.format(row.solarDeficit) : "None"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        solarAhead ? "text-[var(--color-ev-green)]" : "text-[var(--color-text)]"
                      }`}
                    >
                      {fmtShort.format(row.solarCumulative)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Secondary Results Row ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Cost Per Mile (Grid)"
            value={`$${results.costPerMileGrid.toFixed(3)}`}
            unit="per mile"
            icon="🔌"
          />
          <ResultCard
            label="Cost Per Mile (Solar)"
            value={`$${results.costPerMileSolar.toFixed(3)}`}
            unit="per mile"
            icon="☀️"
          />
          <ResultCard
            label="CO2 Avoided"
            value={`${results.co2SavedTons.toFixed(1)} tons`}
            unit={`over ${results.period} yr`}
            icon="🌱"
          />
        </div>
      </div>

      <ShareResults
        title={`Solar vs Grid EV: ${breakEvenDisplay} break-even`}
        text={shareText}
      />

      <EducationalContent>
        <h2>How This Comparison Works</h2>
        <p>
          This calculator models two scenarios side by side. In the grid scenario,
          you pay for all EV charging from the utility at a rate that rises each
          year due to escalation. The cumulative cost compounds over the analysis
          period. In the solar scenario, you pay a large upfront installation cost
          on day one, then cover any gap between your panels&apos; annual output and
          your EV&apos;s annual energy need by buying from the grid. The solar
          cumulative cost is the install cost plus all those gap charges. The
          break-even year is when the rising grid cumulative line first crosses
          the flatter solar cumulative line.
        </p>
        <h3>Why Grid Costs Keep Rising</h3>
        <p>
          U.S. residential electricity rates have increased at an average of
          roughly 3-5% per year for the past two decades. This is driven by aging
          grid infrastructure requiring expensive upgrades, growing peak demand
          from electrification, fuel price volatility, and regulatory mandates.
          A 3% annual escalation rate means the electricity you pay 16 cents per
          kWh for today will cost about 29 cents by year 20 and 34 cents by year
          25. That compounding effect is why EV drivers who lock in solar upfront
          end up with a significant structural cost advantage over the long term.
        </p>
        <h3>The Solar Advantage Compounds Over Time</h3>
        <p>
          In the first few years, solar looks expensive because the install cost
          sits on the books. Grid charging has paid almost nothing yet. As years
          pass and the grid rate escalates, each additional year of grid charging
          costs more than the last. The solar cumulative line grows slowly (only
          gap costs, if any), while the grid cumulative line accelerates. This is
          why the math typically flips somewhere between years 8 and 14 for most
          U.S. homeowners. After that crossover, every additional year of
          operation increases the solar savings. A 25-year analysis frequently
          shows solar saving two to four times the original install cost.
        </p>
      </EducationalContent>

      <FAQSection questions={solarVsGridFAQ} />
      <EmailCapture source="solar-vs-grid-ev" />
      <RelatedCalculators currentPath="/solar-vs-grid-ev" />
    </CalculatorLayout>
  );
}
