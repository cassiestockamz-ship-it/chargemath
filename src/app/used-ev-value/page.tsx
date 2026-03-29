"use client";

import { useState, useMemo, useCallback } from "react";
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

  return (
    <CalculatorLayout
      title="Used EV Value Estimator"
      description="Estimate the current market value of a used electric vehicle based on age, mileage, battery health, and condition."
      lastUpdated="March 2026"
      intro="Used EV prices depend heavily on battery health, which is something traditional car valuation tools often miss. This calculator factors in depreciation curves, mileage, charging habits, and battery degradation to give you a realistic estimate. Whether you are buying or selling, understanding these factors helps you negotiate a fair price."
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select EV Model"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery | ${vehicle.epaRangeMiles} mi EPA range`}
        />

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

        <SliderInput
          label="Vehicle Age"
          value={ageYears}
          onChange={setAgeYears}
          min={1}
          max={12}
          step={1}
          unit=" years"
          showValue
        />

        <SliderInput
          label="Total Mileage"
          value={totalMileage}
          onChange={setTotalMileage}
          min={5000}
          max={200000}
          step={1000}
          unit=" mi"
          showValue
        />

        <SelectInput
          label="Vehicle Condition"
          value={condition}
          onChange={(v) => setCondition(v as Condition)}
          options={CONDITION_OPTIONS}
        />

        <SelectInput
          label="Charging Habits"
          value={chargingHabit}
          onChange={(v) => setChargingHabit(v as ChargingHabit)}
          options={CHARGING_OPTIONS}
          helpText="How the vehicle was primarily charged"
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Value Estimate
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Estimated Current Value"
            value={`$${Math.round(results.estimatedValue).toLocaleString()}`}
            unit=""
            highlight
            icon="💰"
          />
          <ResultCard
            label="Battery Health"
            value={results.batteryHealthPct.toFixed(1)}
            unit="%"
            icon={results.isBelowWarranty ? "⚠️" : "🔋"}
          />
          <ResultCard
            label="Value vs. New"
            value={results.valueVsNew.toFixed(1)}
            unit="%"
            icon="📊"
          />
          <ResultCard
            label="Cost per Range Mile"
            value={`$${results.costPerRangeMile.toFixed(2)}`}
            unit=""
            icon="🗺️"
          />
        </div>
      </div>

      {/* Depreciation Breakdown */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Value Breakdown
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">
                Original MSRP
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                ${originalMsrp.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">
                Depreciation ({ageYears} year{ageYears !== 1 ? "s" : ""})
              </span>
              <span className="font-semibold text-red-500">
                -$
                {Math.round(
                  originalMsrp * (1 - calculateDepreciation(ageYears))
                ).toLocaleString()}
              </span>
            </div>

            {results.conditionMod !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">
                  Condition Adjustment ({condition})
                </span>
                <span
                  className={`font-semibold ${
                    results.conditionMod > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {results.conditionMod > 0 ? "+" : ""}$
                  {Math.round(
                    originalMsrp * Math.abs(results.conditionMod)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            {results.mileageDeduction > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">
                  High Mileage Deduction
                </span>
                <span className="font-semibold text-red-500">
                  -$
                  {Math.round(
                    originalMsrp * results.mileageDeduction
                  ).toLocaleString()}
                </span>
              </div>
            )}

            {results.batteryDeduction > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text)]">
                  Battery Below 80% Penalty
                </span>
                <span className="font-semibold text-red-500">
                  -$
                  {Math.round(
                    originalMsrp * results.batteryDeduction
                  ).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-sm font-bold text-[var(--color-text)]">
                Estimated Value
              </span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                ${Math.round(results.estimatedValue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Health Detail */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Battery Health Analysis
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          {/* Battery bar */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">
                Estimated Battery Capacity
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {results.batteryHealthPct.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              {/* 80% threshold marker */}
              <div
                className="absolute top-0 h-full w-px bg-red-500 z-10"
                style={{ left: "80%" }}
                title="80% warranty threshold"
              />
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(results.batteryHealthPct, 100)}%`,
                  backgroundColor: results.isBelowWarranty
                    ? "#ef4444"
                    : "var(--color-ev-green)",
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>0%</span>
              <span className="text-red-500">80% warranty threshold</span>
              <span>100%</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Estimated Remaining Range
              </p>
              <p className="text-lg font-bold text-[var(--color-text)]">
                {Math.round(results.remainingRange)} miles
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                vs. {vehicle.epaRangeMiles} mi when new
              </p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Warranty Status
              </p>
              <p
                className={`text-lg font-bold ${
                  results.isBelowWarranty ? "text-red-500" : "text-green-500"
                }`}
              >
                {results.isBelowWarranty
                  ? "Below 80% Threshold"
                  : "Above 80% Threshold"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {results.isBelowWarranty
                  ? "May qualify for warranty battery replacement"
                  : "Battery within normal warranty range"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Check real-world range for this EV &rarr;
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Calculate charging costs &rarr;
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Compare gas vs electric savings &rarr;
        </Link>
      </div>

      <ShareResults
        title={`Used EV Value: $${Math.round(results.estimatedValue).toLocaleString()}`}
        text={`A ${ageYears}-year-old ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${totalMileage.toLocaleString()} miles is worth about $${Math.round(results.estimatedValue).toLocaleString()} (${results.valueVsNew.toFixed(0)}% of original $${originalMsrp.toLocaleString()} MSRP). Battery health: ${results.batteryHealthPct.toFixed(1)}%.`}
      />

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
          current IRS rules, but there are income and price caps. Check
          IRS.gov for the latest eligibility requirements, as this can
          significantly offset the purchase price.
        </p>
      </EducationalContent>

      <FAQSection questions={usedEvFAQ} />
      <EmailCapture source="used-ev-value" />
      <RelatedCalculators currentPath="/used-ev-value" />
    </CalculatorLayout>
  );
}
