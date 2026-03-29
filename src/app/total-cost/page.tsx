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

const tcoFAQ = [
  {
    question: "What costs are included in the total cost of ownership?",
    answer:
      "This calculator includes the four biggest ownership costs: purchase price, fuel (electricity or gasoline), insurance, and maintenance. It does not include depreciation, financing/interest, registration fees, or parking costs, which vary too widely to estimate accurately.",
  },
  {
    question: "Why are EV maintenance costs lower than gas cars?",
    answer:
      "EVs have fewer moving parts, no oil changes, no transmission fluid, and regenerative braking that reduces brake pad wear. The average EV owner spends roughly 40-60% less on maintenance per year compared to a gas car owner, according to AAA and Consumer Reports data.",
  },
  {
    question: "How accurate is the breakeven year estimate?",
    answer:
      "The breakeven calculation assumes constant fuel prices, electricity rates, and maintenance costs over the ownership period. In reality, gas prices fluctuate more than electricity rates, and EV battery degradation can slightly increase energy costs over time. The estimate is a useful starting point, not a guarantee.",
  },
  {
    question: "Does this calculator account for federal or state tax credits?",
    answer:
      "No. Tax credits can reduce the effective purchase price of an EV by $2,500 to $7,500 depending on the vehicle and your tax situation. To factor in credits, subtract the credit amount from the EV purchase price input. Use our Tax Credit Estimator for details.",
  },
  {
    question: "Should I include my trade-in or down payment in the purchase price?",
    answer:
      "Enter the total purchase price before trade-in or down payment. This calculator compares the full ownership cost of each vehicle. Financing terms and trade-in values affect your monthly payment but not the total cost of the vehicle itself.",
  },
];

export default function TotalCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [evPrice, setEvPrice] = useState(35000);
  const [gasPrice, setGasPrice] = useState(30000);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [ownershipYears, setOwnershipYears] = useState(5);
  const [gasFuelPrice, setGasFuelPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);
  const [insuranceEv, setInsuranceEv] = useState(1800);
  const [insuranceGas, setInsuranceGas] = useState(1500);
  const [maintenanceEv, setMaintenanceEv] = useState(400);
  const [maintenanceGas, setMaintenanceGas] = useState(900);

  // Auto-detect state from timezone on first visit
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  // Sync state to/from URL for shareable links
  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: dailyMiles,
      years: ownershipYears,
      evPx: evPrice,
      gasPx: gasPrice,
      gasFuel: gasFuelPrice,
      mpg: gasMpg,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.years) setOwnershipYears(Number(p.years));
      if (p.evPx) setEvPrice(Number(p.evPx));
      if (p.gasPx) setGasPrice(Number(p.gasPx));
      if (p.gasFuel) setGasFuelPrice(Number(p.gasFuel));
      if (p.mpg) setGasMpg(Number(p.mpg));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;

    // EV fuel cost per year
    const evKwhPerMile = vehicle.kwhPer100Miles / 100;
    const evAnnualFuel = annualMiles * evKwhPerMile * rate;

    // Gas fuel cost per year
    const gasAnnualFuel = (annualMiles / gasMpg) * gasFuelPrice;

    // Totals over ownership period
    const evTotalFuel = evAnnualFuel * ownershipYears;
    const gasTotalFuel = gasAnnualFuel * ownershipYears;
    const evTotalInsurance = insuranceEv * ownershipYears;
    const gasTotalInsurance = insuranceGas * ownershipYears;
    const evTotalMaintenance = maintenanceEv * ownershipYears;
    const gasTotalMaintenance = maintenanceGas * ownershipYears;

    const evTotal = evPrice + evTotalFuel + evTotalInsurance + evTotalMaintenance;
    const gasTotal = gasPrice + gasTotalFuel + gasTotalInsurance + gasTotalMaintenance;

    const totalSavings = gasTotal - evTotal;

    // Cost per mile (total)
    const totalMiles = annualMiles * ownershipYears;
    const evCostPerMile = totalMiles > 0 ? evTotal / totalMiles : 0;
    const gasCostPerMile = totalMiles > 0 ? gasTotal / totalMiles : 0;

    // Breakeven calculation: which year does cumulative EV cost drop below gas?
    // Yearly running costs difference (gas minus EV)
    const evAnnualRunning = evAnnualFuel + insuranceEv + maintenanceEv;
    const gasAnnualRunning = gasAnnualFuel + insuranceGas + maintenanceGas;
    const annualSavings = gasAnnualRunning - evAnnualRunning;

    let breakevenYear: number | null = null;
    const priceDiff = evPrice - gasPrice; // upfront premium for EV

    if (annualSavings > 0 && priceDiff > 0) {
      // EV costs more upfront but saves each year
      const rawBreakeven = priceDiff / annualSavings;
      breakevenYear = Math.ceil(rawBreakeven * 10) / 10; // round to 1 decimal
    } else if (priceDiff <= 0) {
      // EV is cheaper upfront, breakeven is immediate
      breakevenYear = 0;
    }
    // If annualSavings <= 0 and EV is more expensive, EV never breaks even -> null

    // Year-by-year breakdown
    const yearlyBreakdown: {
      year: number;
      evCumulative: number;
      gasCumulative: number;
      savings: number;
    }[] = [];
    for (let y = 1; y <= ownershipYears; y++) {
      const evCum = evPrice + (evAnnualFuel + insuranceEv + maintenanceEv) * y;
      const gasCum = gasPrice + (gasAnnualFuel + insuranceGas + maintenanceGas) * y;
      yearlyBreakdown.push({
        year: y,
        evCumulative: evCum,
        gasCumulative: gasCum,
        savings: gasCum - evCum,
      });
    }

    return {
      evTotal,
      gasTotal,
      totalSavings,
      evCostPerMile,
      gasCostPerMile,
      breakevenYear,
      evAnnualFuel,
      gasAnnualFuel,
      yearlyBreakdown,
      annualSavings,
    };
  }, [
    dailyMiles,
    vehicle,
    rate,
    gasMpg,
    gasFuelPrice,
    ownershipYears,
    evPrice,
    gasPrice,
    insuranceEv,
    insuranceGas,
    maintenanceEv,
    maintenanceGas,
  ]);

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

  const evBarWidth = Math.min(
    100,
    (results.evTotal / Math.max(results.evTotal, results.gasTotal)) * 100
  );
  const gasBarWidth = Math.min(
    100,
    (results.gasTotal / Math.max(results.evTotal, results.gasTotal)) * 100
  );

  return (
    <CalculatorLayout
      title="EV vs Gas Total Cost of Ownership Calculator"
      description="Compare the full cost of owning an EV versus a gas car over time, including purchase price, fuel, insurance, and maintenance."
      lastUpdated="March 2026"
      intro="The sticker price is only part of the story. When you factor in fuel savings, lower maintenance, and insurance differences, an EV can cost thousands less over a typical ownership period. This calculator breaks down every major cost category so you can see the real numbers side by side."
    >
      <CalculatorSchema
        name="EV vs Gas Total Cost of Ownership Calculator"
        description="Compare total ownership costs of an EV versus a gas car over 1-10 years. Includes purchase price, fuel, insurance, and maintenance with a breakeven analysis."
        url="https://chargemath.com/total-cost"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Total Cost of Ownership Calculator", url: "https://chargemath.com/total-cost" },
        ]}
      />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.kwhPer100Miles} kWh/100mi \u2022 ${vehicle.epaRangeMiles} mi EPA range`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText="Used for your electricity rate"
        />

        <NumberInput
          label="EV Purchase Price"
          value={evPrice}
          onChange={setEvPrice}
          min={10000}
          max={200000}
          step={500}
          unit="$"
          helpText="Total price before trade-in"
        />

        <NumberInput
          label="Gas Car Purchase Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={10000}
          max={200000}
          step={500}
          unit="$"
          helpText="Total price before trade-in"
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
            label="Ownership Period"
            value={ownershipYears}
            onChange={setOwnershipYears}
            min={1}
            max={10}
            step={1}
            unit="years"
            showValue
          />
        </div>

        <NumberInput
          label="Gas Price"
          value={gasFuelPrice}
          onChange={setGasFuelPrice}
          min={1}
          max={10}
          step={0.1}
          unit="$/gal"
          helpText="Current price per gallon"
        />

        <NumberInput
          label="Gas Car MPG"
          value={gasMpg}
          onChange={setGasMpg}
          min={10}
          max={60}
          step={1}
          unit="MPG"
          helpText="Combined city/highway rating"
        />

        <NumberInput
          label="Annual Insurance (EV)"
          value={insuranceEv}
          onChange={setInsuranceEv}
          min={0}
          max={10000}
          step={50}
          unit="$/year"
          helpText="EV insurance tends to be higher"
        />

        <NumberInput
          label="Annual Insurance (Gas)"
          value={insuranceGas}
          onChange={setInsuranceGas}
          min={0}
          max={10000}
          step={50}
          unit="$/year"
          helpText="Average annual premium"
        />

        <NumberInput
          label="Annual Maintenance (EV)"
          value={maintenanceEv}
          onChange={setMaintenanceEv}
          min={0}
          max={5000}
          step={50}
          unit="$/year"
          helpText="Tires, wipers, cabin filter, brakes"
        />

        <NumberInput
          label="Annual Maintenance (Gas)"
          value={maintenanceGas}
          onChange={setMaintenanceGas}
          min={0}
          max={5000}
          step={50}
          unit="$/year"
          helpText="Oil changes, brakes, belts, fluids"
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          {ownershipYears}-Year Ownership Cost Comparison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="EV Total Cost"
            value={fmtShort.format(results.evTotal)}
            unit={`over ${ownershipYears} years`}
            highlight={results.totalSavings > 0}
            icon="⚡"
          />
          <ResultCard
            label="Gas Car Total Cost"
            value={fmtShort.format(results.gasTotal)}
            unit={`over ${ownershipYears} years`}
            highlight={results.totalSavings < 0}
            icon="⛽"
          />
          <ResultCard
            label={results.totalSavings >= 0 ? "EV Savings" : "Gas Savings"}
            value={fmtShort.format(Math.abs(results.totalSavings))}
            unit={`over ${ownershipYears} years`}
            highlight
            icon="💰"
          />
          <ResultCard
            label="EV Cost Per Mile"
            value={`$${results.evCostPerMile.toFixed(3)}`}
            unit="/mile (total)"
            icon="🔋"
          />
          <ResultCard
            label="Gas Cost Per Mile"
            value={`$${results.gasCostPerMile.toFixed(3)}`}
            unit="/mile (total)"
            icon="⛽"
          />
          <ResultCard
            label="Breakeven Point"
            value={
              results.breakevenYear === null
                ? "Never"
                : results.breakevenYear === 0
                  ? "Day 1"
                  : `Year ${results.breakevenYear}`
            }
            unit={
              results.breakevenYear === null
                ? "Gas stays cheaper"
                : results.breakevenYear === 0
                  ? "EV is cheaper from the start"
                  : "when EV becomes cheaper"
            }
            highlight={results.breakevenYear !== null}
            icon="📍"
          />
        </div>

        {/* Total Cost Comparison Bar */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Total Cost Comparison ({ownershipYears} Years)
          </h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-ev-green)]">
                  EV (Electric)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmtShort.format(results.evTotal)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-ev-green)] transition-all duration-500"
                  style={{ width: `${evBarWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-gas-red)]">
                  Gas Car
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmtShort.format(results.gasTotal)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-gas-red)] transition-all duration-500"
                  style={{ width: `${gasBarWidth}%` }}
                />
              </div>
            </div>
          </div>
          {results.totalSavings > 0 ? (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--color-ev-green)]">
              The EV saves you {fmtShort.format(results.totalSavings)} over {ownershipYears} years
            </p>
          ) : results.totalSavings < 0 ? (
            <p className="mt-4 text-center text-sm font-semibold text-amber-600">
              The gas car saves you {fmtShort.format(Math.abs(results.totalSavings))} over {ownershipYears} years
            </p>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--color-text-muted)]">
              Both options cost the same over {ownershipYears} years
            </p>
          )}
        </div>

        {/* Year-by-Year Breakdown */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Year-by-Year Cumulative Cost
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-4 text-left font-semibold text-[var(--color-text-muted)]">Year</th>
                  <th className="py-2 pr-4 text-right font-semibold text-[var(--color-ev-green)]">EV Total</th>
                  <th className="py-2 pr-4 text-right font-semibold text-[var(--color-gas-red)]">Gas Total</th>
                  <th className="py-2 text-right font-semibold text-[var(--color-text-muted)]">EV Savings</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((row) => (
                  <tr
                    key={row.year}
                    className="border-b border-[var(--color-border)]/50"
                  >
                    <td className="py-2 pr-4 font-medium text-[var(--color-text)]">
                      Year {row.year}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-text)]">
                      {fmtShort.format(row.evCumulative)}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-text)]">
                      {fmtShort.format(row.gasCumulative)}
                    </td>
                    <td
                      className={`py-2 text-right tabular-nums font-semibold ${
                        row.savings > 0
                          ? "text-[var(--color-ev-green)]"
                          : row.savings < 0
                            ? "text-[var(--color-gas-red)]"
                            : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {row.savings >= 0 ? "+" : ""}
                      {fmtShort.format(row.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate your charging cost in detail →
          </Link>
          <Link
            href="/tax-credits"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Check available EV tax credits →
          </Link>
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Side-by-side fuel cost comparison →
          </Link>
        </div>

        <ShareResults
          title={`EV vs Gas TCO: ${fmtShort.format(Math.abs(results.totalSavings))} ${results.totalSavings >= 0 ? "saved" : "more"} with ${results.totalSavings >= 0 ? "EV" : "gas"}`}
          text={`Over ${ownershipYears} years, a ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmtShort.format(results.evTotal)} total vs ${fmtShort.format(results.gasTotal)} for a gas car. That's ${fmtShort.format(Math.abs(results.totalSavings))} in ${results.totalSavings >= 0 ? "EV savings" : "extra cost"}!`}
        />
      </div>

      <EducationalContent>
        <h2>How We Calculate Total Cost of Ownership</h2>
        <p>
          This calculator adds up four major cost categories for each vehicle over your chosen ownership period: purchase price, fuel (electricity for the EV, gasoline for the gas car), insurance, and maintenance. The sum gives you a realistic picture of what each vehicle actually costs to own, not just buy.
        </p>
        <h3>Fuel Cost Methodology</h3>
        <p>
          EV fuel costs are calculated using the EPA-rated efficiency of your selected vehicle (kWh per 100 miles) multiplied by your state&apos;s residential electricity rate from the EIA. Gas fuel costs use the price per gallon you enter divided by the gas car&apos;s MPG rating. Both assume consistent daily driving across the full ownership period.
        </p>
        <h3>Why Maintenance Differs So Much</h3>
        <p>
          EVs have far fewer wear parts than gas cars. There is no engine oil to change, no transmission fluid, no timing belt, no spark plugs, and no exhaust system. Regenerative braking significantly extends brake pad life. Consumer Reports and AAA studies consistently find EV maintenance costs 40-60% lower than comparable gas vehicles over the first 10 years of ownership.
        </p>
        <h3>Factors Not Included</h3>
        <ul>
          <li>Depreciation and resale value vary widely by make, model, and market conditions.</li>
          <li>Financing costs (interest) depend on your credit score, loan term, and down payment.</li>
          <li>Tax credits and rebates can reduce the EV&apos;s effective purchase price by $2,500 to $7,500.</li>
          <li>Tire costs are slightly higher for EVs due to added weight, but the difference is modest ($50-100/year).</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={tcoFAQ} />
      <EmailCapture source="total-cost" />
      <RelatedCalculators currentPath="/total-cost" />
    </CalculatorLayout>
  );
}
