"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
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
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type Condition = "excellent" | "good" | "fair" | "poor";
type ChargingHabit = "level2" | "mixed" | "dcfc";

const CONDITION_OPTIONS: { value: Condition; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const CHARGING_OPTIONS: { value: ChargingHabit; label: string }[] = [
  { value: "level2", label: "Mostly Level 2" },
  { value: "mixed", label: "Mixed" },
  { value: "dcfc", label: "Mostly DCFC" },
];

const CONDITION_MODIFIERS: Record<Condition, number> = {
  excellent: 0.05,
  good: 0,
  fair: -0.08,
  poor: -0.15,
};

const DCFC_DEGRADATION_BONUS: Record<ChargingHabit, number> = {
  level2: 0,
  mixed: 0.25,
  dcfc: 0.5,
};

function calculateDepreciation(ageYears: number): number {
  let remainingValue = 1;
  for (let year = 1; year <= ageYears; year++) {
    let yearRate: number;
    if (year === 1) yearRate = 0.2;
    else if (year === 2) yearRate = 0.15;
    else if (year === 3) yearRate = 0.12;
    else if (year <= 6) yearRate = 0.08;
    else yearRate = 0.05;
    remainingValue *= 1 - yearRate;
  }
  return remainingValue;
}

function calculateBatteryHealth(
  ageYears: number,
  chargingHabit: ChargingHabit
): number {
  const baseAnnualDegradation = 0.023;
  const dcfcBonus = DCFC_DEGRADATION_BONUS[chargingHabit];
  const annualRate = baseAnnualDegradation + dcfcBonus * baseAnnualDegradation;
  const health = Math.pow(1 - annualRate, ageYears) * 100;
  return Math.max(health, 40);
}

const usedEvFAQ = [
  {
    question: "How does battery degradation affect a used EV's value?",
    answer:
      "Battery health is the single biggest factor unique to used EV pricing. Most EV batteries degrade about 2-3% per year under normal conditions. If the battery falls below 80% capacity, it may no longer qualify for the manufacturer warranty, and the value drops significantly because a replacement battery can cost $5,000 to $15,000 depending on the vehicle.",
  },
  {
    question: "Does fast charging (DCFC) really hurt battery health?",
    answer:
      "Frequent DC fast charging does accelerate battery degradation compared to Level 2 home charging. The heat generated during fast charging stresses the battery cells over time. A vehicle that was primarily fast-charged may show 5-15% more degradation over 5 years compared to one charged mostly at home on Level 2. This is factored into our estimate.",
  },
  {
    question: "What is the 80% battery warranty threshold?",
    answer:
      "Most EV manufacturers warranty the battery for 8 years or 100,000 miles, guaranteeing it will retain at least 70-80% of its original capacity. If the battery falls below this threshold within the warranty period, the manufacturer must repair or replace it. For used buyers, a battery above 80% means the warranty protection is still meaningful.",
  },
  {
    question: "How accurate is this used EV value estimate?",
    answer:
      "This calculator provides a ballpark estimate based on standard depreciation curves, battery degradation models, and condition adjustments. Actual market prices vary based on local demand, specific trim levels, service history, available tax credits, and regional factors. Use this as a starting point, then check listings on sites like CarGurus, Autotrader, or Carvana for real market pricing.",
  },
  {
    question:
      "Why do EVs depreciate faster than gas cars in the first few years?",
    answer:
      "EVs have historically depreciated faster in years 1-3 due to rapidly improving technology, increasing range in newer models, and federal tax credits that effectively lower the price of new vehicles. However, depreciation is slowing as the used EV market matures and buyers become more comfortable with the technology. Some popular models like the Tesla Model 3 and Model Y now hold their value comparably to gas equivalents.",
  },
];

export default function UsedEvValuePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [originalMsrp, setOriginalMsrp] = useState(40000);
  const [ageYears, setAgeYears] = useState(3);
  const [totalMileage, setTotalMileage] = useState(36000);
  const [condition, setCondition] = useState<Condition>("good");
  const [chargingHabit, setChargingHabit] = useState<ChargingHabit>("level2");

  useUrlSync(
    {
      vehicle: vehicleId,
      msrp: originalMsrp,
      age: ageYears,
      miles: totalMileage,
      condition,
      charging: chargingHabit,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.msrp) setOriginalMsrp(Number(p.msrp));
      if (p.age) setAgeYears(Number(p.age));
      if (p.miles) setTotalMileage(Number(p.miles));
      if (
        p.condition &&
        ["excellent", "good", "fair", "poor"].includes(p.condition)
      )
        setCondition(p.condition as Condition);
      if (
        p.charging &&
        ["level2", "mixed", "dcfc"].includes(p.charging)
      )
        setChargingHabit(p.charging as ChargingHabit);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    // Base depreciation from age
    const depreciationRetained = calculateDepreciation(ageYears);

    // Condition modifier
    const conditionMod = CONDITION_MODIFIERS[condition];

    // Mileage adjustment: deduct 1% per 5K miles over 12K/year average
    const expectedMileage = ageYears * 12000;
    const excessMileage = Math.max(0, totalMileage - expectedMileage);
    const mileageDeduction = Math.floor(excessMileage / 5000) * 0.01;

    // Battery health
    const batteryHealthPct = calculateBatteryHealth(ageYears, chargingHabit);
    const isBelowWarranty = batteryHealthPct < 80;
    const batteryDeduction = isBelowWarranty ? 0.1 : 0;

    // Final value calculation
    const adjustedRetained =
      depreciationRetained + conditionMod - mileageDeduction - batteryDeduction;
    const clampedRetained = Math.max(0.05, Math.min(0.95, adjustedRetained));
    const estimatedValue = originalMsrp * clampedRetained;

    // Value vs new
    const valueVsNew = clampedRetained * 100;

    // Depreciation from new
    const depreciationFromNew = originalMsrp - estimatedValue;

    // Remaining range based on battery health
    const remainingRange =
      vehicle.epaRangeMiles * (batteryHealthPct / 100);

    // Cost per remaining range mile
    const costPerRangeMile =
      remainingRange > 0 ? estimatedValue / remainingRange : 0;

    return {
      estimatedValue,
      batteryHealthPct,
      valueVsNew,
      depreciationFromNew,
      costPerRangeMile,
      remainingRange,
      isBelowWarranty,
      mileageDeduction,
      conditionMod,
      batteryDeduction,
    };
  }, [
    vehicleId,
    vehicle,
    originalMsrp,
    ageYears,
    totalMileage,
    condition,
    chargingHabit,
  ]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  // Dial: share of original MSRP retained
  const dialPercent = Math.max(0, Math.min(100, results.valueVsNew));

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="EV model"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.batteryCapacityKwh} kWh battery, ${vehicle.epaRangeMiles} mi range`}
      />
      <SliderInput
        label="Vehicle age"
        value={ageYears}
        onChange={setAgeYears}
        min={1}
        max={12}
        step={1}
        unit=" years"
        showValue
      />
      <SliderInput
        label="Total mileage"
        value={totalMileage}
        onChange={setTotalMileage}
        min={5000}
        max={200000}
        step={1000}
        unit=" mi"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="FAIR PRICE"
      amount={results.estimatedValue}
      amountUnit=""
      sub={
        <>
          A {ageYears}-year-old {vehicle.year} {vehicle.make} {vehicle.model} with {totalMileage.toLocaleString()} miles.
          Original MSRP {`$${originalMsrp.toLocaleString()}`}.
          Estimated remaining range {Math.round(results.remainingRange)} mi.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="VALUE RETAINED"
    >
      <SavingsTile
        label="BATTERY HEALTH"
        value={results.batteryHealthPct}
        decimals={1}
        unit="%"
        tier={results.isBelowWarranty ? "warn" : "good"}
        animate
      />
      <SavingsTile
        label="AGE PENALTY"
        value={Math.round((1 - calculateDepreciation(ageYears)) * 100)}
        unit="%"
        tier="warn"
        animate
      />
      <SavingsTile
        label="MILEAGE PENALTY"
        value={Math.round(results.mileageDeduction * 100)}
        unit="%"
        tier="mid"
        animate
      />
      <SavingsTile
        label="RESIDUAL"
        value={results.valueVsNew}
        decimals={1}
        unit="% of MSRP"
        tier="brand"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Used EV value"
      title="Used EV Value Estimator"
      quickAnswer="Used EV prices hinge on battery health. A 3 year old EV at 90% battery typically holds 55 to 65% of its original MSRP."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="Used EV Value Estimator"
        description="Estimate the value of a used electric vehicle based on battery health, depreciation, mileage, and condition. See how charging habits and age affect resale price."
        url="https://chargemath.com/used-ev-value"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Used EV Value Estimator",
            url: "https://chargemath.com/used-ev-value",
          },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="group mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Original MSRP"
            value={originalMsrp}
            onChange={setOriginalMsrp}
            min={10000}
            max={200000}
            step={500}
            unit="$"
            helpText="Sticker price when new"
          />
          <SelectInput
            label="Vehicle condition"
            value={condition}
            onChange={(v) => setCondition(v as Condition)}
            options={CONDITION_OPTIONS}
          />
          <SelectInput
            label="Charging habits"
            value={chargingHabit}
            onChange={(v) => setChargingHabit(v as ChargingHabit)}
            options={CHARGING_OPTIONS}
            helpText="How the vehicle was primarily charged"
          />
        </div>
      </details>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check real-world range for this EV
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate charging costs
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Compare gas vs electric savings
        </Link>
      </div>

      <EducationalContent>
        <h2>What to Look for When Buying a Used EV</h2>
        <p>
          Buying a used electric vehicle is different from buying a used gas car.
          The battery pack is the most expensive single component, often
          accounting for 30-40% of the vehicle&apos;s original cost. Understanding
          its condition is critical to getting a fair deal.
        </p>
        <h3>Battery Health Is the Top Priority</h3>
        <p>
          Ask the seller for a battery health report or use a diagnostic tool
          like an OBD-II scanner with EV-specific software. Many Tesla owners can
          show battery degradation stats directly in the app. A battery at 90%
          health after 5 years is excellent. Below 80% means reduced range and
          potentially expensive replacement down the road.
        </p>
        <h3>Check the Charging History</h3>
        <p>
          Vehicles that were primarily charged with DC fast chargers (Level 3)
          tend to show more battery wear. Level 2 home charging is gentler on the
          battery. If the seller used the vehicle for rideshare and charged
          exclusively at fast chargers, expect higher degradation than average.
        </p>
        <h3>Understand the Warranty Transfer</h3>
        <p>
          Most EV battery warranties (typically 8 years / 100,000 miles) transfer
          to subsequent owners. Verify the warranty status before purchasing.
          This coverage can save you thousands if the battery fails prematurely.
        </p>
        <h3>Software and Updates Matter</h3>
        <p>
          Some manufacturers push over-the-air updates that can improve range,
          charging speed, or add features. Check whether the vehicle is on the
          latest software version. Older vehicles that no longer receive updates
          may miss out on performance improvements.
        </p>
        <h3>Factor in Available Tax Credits</h3>
        <p>
          Used EVs may qualify for a federal tax credit of up to $4,000 under
          current IRS rules (Section 25E), but there are income and price caps.
          Check IRS.gov for the latest eligibility requirements, as this can
          significantly offset the purchase price.
        </p>
      </EducationalContent>

      <FAQSection questions={usedEvFAQ} />
      <EmailCapture source="used-ev-value" />
      <RelatedCalculators currentPath="/used-ev-value" />
    </CalculatorShell>
  );
}
