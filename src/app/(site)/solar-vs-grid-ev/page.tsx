"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SavingsMeter from "@/components/SavingsMeter";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
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
} from "@/data/solar-data";

/* FAQ data (inline) */
const solarVsGridFAQ = [
  {
    question: "Is it cheaper to charge an EV with solar or grid electricity?",
    answer:
      "Over a long enough time horizon, solar almost always wins. Grid electricity costs compound every year due to utility rate escalation (historically 3 to 5 percent annually), while solar costs are mostly fixed upfront. A typical homeowner who installs solar to charge their EV will break even within 10 to 14 years and then enjoy effectively free EV charging for the remaining life of the panels. The longer your analysis window, the larger the solar advantage.",
  },
  {
    question: "How much does it cost to charge an EV from the grid over 25 years?",
    answer:
      "It depends on your state's electricity rate and how much you drive. A driver covering 35 miles per day in a mid-efficiency EV at the national average rate of about 16 cents per kWh pays roughly $800 to $1,000 per year in EV charging costs. With 3% annual rate escalation, that compounds to approximately $27,000 to $35,000 over 25 years. High-rate states like California or Connecticut can push that figure to $50,000 or more.",
  },
  {
    question: "What if my solar panels do not produce enough for my EV?",
    answer:
      "This calculator accounts for that scenario. If your solar system's annual output is less than your EV's annual charging need, the shortfall is purchased from the grid at the prevailing rate for that year. The solar total cost includes the install cost plus any grid top-up costs. You can increase the system size slider to see when solar fully covers your driving needs.",
  },
  {
    question: "Does solar charging really save money if the tax credit is gone?",
    answer:
      "Yes, for most homeowners. The federal residential solar tax credit (Section 25D) was repealed by the One Big Beautiful Bill Act signed in July 2025. Even without that credit, solar systems still break even in 10 to 16 years in most states and generate net savings after that. Leased systems and Power Purchase Agreements may still access the Section 48E commercial credit at 30% through 2027. Many states also offer their own rebates and incentives that reduce the net cost.",
  },
  {
    question: "How does utility rate escalation affect EV charging costs?",
    answer:
      "Dramatically, over long periods. If you pay 16 cents per kWh today and rates rise 3% per year, you will pay about 21 cents in year 10, 29 cents in year 20, and 34 cents in year 25. That means your annual EV charging bill roughly doubles over 25 years. Solar locks in a near-zero marginal cost for charging because the panels are already paid for.",
  },
];

/* Analysis period options */
const PERIOD_OPTIONS = [
  { value: "10", label: "10 years" },
  { value: "15", label: "15 years" },
  { value: "25", label: "25 years" },
];

export default function SolarVsGridEvPage() {
  /* State */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [systemSizeKw, setSystemSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [escalationPct, setEscalationPct] = useState(3);
  const [degradationPct, setDegradationPct] = useState(0.5);
  const [analysisPeriod, setAnalysisPeriod] = useState("25");

  /* Auto-detect state */
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  /* URL sync */
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

  /* Derived */
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

  /* Calculations */
  const results = useMemo(() => {
    const period = Number(analysisPeriod);
    const annualEvKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles * 365;

    const gridCumulative: number[] = [0];
    const solarCumulative: number[] = [installCost];
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

    // Break-even year
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

    // Levelized cost per kWh over the period
    const totalEvKwh = annualEvKwh * period;
    const levelizedSolar = totalEvKwh > 0 ? totalSolarCost / totalEvKwh : 0;

    // Annual equivalents at year 1 for the SavingsMeter
    const gridYear1 = annualGridCosts[1] ?? 0;
    const solarYear1Deficit = annualSolarDeficits[1] ?? 0;

    // Annualized costs across full period for the hero delta
    const gridPerYear = totalGridCost / period;
    const solarPerYear = totalSolarCost / period;
    const annualDelta = gridPerYear - solarPerYear;

    const solarWins = totalSavings >= 0;

    // Dial: lifetime savings as percent of system cost
    const lifetimeSavingsPctOfCost =
      installCost > 0 ? (totalSavings / installCost) * 100 : 0;

    return {
      period,
      totalGridCost,
      totalSolarCost,
      totalSavings,
      breakEvenYear,
      costPerMileGrid,
      costPerMileSolar,
      levelizedSolar,
      gridYear1,
      solarYear1Deficit,
      gridPerYear,
      solarPerYear,
      annualDelta,
      solarWins,
      lifetimeSavingsPctOfCost,
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

  /* Options */
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

  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? stateCode;
  const headline = results.solarWins ? "SOLAR WINS BY" : "GRID WINS BY";
  const deltaAmount = Math.round(Math.abs(results.annualDelta));

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <SliderInput
        label="Daily miles driven"
        value={dailyMiles}
        onChange={setDailyMiles}
        min={10}
        max={150}
        step={5}
        unit="mi"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <SliderInput
            label="Solar system size"
            value={systemSizeKw}
            onChange={setSystemSizeKw}
            min={3}
            max={15}
            step={1}
            unit="kW"
            showValue
          />
          <NumberInput
            label="Solar installation cost"
            value={installCost}
            onChange={setInstallCost}
            min={5000}
            max={60000}
            step={500}
            unit="$"
            helpText="Total cost, no federal credit for cash buyers in 2026"
          />
          <SelectInput
            label="Analysis period"
            value={analysisPeriod}
            onChange={setAnalysisPeriod}
            options={PERIOD_OPTIONS}
          />
          <SliderInput
            label="Utility rate escalation"
            value={escalationPct}
            onChange={setEscalationPct}
            min={0}
            max={8}
            step={0.5}
            unit="%/yr"
            showValue
          />
          <SliderInput
            label="Panel degradation rate"
            value={degradationPct}
            onChange={setDegradationPct}
            min={0}
            max={2}
            step={0.1}
            unit="%/yr"
            showValue
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Solar vs grid"
      headline={headline}
      amount={deltaAmount}
      amountPrefix="$"
      amountDecimals={0}
      amountUnit="/year"
      sub={`Annualized over ${results.period} years in ${stateName}. ${
        results.breakEvenYear
          ? `Solar breaks even in year ${results.breakEvenYear}.`
          : "Solar does not break even in this window."
      }`}
      dialPercent={Math.min(
        100,
        Math.max(0, results.lifetimeSavingsPctOfCost)
      )}
      dialLabel="LIFETIME ROI"
    >
      <SavingsTile
        label="SOLAR /YR"
        value={Math.round(results.solarPerYear)}
        prefix="$"
        unit="/yr"
        tier="good"
      />
      <SavingsTile
        label="GRID /YR"
        value={Math.round(results.gridPerYear)}
        prefix="$"
        unit="/yr"
        tier="warn"
      />
      <SavingsTile
        label={`${results.period} YR DELTA`}
        value={Math.round(results.totalSavings)}
        prefix="$"
        unit=" total"
        tier="volt"
      />
      <SavingsTile
        label="LEVELIZED"
        value={results.levelizedSolar}
        prefix="$"
        decimals={3}
        unit="/kWh"
        tier="brand"
      />
    </SavingsVerdict>
  );

  return (
    <>
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
      <CalculatorShell
        eyebrow="Solar vs grid"
        title="Solar vs Grid EV Charging"
        quickAnswer="Solar locks in near-zero marginal charging cost. Grid rates keep escalating. The crossover is usually year 10 to 14."
        inputs={inputs}
        hero={hero}
      >
        <div className="mb-8">
          <SavingsMeter
            leftLabel="GRID"
            leftValue={Math.round(results.gridPerYear)}
            rightLabel="SOLAR"
            rightValue={Math.round(results.solarPerYear)}
          />
        </div>

        <EducationalContent>
          <h2>How This Comparison Works</h2>
          <p>
            This calculator models two scenarios side by side. In the grid
            scenario, you pay for all EV charging from the utility at a rate that
            rises each year due to escalation. The cumulative cost compounds
            over the analysis period. In the solar scenario, you pay a large
            upfront installation cost on day one, then cover any gap between
            your panels&apos; annual output and your EV&apos;s annual energy
            need by buying from the grid. The solar cumulative cost is the
            install cost plus all those gap charges. The break-even year is
            when the rising grid cumulative line first crosses the flatter
            solar cumulative line.
          </p>
          <h3>Why Grid Costs Keep Rising</h3>
          <p>
            U.S. residential electricity rates have increased at an average of
            roughly 3 to 5 percent per year for the past two decades. This is
            driven by aging grid infrastructure requiring expensive upgrades,
            growing peak demand from electrification, fuel price volatility,
            and regulatory mandates. A 3% annual escalation rate means the
            electricity you pay 16 cents per kWh for today will cost about 29
            cents by year 20 and 34 cents by year 25. That compounding effect
            is why EV drivers who lock in solar upfront end up with a
            significant structural cost advantage over the long term.
          </p>
          <h3>The Solar Advantage Compounds Over Time</h3>
          <p>
            In the first few years, solar looks expensive because the install
            cost sits on the books. Grid charging has paid almost nothing yet.
            As years pass and the grid rate escalates, each additional year of
            grid charging costs more than the last. The solar cumulative line
            grows slowly (only gap costs, if any), while the grid cumulative
            line accelerates. This is why the math typically flips somewhere
            between years 10 and 14 for most U.S. homeowners post-Section-25D.
            After that crossover, every additional year of operation increases
            the solar savings.
          </p>
        </EducationalContent>

        <FAQSection questions={solarVsGridFAQ} />
        <EmailCapture source="solar-vs-grid-ev" />
        <RelatedCalculators currentPath="/solar-vs-grid-ev" />
      </CalculatorShell>
    </>
  );
}
