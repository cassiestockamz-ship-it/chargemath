"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SelectInput from "@/components/SelectInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type Climate = "mild" | "hot" | "cold";
type ChargingHabit = "level2" | "mixed" | "dcfc";
type ChargeLevel = "80" | "90" | "100";

const CLIMATE_OPTIONS: { value: Climate; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "hot", label: "Hot (frequent 95F+)" },
  { value: "cold", label: "Cold (frequent below 32F)" },
];

const CHARGING_OPTIONS: { value: ChargingHabit; label: string }[] = [
  { value: "level2", label: "Mostly Level 2" },
  { value: "mixed", label: "Mixed with DCFC" },
  { value: "dcfc", label: "Mostly DCFC" },
];

const CHARGE_LEVEL_OPTIONS: { value: ChargeLevel; label: string }[] = [
  { value: "80", label: "Charge to 80%" },
  { value: "90", label: "Charge to 90%" },
  { value: "100", label: "Charge to 100%" },
];

const CLIMATE_PENALTY: Record<Climate, number> = {
  mild: 0,
  hot: 0.005,
  cold: 0.003,
};

const CHARGING_PENALTY: Record<ChargingHabit, number> = {
  level2: 0,
  mixed: 0.002,
  dcfc: 0.005,
};

const CHARGE_LEVEL_PENALTY: Record<ChargeLevel, number> = {
  "80": 0,
  "90": 0,
  "100": 0.004,
};

function calcRemainingCapacity(annualRate: number, years: number): number {
  return 100 * Math.pow(1 - annualRate, years);
}

function findYearToThreshold(annualRate: number, threshold: number): number | null {
  if (annualRate <= 0) return null;
  const years = Math.log(threshold / 100) / Math.log(1 - annualRate);
  return years > 0 && years <= 30 ? Math.round(years * 10) / 10 : null;
}

const degradationFAQ = [
  {
    question: "How fast do EV batteries degrade?",
    answer:
      "Most modern EV batteries lose about 2 to 3 percent of their capacity per year under normal conditions. After 10 years, a well-maintained battery typically retains 75 to 85 percent of its original capacity. Factors like extreme heat, frequent DC fast charging, and regularly charging to 100 percent can accelerate degradation.",
  },
  {
    question: "Does DC fast charging damage my EV battery?",
    answer:
      "Frequent DC fast charging can accelerate battery wear because it generates more heat and pushes higher voltages through the cells. Occasional use is fine, but relying on DCFC as your primary charging method may add roughly 0.5 percent extra degradation per year compared to Level 2 home charging.",
  },
  {
    question: "Should I charge my EV to 100% every day?",
    answer:
      "For daily driving, charging to 80 percent is recommended by most manufacturers. Keeping the battery at very high or very low states of charge puts extra stress on the cells. Reserve 100 percent charges for long trips when you need the full range. This simple habit can meaningfully extend your battery's lifespan.",
  },
  {
    question: "What does the 80% battery warranty threshold mean?",
    answer:
      "Most EV manufacturers warranty the battery for 8 years or 100,000 miles and guarantee it will retain at least 70 to 80 percent of its original capacity. If your battery drops below that threshold during the warranty period, the manufacturer will repair or replace it at no cost.",
  },
  {
    question: "Does cold weather permanently damage EV batteries?",
    answer:
      "Cold weather temporarily reduces range (sometimes by 30 to 40 percent) but does not cause significant permanent damage on its own. However, repeatedly charging in very cold temperatures without battery preconditioning can contribute to slightly faster long-term degradation. Most modern EVs have thermal management systems to mitigate this.",
  },
];

export default function BatteryDegradationPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [ageYears, setAgeYears] = useState(3);
  const [annualMiles, setAnnualMiles] = useState(12000);
  const [climate, setClimate] = useState<Climate>("mild");
  const [chargingHabit, setChargingHabit] = useState<ChargingHabit>("level2");
  const [chargeLevel, setChargeLevel] = useState<ChargeLevel>("80");

  useUrlSync(
    {
      vehicle: vehicleId,
      age: ageYears,
      miles: annualMiles,
      climate,
      charging: chargingHabit,
      level: chargeLevel,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.age) setAgeYears(Number(p.age));
      if (p.miles) setAnnualMiles(Number(p.miles));
      if (p.climate && ["mild", "hot", "cold"].includes(p.climate)) setClimate(p.climate as Climate);
      if (p.charging && ["level2", "mixed", "dcfc"].includes(p.charging)) setChargingHabit(p.charging as ChargingHabit);
      if (p.level && ["80", "90", "100"].includes(p.level)) setChargeLevel(p.level as ChargeLevel);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const baseRate = 0.023;
    const climatePenalty = CLIMATE_PENALTY[climate];
    const mileagePenalty = annualMiles > 15000 ? 0.003 : 0;
    const chargingPenalty = CHARGING_PENALTY[chargingHabit];
    const levelPenalty = CHARGE_LEVEL_PENALTY[chargeLevel];

    const annualRate = baseRate + climatePenalty + mileagePenalty + chargingPenalty + levelPenalty;

    const currentCapacity = calcRemainingCapacity(annualRate, ageYears);
    const currentRange = (vehicle.epaRangeMiles * currentCapacity) / 100;
    const rangeLost = vehicle.epaRangeMiles - currentRange;

    const capacity5yr = calcRemainingCapacity(annualRate, 5);
    const capacity8yr = calcRemainingCapacity(annualRate, 8);
    const capacity10yr = calcRemainingCapacity(annualRate, 10);

    const range5yr = (vehicle.epaRangeMiles * capacity5yr) / 100;
    const range8yr = (vehicle.epaRangeMiles * capacity8yr) / 100;
    const range10yr = (vehicle.epaRangeMiles * capacity10yr) / 100;

    const yearsTo80 = findYearToThreshold(annualRate, 80);
    const yearsTo70 = findYearToThreshold(annualRate, 70);

    // Remaining kWh (based on current capacity share)
    const currentKwh = (vehicle.batteryCapacityKwh * currentCapacity) / 100;

    // Years left until 80% threshold (from today)
    const yearsLeftTo80 =
      yearsTo80 !== null ? Math.max(0, yearsTo80 - ageYears) : null;

    return {
      annualRate,
      currentCapacity,
      currentRange,
      rangeLost,
      capacity5yr,
      capacity8yr,
      capacity10yr,
      range5yr,
      range8yr,
      range10yr,
      yearsTo80,
      yearsTo70,
      currentKwh,
      yearsLeftTo80,
    };
  }, [vehicle, ageYears, annualMiles, climate, chargingHabit, chargeLevel]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const heroHeadline = ageYears > 0 ? `CAPACITY AT YR ${ageYears}` : "CAPACITY NEW";
  const capacityRounded = Math.round(results.currentCapacity);
  const yearsLeftDisplay =
    results.yearsLeftTo80 !== null ? Math.round(results.yearsLeftTo80 * 10) / 10 : 30;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.batteryCapacityKwh} kWh battery, ${vehicle.epaRangeMiles} mi EPA range`}
      />
      <SliderInput
        label="Vehicle age"
        value={ageYears}
        onChange={setAgeYears}
        min={0}
        max={15}
        step={1}
        unit=" yrs"
        showValue
      />
      <SliderInput
        label="Annual miles driven"
        value={annualMiles}
        onChange={setAnnualMiles}
        min={5000}
        max={30000}
        step={1000}
        unit=" mi/yr"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <SelectInput
            label="Climate"
            value={climate}
            onChange={(v) => setClimate(v as Climate)}
            options={CLIMATE_OPTIONS}
          />
          <SelectInput
            label="Charging habits"
            value={chargingHabit}
            onChange={(v) => setChargingHabit(v as ChargingHabit)}
            options={CHARGING_OPTIONS}
          />
          <SelectInput
            label="Typical charge level"
            value={chargeLevel}
            onChange={(v) => setChargeLevel(v as ChargeLevel)}
            options={CHARGE_LEVEL_OPTIONS}
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Battery health"
      headline={heroHeadline}
      amount={capacityRounded}
      amountPrefix=""
      amountDecimals={0}
      amountUnit="%"
      sub={`Your ${vehicle.year} ${vehicle.make} ${vehicle.model} at ${(results.annualRate * 100).toFixed(1)}%/yr estimated degradation. About ${Math.round(results.currentRange)} miles of range today, ${Math.round(results.rangeLost)} miles lost versus new.`}
      dialPercent={Math.min(100, Math.max(0, capacityRounded))}
      dialLabel="CAPACITY"
    >
      <SavingsTile
        label="CURRENT CAPACITY"
        value={results.currentCapacity}
        decimals={1}
        unit="%"
        tier="volt"
      />
      <SavingsTile
        label="REMAINING KWH"
        value={results.currentKwh}
        decimals={1}
        unit=" kWh"
        tier="brand"
      />
      <SavingsTile
        label="REMAINING RANGE"
        value={Math.round(results.currentRange)}
        unit=" mi"
        tier="good"
      />
      <SavingsTile
        label="YEARS LEFT TO 80%"
        value={yearsLeftDisplay}
        decimals={1}
        unit=" yr"
        tier="mid"
      />
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Battery Degradation Estimator"
        description="Estimate EV battery capacity loss over time based on vehicle age, mileage, climate, charging habits, and charge levels. See projected range at 5, 8, and 10 years."
        url="https://chargemath.com/battery-degradation"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Battery Degradation Estimator", url: "https://chargemath.com/battery-degradation" },
        ]}
      />
      <CalculatorShell
        eyebrow="Battery health"
        title="EV Battery Degradation Estimator"
        quickAnswer="Most EV batteries lose 2 to 3 percent of capacity per year. After 10 years, expect 75 to 85 percent of original range."
        inputs={inputs}
        hero={hero}
      >
        <div className="mt-2 mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/range"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate real-world range today
          </Link>
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Estimate your charging costs
          </Link>
          <Link
            href="/charging-time"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            How long to charge your battery?
          </Link>
        </div>

        <EducationalContent>
          <h2>How to Maximize Your EV Battery&apos;s Lifespan</h2>
          <p>
            EV battery degradation is inevitable, but the rate at which it
            happens is largely within your control. Here are the most impactful
            steps you can take to keep your battery healthy for as long as
            possible.
          </p>
          <h3>Charge to 80% for Daily Driving</h3>
          <p>
            Lithium-ion batteries experience the most stress at very high and
            very low states of charge. Keeping your daily charge limit at 80
            percent (or whatever your manufacturer recommends) reduces stress on
            the cells and can add years of usable life. Save the 100 percent
            charge for road trips when you actually need the extra range.
          </p>
          <h3>Minimize DC Fast Charging</h3>
          <p>
            DC fast charging is convenient but generates significantly more heat
            than Level 2 charging. Heat is the number one enemy of battery
            longevity. If you can charge at home on Level 2 for your regular
            needs, your battery will thank you. Using DCFC occasionally for road
            trips is perfectly fine.
          </p>
          <h3>Avoid Extreme Heat Exposure</h3>
          <p>
            Parking in the shade, using a garage, and pre-conditioning the
            battery while plugged in are simple ways to reduce thermal stress.
            Vehicles parked in consistently hot climates (like Phoenix or
            Houston) tend to show faster degradation than those in mild regions.
          </p>
          <h3>Drive Regularly</h3>
          <p>
            Batteries do better when they cycle regularly than when they sit at
            a fixed state of charge for weeks. If you store your EV for extended
            periods, keep the charge level around 50 percent and check it
            periodically.
          </p>
        </EducationalContent>

        <FAQSection questions={degradationFAQ} />
        <EmailCapture source="battery-degradation" />
        <RelatedCalculators currentPath="/battery-degradation" />
      </CalculatorShell>
    </>
  );
}
