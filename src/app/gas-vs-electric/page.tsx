"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsMeter from "@/components/SavingsMeter";
import SavingsTile from "@/components/SavingsTile";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { gasVsElectricFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const CO2_GRAMS_PER_GALLON = 8887;
const CO2_LBS_PER_KWH = 0.86;
const LBS_CO2_PER_TREE_PER_YEAR = 48;

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function GasVsElectricPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);
  const [years, setYears] = useState("5");

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, gas: gasPrice, mpg: gasMpg, years },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.gas) setGasPrice(Number(p.gas));
      if (p.mpg) setGasMpg(Number(p.mpg));
      if (p.years) setYears(p.years);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    return (ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const periodYears = Number(years);

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;

    const evAnnualCost = annualKwh * rate;
    const gasAnnualCost = (annualMiles / gasMpg) * gasPrice;
    const annualSavings = gasAnnualCost - evAnnualCost;
    const totalSavings = annualSavings * periodYears;

    const evCostPerMile = rate * (vehicle.kwhPer100Miles / 100);
    const gasCostPerMile = gasPrice / gasMpg;

    // CO2 calculations
    const gasGallonsPerYear = annualMiles / gasMpg;
    const gasCO2LbsPerYear = (gasGallonsPerYear * CO2_GRAMS_PER_GALLON) / 453.592;
    const evCO2LbsPerYear = annualKwh * CO2_LBS_PER_KWH;
    const co2SavingsLbsPerYear = gasCO2LbsPerYear - evCO2LbsPerYear;
    const equivalentTrees = co2SavingsLbsPerYear / LBS_CO2_PER_TREE_PER_YEAR;

    return {
      annualMiles,
      evAnnualCost,
      gasAnnualCost,
      annualSavings,
      totalSavings,
      evCostPerMile,
      gasCostPerMile,
      gasCO2LbsPerYear,
      evCO2LbsPerYear,
      co2SavingsLbsPerYear,
      equivalentTrees,
    };
  }, [dailyMiles, vehicle, rate, gasMpg, gasPrice, periodYears]);

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

  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? stateCode;
  const dialPercent =
    results.gasAnnualCost > 0
      ? Math.max(0, Math.min(100, (results.annualSavings / results.gasAnnualCost) * 100))
      : 0;

  // Compact primary input strip (3 inputs: vehicle, state, daily miles)
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

  // The hero: one-screen SavingsVerdict with 4 SavingsTile children
  const hero = (
    <SavingsVerdict
      headline="YOU SAVE"
      amount={Math.max(0, results.annualSavings)}
      amountUnit="/year"
      sub={
        <>
          On fuel vs a {gasMpg} MPG gas car in {stateName}. Over {periodYears} years
          that adds up to {fmtWhole.format(Math.max(0, results.totalSavings))}.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="FUEL CUT"
    >
      <SavingsTile
        label="ANNUAL SAVINGS"
        value={Math.max(0, results.annualSavings)}
        prefix="$"
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="COST PER MILE"
        value={results.evCostPerMile}
        prefix="$"
        decimals={3}
        unit="EV"
        tier="brand"
        compareBars={[
          { label: "GAS", value: results.gasCostPerMile, color: "var(--color-warn)" },
          { label: "EV", value: results.evCostPerMile, color: "var(--color-teal)" },
        ]}
      />
      <SavingsTile
        label="5 YEAR SAVINGS"
        value={Math.max(0, results.annualSavings * 5)}
        prefix="$"
        unit=" total"
        tier="volt"
        animate
      />
      <SavingsTile
        label="CO2 CUT"
        value={Math.round(results.co2SavingsLbsPerYear)}
        unit=" lbs/yr"
        tier="good"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Cost comparison"
      title="Gas vs Electric"
      quickAnswer="EV fuel costs run 60-70% below gas. Typical savings: $800 to $1,200 per year."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="Gas vs Electric Cost Comparison"
        description="Compare the true fuel costs of driving electric vs gas with side-by-side savings and CO2 analysis."
        url="https://chargemath.com/gas-vs-electric"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Gas vs Electric Comparison", url: "https://chargemath.com/gas-vs-electric" },
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
            label="Current gas car MPG"
            value={gasMpg}
            onChange={setGasMpg}
            min={10}
            max={60}
            step={1}
            unit="MPG"
            helpText="Average US car: 28 MPG"
          />
        </div>
      </details>

      {/* Signature split-column live meter */}
      <SavingsMeter
        leftLabel="GAS"
        leftValue={results.gasAnnualCost}
        rightLabel="EV"
        rightValue={results.evAnnualCost}
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Cost breakdown</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SavingsTile
          label={`${periodYears} YEAR EV COST`}
          value={Math.round(results.evAnnualCost * periodYears)}
          prefix="$"
          unit=" fuel"
          tier="brand"
        />
        <SavingsTile
          label={`${periodYears} YEAR GAS COST`}
          value={Math.round(results.gasAnnualCost * periodYears)}
          prefix="$"
          unit=" fuel"
          tier="warn"
        />
        <SavingsTile
          label="GAS CO2/YEAR"
          value={Math.round(results.gasCO2LbsPerYear)}
          unit=" lbs"
          tier="warn"
        />
        <SavingsTile
          label="TREES EQUIVALENT"
          value={Math.round(results.equivalentTrees)}
          unit=" trees/yr"
          tier="good"
        />
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate your exact charging cost
        </Link>
        <Link
          href="/charger-roi"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate home charger ROI
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check your EV tax credits
        </Link>
      </div>

      <ShareResults
        title={`Gas vs Electric: Save ${fmtWhole.format(results.annualSavings)}/year`}
        text={`Switching from gas to electric saves me ${fmtWhole.format(results.annualSavings)}/year on fuel. My ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.evCostPerMile)}/mile vs ${fmt.format(results.gasCostPerMile)}/mile for gas. That adds up to ${fmtWhole.format(results.totalSavings)} in total savings over ${periodYears} years.`}
      />

      <EducationalContent>
        <h2>How the Gas vs Electric Comparison Works</h2>
        <p>
          We calculate the per-mile fuel cost for both drivetrains using real data: your EV&apos;s EPA efficiency rating in kWh/100 miles multiplied by your local electricity rate, versus your gas car&apos;s MPG rating divided into the current gas price. CO2 emissions use the EPA&apos;s standard of 8,887 grams per gallon of gasoline and 0.86 lbs of CO2 per kWh of electricity (the U.S. grid average).
        </p>
        <h3>Why EV Fuel Costs Are Lower</h3>
        <p>
          Electric motors convert 85 to 90% of electrical energy into motion, while internal combustion engines convert only 20 to 35% of gasoline energy. This efficiency gap means EVs travel 3 to 4 miles per kWh equivalent, compared to gas cars at roughly 1 mile per kWh equivalent. Home electricity at 12 to 16 cents per kWh is also far cheaper per unit of energy than gasoline.
        </p>
        <h3>What This Comparison Does Not Include</h3>
        <ul>
          <li>Maintenance savings: EVs have no oil changes, fewer brake replacements thanks to regenerative braking, and no transmission service. This adds $500 to $1,000 per year in savings.</li>
          <li>Purchase price difference: the upfront cost gap is narrowing, and tax credits can close it further.</li>
          <li>Insurance differences: EV insurance typically costs 10 to 15% more due to higher repair costs.</li>
          <li>Battery degradation: most EV batteries retain 90% or more capacity after 200,000 miles, but replacement costs $5,000 to $15,000 if needed.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={gasVsElectricFAQ} />
      <EmailCapture source="gas-vs-electric" />
      <RelatedCalculators currentPath="/gas-vs-electric" />
    </CalculatorShell>
  );
}
