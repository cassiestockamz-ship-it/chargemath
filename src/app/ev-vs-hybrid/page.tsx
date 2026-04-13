"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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

const fmtNum = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

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

  return (
    <CalculatorLayout
      title="EV vs Hybrid vs Gas Cost Comparison"
      description="Compare fuel costs across all three drivetrains side by side, and find the best option for your budget and driving habits."
      lastUpdated="March 2026"
      intro="Choosing between an EV, hybrid, and gas car? This calculator compares fuel costs, cost per mile, and CO2 emissions for all three options using your actual driving habits and local energy prices. EVs are cheapest to fuel, hybrids split the difference, and gas cars cost the most per mile."
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select an EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.kwhPer100Miles} kWh/100mi \u2022 ${vehicle.epaRangeMiles} mi range`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
        />

        <NumberInput
          label="Custom Electricity Rate (optional)"
          value={customRate ?? 0}
          onChange={(v) => setCustomRate(v > 0 ? v : null)}
          min={0}
          max={100}
          step={0.1}
          unit={"¢/kWh"}
          helpText="Leave at 0 to use state average"
        />

        <SelectInput
          label="Comparison Period"
          value={years}
          onChange={setYears}
          options={periodOptions}
        />

        <NumberInput
          label="Current Gas Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={10}
          step={0.1}
          unit="$/gal"
        />

        <NumberInput
          label="Gas Car MPG"
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
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Cost Comparison
        </h2>

        {/* Three columns side-by-side */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* EV Column */}
          <div className="rounded-xl border-2 border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--color-ev-green)]">
              <span>🔋</span> Electric (EV)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Monthly Fuel
                </span>
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {fmt.format(results.evMonthlyCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Annual Fuel
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmt.format(results.evAnnualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Cost Per Mile
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  ${results.evCostPerMile.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  CO2/Year
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtNum.format(results.evCO2LbsPerYear)} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {periodYears}-Year Total
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtWhole.format(results.evTotalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Hybrid Column */}
          <div className="rounded-xl border-2 border-blue-500/30 bg-blue-500/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-blue-600 dark:text-blue-400">
              <span>🔄</span> Hybrid
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Monthly Fuel
                </span>
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {fmt.format(results.hybridMonthlyCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Annual Fuel
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmt.format(results.hybridAnnualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Cost Per Mile
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  ${results.hybridCostPerMile.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  CO2/Year
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtNum.format(results.hybridCO2LbsPerYear)} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {periodYears}-Year Total
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtWhole.format(results.hybridTotalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Gas Column */}
          <div className="rounded-xl border-2 border-[var(--color-gas-red)]/30 bg-[var(--color-gas-red)]/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--color-gas-red)]">
              <span>⛽</span> Gas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Monthly Fuel
                </span>
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {fmt.format(results.gasMonthlyCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Annual Fuel
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmt.format(results.gasAnnualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Cost Per Mile
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  ${results.gasCostPerMile.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  CO2/Year
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtNum.format(results.gasCO2LbsPerYear)} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {periodYears}-Year Total
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtWhole.format(results.gasTotalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label={`EV Savings vs Gas (${periodYears} yr)`}
            value={fmtWhole.format(results.evVsGasSavings * periodYears)}
            unit="saved"
            highlight
            icon="💰"
          />
          <ResultCard
            label={`EV Savings vs Hybrid (${periodYears} yr)`}
            value={fmtWhole.format(results.evVsHybridSavings * periodYears)}
            unit="saved"
            highlight
            icon="📅"
          />
          <ResultCard
            label="CO2 Savings (EV vs Gas)"
            value={fmtNum.format(results.evCO2SavingsVsGas)}
            unit="lbs/year"
            icon="🌍"
          />
          <ResultCard
            label="Equivalent Trees Planted"
            value={fmtNum.format(results.equivalentTrees)}
            unit="trees/year"
            icon="🌳"
          />
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Detailed gas vs electric comparison &rarr;
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Calculate your exact charging cost &rarr;
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Check your EV tax credits &rarr;
        </Link>
      </div>

      <ShareResults
        title={`EV vs Hybrid vs Gas: Save ${fmtWhole.format(results.evVsGasSavings)}/year with an EV`}
        text={`Comparing fuel costs: my ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.evCostPerMile)}/mile, a hybrid at ${hybridMpg} MPG costs ${fmt.format(results.hybridCostPerMile)}/mile, and gas at ${gasMpg} MPG costs ${fmt.format(results.gasCostPerMile)}/mile. EV saves ${fmtWhole.format(results.evVsGasSavings * periodYears)} over ${periodYears} years vs gas!`}
      />

      <EducationalContent>
        <h2>How the EV vs Hybrid vs Gas Comparison Works</h2>
        <p>
          This calculator computes per-mile fuel costs for three drivetrains
          simultaneously. For the EV, we use the EPA efficiency rating in
          kWh/100 miles multiplied by your local electricity rate. For the hybrid
          and gas vehicles, we divide the gas price by each vehicle&apos;s MPG
          rating. CO2 emissions use the EPA standard of 8,887 grams per gallon
          of gasoline and 0.86 lbs of CO2 per kWh of grid electricity (the U.S.
          average).
        </p>
        <h3>Where Hybrids Fit In</h3>
        <p>
          Hybrids occupy the middle ground between gas and electric. A typical
          hybrid achieves 45-60 MPG by combining a small gas engine with an
          electric motor and regenerative braking. This nearly doubles the fuel
          efficiency of a standard gas car without requiring any charging
          infrastructure. However, hybrids still burn gasoline, so their fuel
          costs and emissions remain higher than a fully electric vehicle.
        </p>
        <h3>Total Cost of Ownership Factors Not Shown</h3>
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
            Insurance: EV insurance runs 10-15% higher than gas or hybrid due to
            higher repair costs for battery and electronics.
          </li>
          <li>
            Resale value: EVs are depreciating faster than hybrids in the
            current market, though this gap is narrowing as battery technology
            improves.
          </li>
        </ul>
        <h3>Choosing the Right Drivetrain</h3>
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
    </CalculatorLayout>
  );
}
