"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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

const CO2_GRAMS_PER_GALLON = 8887;
const CO2_LBS_PER_KWH = 0.86;
const LBS_CO2_PER_TREE_PER_YEAR = 48;

const evVsHybridFAQ = [
  {
    question: "Is a hybrid or fully electric car cheaper to fuel?",
    answer:
      "Fully electric vehicles are almost always cheaper to fuel than hybrids. A typical EV costs $0.03-0.05 per mile in electricity, while a 50 MPG hybrid costs about $0.07 per mile in gasoline at $3.50/gallon. Over 12,000 miles per year, that difference adds up to $250-500 in annual savings for the EV.",
  },
  {
    question: "How does hybrid fuel efficiency compare to a gas car?",
    answer:
      "Hybrids typically achieve 45-60 MPG compared to 25-32 MPG for conventional gas cars. This roughly cuts fuel costs in half. However, EVs go even further by eliminating gasoline entirely, reducing fuel costs by 60-70% compared to a standard gas vehicle.",
  },
  {
    question: "Do hybrids produce less CO2 than gas cars?",
    answer:
      "Yes, hybrids produce roughly 40-50% less CO2 per mile than conventional gas vehicles because they burn less fuel. However, EVs produce zero tailpipe emissions. Even accounting for power plant emissions from electricity generation, EVs typically produce 50-70% less total CO2 than gas cars and 20-40% less than hybrids.",
  },
  {
    question: "When does a hybrid make more sense than an EV?",
    answer:
      "Hybrids can be a better choice if you frequently drive long distances without access to charging, live in an area with very expensive electricity (above 30 cents/kWh), or need to minimize upfront purchase cost. Hybrids also make sense as a transitional vehicle if charging infrastructure in your area is still limited.",
  },
  {
    question: "What maintenance costs differ between EVs, hybrids, and gas cars?",
    answer:
      "Gas cars have the highest maintenance costs due to oil changes, transmission service, and more frequent brake replacements. Hybrids save some on brakes (regenerative braking) but still require oil changes and have more complex drivetrains. EVs have the lowest maintenance costs with no oil changes, fewer brake replacements, and far fewer moving parts. Annual maintenance savings for EVs average $500-1,000 vs gas cars.",
  },
];

export default function EvVsHybridPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);
  const [hybridMpg, setHybridMpg] = useState(50);
  const [years, setYears] = useState("5");

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: dailyMiles,
      gas: gasPrice,
      mpg: gasMpg,
      hybrid: hybridMpg,
      years,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.gas) setGasPrice(Number(p.gas));
      if (p.mpg) setGasMpg(Number(p.mpg));
      if (p.hybrid) setHybridMpg(Number(p.hybrid));
      if (p.years) setYears(p.years);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    return (
      (ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE) / 100
    );
  }, [customRate, stateCode]);

  const periodYears = Number(years);

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const monthlyMiles = annualMiles / 12;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;

    // EV costs
    const evAnnualCost = annualKwh * rate;
    const evMonthlyCost = evAnnualCost / 12;
    const evCostPerMile = rate * (vehicle.kwhPer100Miles / 100);
    const evTotalCost = evAnnualCost * periodYears;

    // Hybrid costs
    const hybridAnnualCost = (annualMiles / hybridMpg) * gasPrice;
    const hybridMonthlyCost = hybridAnnualCost / 12;
    const hybridCostPerMile = gasPrice / hybridMpg;
    const hybridTotalCost = hybridAnnualCost * periodYears;

    // Gas costs
    const gasAnnualCost = (annualMiles / gasMpg) * gasPrice;
    const gasMonthlyCost = gasAnnualCost / 12;
    const gasCostPerMile = gasPrice / gasMpg;
    const gasTotalCost = gasAnnualCost * periodYears;

    // CO2 calculations
    const gasCO2LbsPerYear =
      ((annualMiles / gasMpg) * CO2_GRAMS_PER_GALLON) / 453.592;
    const hybridCO2LbsPerYear =
      ((annualMiles / hybridMpg) * CO2_GRAMS_PER_GALLON) / 453.592;
    const evCO2LbsPerYear = annualKwh * CO2_LBS_PER_KWH;

    // Savings: EV vs gas, EV vs hybrid, hybrid vs gas
    const evVsGasSavings = gasAnnualCost - evAnnualCost;
    const evVsHybridSavings = hybridAnnualCost - evAnnualCost;
    const hybridVsGasSavings = gasAnnualCost - hybridAnnualCost;

    const evCO2SavingsVsGas = gasCO2LbsPerYear - evCO2LbsPerYear;
    const equivalentTrees = evCO2SavingsVsGas / LBS_CO2_PER_TREE_PER_YEAR;

    return {
      annualMiles,
      monthlyMiles,
      evAnnualCost,
      evMonthlyCost,
      evCostPerMile,
      evTotalCost,
      hybridAnnualCost,
      hybridMonthlyCost,
      hybridCostPerMile,
      hybridTotalCost,
      gasAnnualCost,
      gasMonthlyCost,
      gasCostPerMile,
      gasTotalCost,
      gasCO2LbsPerYear,
      hybridCO2LbsPerYear,
      evCO2LbsPerYear,
      evVsGasSavings,
      evVsHybridSavings,
      hybridVsGasSavings,
      evCO2SavingsVsGas,
      equivalentTrees,
    };
  }, [dailyMiles, vehicle, rate, gasMpg, hybridMpg, gasPrice, periodYears]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}\u00A2/kWh)`,
    }));

  const periodOptions = [
    { value: "1", label: "1 Year" },
    { value: "3", label: "3 Years" },
    { value: "5", label: "5 Years" },
    { value: "10", label: "10 Years" },
  ];

  const dialPercent =
    results.hybridAnnualCost > 0
      ? Math.max(
          0,
          Math.min(100, (results.evVsHybridSavings / results.hybridAnnualCost) * 100)
        )
      : 0;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi, ${vehicle.epaRangeMiles} mi range`}
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
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="EV SAVES vs HYBRID"
      amount={Math.max(0, results.evVsHybridSavings)}
      amountUnit="/year"
      sub={
        <>
          On fuel vs a {hybridMpg} MPG hybrid. Over {periodYears} years that adds up to
          {" $"}
          {Math.round(Math.max(0, results.evVsHybridSavings) * periodYears).toLocaleString()}.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="HYBRID CUT"
    >
      <SavingsTile
        label={`${periodYears} YR EV COST`}
        value={results.evTotalCost}
        prefix="$"
        unit=" fuel"
        tier="brand"
        animate
      />
      <SavingsTile
        label={`${periodYears} YR HYBRID COST`}
        value={results.hybridTotalCost}
        prefix="$"
        unit=" fuel"
        tier="mid"
        animate
      />
      <SavingsTile
        label="EV /MILE"
        value={results.evCostPerMile}
        prefix="$"
        decimals={3}
        unit="/mi"
        tier="good"
        compareBars={[
          { label: "GAS", value: results.gasCostPerMile, color: "var(--color-warn)" },
          { label: "HYB", value: results.hybridCostPerMile, color: "var(--color-volt)" },
          { label: "EV", value: results.evCostPerMile, color: "var(--color-teal)" },
        ]}
      />
      <SavingsTile
        label="HYBRID /MILE"
        value={results.hybridCostPerMile}
        prefix="$"
        decimals={3}
        unit="/mi"
        tier="volt"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Cost comparison"
      title="EV vs Hybrid vs Gas"
      quickAnswer="An EV typically beats a 50 MPG hybrid by $250 to $500 per year on fuel, and beats a gas car by $800 to $1,200 per year."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV vs Hybrid vs Gas Cost Comparison"
        description="Three-way fuel cost comparison of electric, hybrid, and gas vehicles with cost per mile, annual savings, and CO2 analysis."
        url="https://chargemath.com/ev-vs-hybrid"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "EV vs Hybrid Comparison",
            url: "https://chargemath.com/ev-vs-hybrid",
          },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Custom electricity rate (optional)"
            value={customRate ?? 0}
            onChange={(v) => setCustomRate(v > 0 ? v : null)}
            min={0}
            max={100}
            step={0.1}
            unit={"\u00A2/kWh"}
            helpText="Leave at 0 to use state average"
          />
          <SelectInput
            label="Comparison period"
            value={years}
            onChange={setYears}
            options={periodOptions}
          />
          <NumberInput
            label="Current gas price"
            value={gasPrice}
            onChange={setGasPrice}
            min={1}
            max={10}
            step={0.1}
            unit="$/gal"
          />
          <NumberInput
            label="Gas car MPG"
            value={gasMpg}
            onChange={setGasMpg}
            min={10}
            max={60}
            step={1}
            unit="MPG"
            helpText="Average US car: 28 MPG"
          />
          <NumberInput
            label="Hybrid MPG"
            value={hybridMpg}
            onChange={setHybridMpg}
            min={30}
            max={80}
            step={1}
            unit="MPG"
            helpText="Average hybrid: 50 MPG"
          />
        </div>
      </details>

      {/* Signature split-column live meter: HYBRID vs EV annual */}
      <SavingsMeter
        leftLabel="HYBRID"
        leftValue={results.hybridAnnualCost}
        rightLabel="EV"
        rightValue={results.evAnnualCost}
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Three-way breakdown</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <SavingsTile
          label="GAS ANNUAL"
          value={results.gasAnnualCost}
          prefix="$"
          unit="/yr"
          tier="warn"
          animate
        />
        <SavingsTile
          label="HYBRID ANNUAL"
          value={results.hybridAnnualCost}
          prefix="$"
          unit="/yr"
          tier="volt"
          animate
        />
        <SavingsTile
          label="EV ANNUAL"
          value={results.evAnnualCost}
          prefix="$"
          unit="/yr"
          tier="good"
          animate
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SavingsTile
          label={`EV SAVES vs GAS (${periodYears}yr)`}
          value={Math.max(0, results.evVsGasSavings * periodYears)}
          prefix="$"
          unit=" total"
          tier="good"
          animate
        />
        <SavingsTile
          label={`EV SAVES vs HYBRID (${periodYears}yr)`}
          value={Math.max(0, results.evVsHybridSavings * periodYears)}
          prefix="$"
          unit=" total"
          tier="brand"
          animate
        />
        <SavingsTile
          label="CO2 CUT vs GAS"
          value={Math.round(results.evCO2SavingsVsGas)}
          unit=" lbs/yr"
          tier="good"
          animate
        />
        <SavingsTile
          label="TREES EQUIVALENT"
          value={Math.round(results.equivalentTrees)}
          unit=" trees/yr"
          tier="good"
          animate
        />
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Detailed gas vs electric comparison
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate your exact charging cost
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check your EV tax credits
        </Link>
      </div>

      <EducationalContent>
        <h2>How the EV vs hybrid vs gas comparison works</h2>
        <p>
          This calculator computes per-mile fuel costs for three drivetrains
          simultaneously. For the EV, we use the EPA efficiency rating in
          kWh/100 miles multiplied by your local electricity rate. For the hybrid
          and gas vehicles, we divide the gas price by each vehicle&apos;s MPG
          rating. CO2 emissions use the EPA standard of 8,887 grams per gallon
          of gasoline and 0.86 lbs of CO2 per kWh of grid electricity (the U.S.
          average).
        </p>
        <h3>Where hybrids fit in</h3>
        <p>
          Hybrids occupy the middle ground between gas and electric. A typical
          hybrid achieves 45 to 60 MPG by combining a small gas engine with an
          electric motor and regenerative braking. This nearly doubles the fuel
          efficiency of a standard gas car without requiring any charging
          infrastructure. However, hybrids still burn gasoline, so their fuel
          costs and emissions remain higher than a fully electric vehicle.
        </p>
        <h3>Total cost of ownership factors not shown</h3>
        <ul>
          <li>
            Purchase price: EVs have a higher MSRP but federal tax credits up to
            $7,500 can close the gap. Hybrids are typically priced between gas
            and EV models.
          </li>
          <li>
            Maintenance: EVs have the lowest maintenance costs (no oil changes,
            fewer brake replacements). Hybrids save somewhat on brakes but still
            need oil changes. Gas cars have the highest ongoing maintenance.
          </li>
          <li>
            Insurance: EV insurance runs 10 to 15% higher than gas or hybrid due to
            higher repair costs for battery and electronics.
          </li>
          <li>
            Resale value: EVs are depreciating faster than hybrids in the
            current market, though this gap is narrowing as battery technology
            improves.
          </li>
        </ul>
        <h3>Choosing the right drivetrain</h3>
        <p>
          If you have home charging access and drive under 250 miles per day, an
          EV will save you the most money on fuel. If you regularly take long
          road trips or lack charging access, a hybrid offers significant savings
          over gas with zero charging requirements. Gas vehicles make the most
          financial sense only when purchase price is the primary concern and
          annual mileage is low.
        </p>
      </EducationalContent>

      <FAQSection questions={evVsHybridFAQ} />
      <EmailCapture source="ev-vs-hybrid" />
      <RelatedCalculators currentPath="/ev-vs-hybrid" />
    </CalculatorShell>
  );
}
