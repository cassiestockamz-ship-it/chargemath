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
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { chargingCostFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type ChargingLevel = "level1" | "level2" | "dcfast";

export default function EVChargingCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargingLevel, setChargingLevel] = useState<ChargingLevel>("level2");

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
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, level: chargingLevel },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.level && ["level1", "level2", "dcfast"].includes(p.level)) setChargingLevel(p.level as ChargingLevel);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const effectiveRate = useMemo(() => {
    if (chargingLevel === "dcfast") return rate * 2.5;
    return rate;
  }, [rate, chargingLevel]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;
    const annualKwh = dailyKwh * 365;

    const costPerFullCharge = vehicle.batteryCapacityKwh * effectiveRate;
    const monthlyCost = monthlyKwh * effectiveRate;
    const annualCost = annualKwh * effectiveRate;
    const costPerMile = effectiveRate * (vehicle.kwhPer100Miles / 100);

    // Gas comparison
    const gasMpg = 28;
    const gasPrice = 3.5;
    const gasMonthlyCost = ((dailyMiles * 30) / gasMpg) * gasPrice;
    const gasAnnualCost = gasMonthlyCost * 12;
    const gasCostPerMile = gasPrice / gasMpg;
    const monthlySavings = gasMonthlyCost - monthlyCost;
    const annualSavings = monthlySavings * 12;

    return {
      dailyKwh,
      monthlyKwh,
      annualKwh,
      costPerFullCharge,
      monthlyCost,
      annualCost,
      costPerMile,
      gasMonthlyCost,
      gasAnnualCost,
      gasCostPerMile,
      monthlySavings,
      annualSavings,
    };
  }, [dailyMiles, vehicle, effectiveRate]);

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

  const chargingLevelOptions: { value: ChargingLevel; label: string }[] = [
    { value: "level1", label: "Level 1 (120V)" },
    { value: "level2", label: "Level 2 (240V)" },
    { value: "dcfast", label: "DC Fast Charging" },
  ];

  // Dial: share of gas cost eliminated (0-100)
  const gasEliminatedPct = results.gasMonthlyCost > 0
    ? Math.max(0, Math.min(100, Math.round(((results.gasMonthlyCost - results.monthlyCost) / results.gasMonthlyCost) * 100)))
    : 0;

  const inputs = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput
          label="Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh, ${vehicle.epaRangeMiles} mi range`}
        />
        <SelectInput
          label="State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText="EIA residential rate"
        />
        <SliderInput
          label="Daily Miles"
          value={dailyMiles}
          onChange={setDailyMiles}
          min={10}
          max={150}
          step={5}
          unit="mi"
          showValue
        />
      </div>
      <details className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
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
          <div>
            <span className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Charging level
            </span>
            <div className="flex gap-2">
              {chargingLevelOptions.map((cl) => (
                <button
                  key={cl.value}
                  type="button"
                  onClick={() => setChargingLevel(cl.value)}
                  aria-pressed={chargingLevel === cl.value}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                    chargingLevel === cl.value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                  }`}
                >
                  {cl.label}
                </button>
              ))}
            </div>
            {chargingLevel === "dcfast" && (
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                DC Fast uses public station rates (about 2.5x home rates)
              </p>
            )}
          </div>
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="EV charging cost"
      headline="YOU PAY"
      amount={results.monthlyCost}
      amountUnit="/month"
      sub="Based on your state rate and driving habits, paid to your electric utility"
      dialPercent={gasEliminatedPct}
      dialLabel="VS GAS"
    >
      <>
        <SavingsTile
          label="ANNUAL COST"
          value={results.annualCost}
          prefix="$"
          unit="/yr"
          tier="brand"
        />
        <SavingsTile
          label="COST PER MILE"
          value={results.costPerMile}
          prefix="$"
          decimals={3}
          unit=" EV"
          tier="good"
        />
        <SavingsTile
          label="KWH PER YEAR"
          value={Math.round(results.annualKwh)}
          unit=" kWh"
          tier="mid"
        />
        <SavingsTile
          label="VS GAS"
          value={Math.max(0, results.annualSavings)}
          prefix="$"
          unit="/yr saved"
          tier="volt"
        />
      </>
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Charging Cost Calculator"
        description="Calculate your monthly and annual EV charging costs based on your vehicle, state electricity rates, and daily driving habits."
        url="https://chargemath.com/ev-charging-cost"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "EV Charging Cost Calculator", url: "https://chargemath.com/ev-charging-cost" },
        ]}
      />
      <CalculatorShell
        eyebrow="EV charging"
        title="EV Charging Cost"
        quickAnswer="The typical EV costs $40 to $80 per month to charge at home. Your exact number depends on your car, state rate, and miles driven."
        inputs={inputs}
        hero={hero}
      >
        <div className="mb-8">
          <SavingsMeter
            leftLabel="GAS"
            leftValue={results.gasAnnualCost}
            rightLabel="GRID"
            rightValue={results.annualCost}
          />
        </div>

        {/* Contextual cross-links */}
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Compare gas vs electric costs
          </Link>
          <Link
            href="/charging-time"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            How long does this charge take?
          </Link>
          <Link
            href="/bill-impact"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            See your bill impact
          </Link>
        </div>

        <EducationalContent>
          <h2>How We Calculate EV Charging Costs</h2>
          <p>
            This calculator multiplies your vehicle&apos;s EPA-rated efficiency (kWh per 100 miles) by your daily mileage to determine energy consumption, then applies your state&apos;s residential electricity rate from the U.S. Energy Information Administration (EIA). DC Fast charging uses a 2.5x rate multiplier to reflect typical public station pricing.
          </p>
          <h3>Where the Data Comes From</h3>
          <p>
            Vehicle efficiency ratings come from the EPA&apos;s FuelEconomy.gov database, which tests every EV sold in the U.S. under standardized conditions. Electricity rates are EIA state-level residential averages updated annually. Real-world efficiency varies by 10-20% from EPA ratings depending on driving conditions, temperature, and speed.
          </p>
          <h3>Tips for Accuracy</h3>
          <ul>
            <li>Check your actual electricity rate on your utility bill. It may differ from the state average, especially if you have a time-of-use plan.</li>
            <li>DC Fast charging rates vary widely by network ($0.25 to $0.60 per kWh). Check your preferred network&apos;s pricing.</li>
            <li>Cold weather can increase energy consumption by 30 to 40%, so winter costs may be noticeably higher.</li>
            <li>Most EV owners charge to 80% daily, not 100%. A full charge estimate assumes you occasionally need maximum range.</li>
          </ul>
        </EducationalContent>
        <FAQSection questions={chargingCostFAQ} />
        <EmailCapture source="ev-charging-cost" />
        <RelatedCalculators currentPath="/ev-charging-cost" />
      </CalculatorShell>
    </>
  );
}
