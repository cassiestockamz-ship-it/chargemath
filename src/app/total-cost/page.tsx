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

  const evWins = results.totalSavings >= 0;
  const heroAmount = Math.abs(results.totalSavings);
  const dialPercent =
    results.gasTotal > 0
      ? Math.max(0, Math.min(100, (results.totalSavings / results.gasTotal) * 100))
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

  const hero = (
    <SavingsVerdict
      headline={evWins ? "EV SAVES" : "GAS SAVES"}
      amount={heroAmount}
      amountUnit={` over ${ownershipYears} yrs`}
      sub={
        <>
          Total cost of ownership for a {vehicle.year} {vehicle.make} {vehicle.model} vs a
          comparable gas car. Includes purchase price, fuel, insurance, and maintenance.
        </>
      }
      dialPercent={Math.max(0, dialPercent)}
      dialLabel="TCO CUT"
    >
      <SavingsTile
        label={`${ownershipYears} YEAR TOTAL`}
        value={results.evTotal}
        prefix="$"
        unit=" EV"
        tier="brand"
        animate
      />
      <SavingsTile
        label="PER YEAR"
        value={results.evTotal / ownershipYears}
        prefix="$"
        unit="/yr"
        tier="volt"
        animate
      />
      <SavingsTile
        label="PER MILE"
        value={results.evCostPerMile}
        prefix="$"
        decimals={3}
        unit=" EV"
        tier="good"
        compareBars={[
          { label: "GAS", value: results.gasCostPerMile, color: "var(--color-warn)" },
          { label: "EV", value: results.evCostPerMile, color: "var(--color-teal)" },
        ]}
      />
      <SavingsTile
        label="BREAKEVEN"
        value={
          results.breakevenYear === null
            ? 0
            : results.breakevenYear === 0
              ? 0
              : results.breakevenYear
        }
        decimals={1}
        unit={
          results.breakevenYear === null
            ? " never"
            : results.breakevenYear === 0
              ? " day 1"
              : " years"
        }
        tier={results.breakevenYear === null ? "warn" : "good"}
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Total cost of ownership"
      title="EV vs Gas Total Cost"
      quickAnswer="An average EV saves $5,000 to $12,000 over 5 years vs a comparable gas car, once fuel, insurance, and maintenance are counted."
      inputs={inputs}
      hero={hero}
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

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="EV purchase price"
            value={evPrice}
            onChange={setEvPrice}
            min={10000}
            max={200000}
            step={500}
            unit="$"
            helpText="Total price before trade-in"
          />
          <NumberInput
            label="Gas car purchase price"
            value={gasPrice}
            onChange={setGasPrice}
            min={10000}
            max={200000}
            step={500}
            unit="$"
            helpText="Total price before trade-in"
          />
          <SliderInput
            label="Ownership period"
            value={ownershipYears}
            onChange={setOwnershipYears}
            min={1}
            max={10}
            step={1}
            unit="years"
            showValue
          />
          <NumberInput
            label="Gas price"
            value={gasFuelPrice}
            onChange={setGasFuelPrice}
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
            label="Annual insurance (EV)"
            value={insuranceEv}
            onChange={setInsuranceEv}
            min={0}
            max={10000}
            step={50}
            unit="$/yr"
          />
          <NumberInput
            label="Annual insurance (gas)"
            value={insuranceGas}
            onChange={setInsuranceGas}
            min={0}
            max={10000}
            step={50}
            unit="$/yr"
          />
          <NumberInput
            label="Annual maintenance (EV)"
            value={maintenanceEv}
            onChange={setMaintenanceEv}
            min={0}
            max={5000}
            step={50}
            unit="$/yr"
          />
          <NumberInput
            label="Annual maintenance (gas)"
            value={maintenanceGas}
            onChange={setMaintenanceGas}
            min={0}
            max={5000}
            step={50}
            unit="$/yr"
          />
        </div>
      </details>

      {/* Signature split-column live meter: GAS vs EV total */}
      <SavingsMeter
        leftLabel="GAS TOTAL"
        leftValue={results.gasTotal}
        rightLabel="EV TOTAL"
        rightValue={results.evTotal}
        period={`/${ownershipYears}yr`}
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Year by year</h2>
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-2 pr-4 text-left font-semibold text-[var(--color-ink-3)]">Year</th>
              <th className="py-2 pr-4 text-right font-semibold text-[var(--color-brand)]">EV total</th>
              <th className="py-2 pr-4 text-right font-semibold text-[var(--color-warn-ink)]">Gas total</th>
              <th className="py-2 text-right font-semibold text-[var(--color-ink-3)]">EV savings</th>
            </tr>
          </thead>
          <tbody>
            {results.yearlyBreakdown.map((row) => (
              <tr
                key={row.year}
                className="border-b border-[var(--color-border)]/50"
              >
                <td className="py-2 pr-4 font-medium text-[var(--color-ink)]">
                  Year {row.year}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-ink)]">
                  {fmtShort.format(row.evCumulative)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-ink)]">
                  {fmtShort.format(row.gasCumulative)}
                </td>
                <td
                  className={`py-2 text-right tabular-nums font-semibold ${
                    row.savings > 0
                      ? "text-[var(--color-good-ink)]"
                      : row.savings < 0
                        ? "text-[var(--color-warn-ink)]"
                        : "text-[var(--color-ink-3)]"
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

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate your charging cost in detail
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check available EV tax credits
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Side by side fuel cost comparison
        </Link>
      </div>

      <EducationalContent>
        <h2>How we calculate total cost of ownership</h2>
        <p>
          This calculator adds up four major cost categories for each vehicle over your chosen ownership period: purchase price, fuel (electricity for the EV, gasoline for the gas car), insurance, and maintenance. The sum gives you a realistic picture of what each vehicle actually costs to own, not just buy.
        </p>
        <h3>Fuel cost methodology</h3>
        <p>
          EV fuel costs are calculated using the EPA-rated efficiency of your selected vehicle (kWh per 100 miles) multiplied by your state&apos;s residential electricity rate from the EIA. Gas fuel costs use the price per gallon you enter divided by the gas car&apos;s MPG rating. Both assume consistent daily driving across the full ownership period.
        </p>
        <h3>Why maintenance differs so much</h3>
        <p>
          EVs have far fewer wear parts than gas cars. There is no engine oil to change, no transmission fluid, no timing belt, no spark plugs, and no exhaust system. Regenerative braking significantly extends brake pad life. Consumer Reports and AAA studies consistently find EV maintenance costs 40-60% lower than comparable gas vehicles over the first 10 years of ownership.
        </p>
        <h3>Factors not included</h3>
        <ul>
          <li>Depreciation and resale value vary widely by make, model, and market conditions.</li>
          <li>Financing costs (interest) depend on your credit score, loan term, and down payment.</li>
          <li>Tax credits and rebates can reduce the EV&apos;s effective purchase price by $2,500 to $7,500.</li>
          <li>Tire costs are slightly higher for EVs due to added weight, but the difference is modest ($50 to $100 per year).</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={tcoFAQ} />
      <EmailCapture source="total-cost" />
      <RelatedCalculators currentPath="/total-cost" />
    </CalculatorShell>
  );
}
