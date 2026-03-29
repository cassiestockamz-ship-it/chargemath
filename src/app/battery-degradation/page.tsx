"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
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

type Climate = "mild" | "hot" | "cold";
type ChargingHabit = "level2" | "mixed" | "dcfc";
type ChargeLevel = "80" | "90" | "100";

const CLIMATE_OPTIONS: { value: Climate; label: string }[] = [
  { value: "mild", label: "Mild" },
  { value: "hot", label: "Hot (frequent 95°F+)" },
  { value: "cold", label: "Cold (frequent below 32°F)" },
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
  // Solve: 100 * (1 - annualRate)^years = threshold
  // years = ln(threshold/100) / ln(1 - annualRate)
  const years = Math.log(threshold / 100) / Math.log(1 - annualRate);
  return years > 0 && years <= 30 ? Math.round(years * 10) / 10 : null;
}

const degradationFAQ = [
  {
    question: "How fast do EV batteries degrade?",
    answer:
      "Most modern EV batteries lose about 2-3% of their capacity per year under normal conditions. After 10 years, a well-maintained battery typically retains 75-85% of its original capacity. Factors like extreme heat, frequent DC fast charging, and regularly charging to 100% can accelerate degradation.",
  },
  {
    question: "Does DC fast charging damage my EV battery?",
    answer:
      "Frequent DC fast charging can accelerate battery wear because it generates more heat and pushes higher voltages through the cells. Occasional use is fine, but relying on DCFC as your primary charging method may add roughly 0.5% extra degradation per year compared to Level 2 home charging.",
  },
  {
    question: "Should I charge my EV to 100% every day?",
    answer:
      "For daily driving, charging to 80% is recommended by most manufacturers. Keeping the battery at very high or very low states of charge puts extra stress on the cells. Reserve 100% charges for long trips when you need the full range. This simple habit can meaningfully extend your battery's lifespan.",
  },
  {
    question: "What does the 80% battery warranty threshold mean?",
    answer:
      "Most EV manufacturers warranty the battery for 8 years or 100,000 miles and guarantee it will retain at least 70-80% of its original capacity. If your battery drops below that threshold during the warranty period, the manufacturer will repair or replace it at no cost.",
  },
  {
    question: "Does cold weather permanently damage EV batteries?",
    answer:
      "Cold weather temporarily reduces range (sometimes by 30-40%) but does not cause significant permanent damage on its own. However, repeatedly charging in very cold temperatures without battery preconditioning can contribute to slightly faster long-term degradation. Most modern EVs have thermal management systems to mitigate this.",
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

    // Year-by-year table data
    const yearlyData: { year: number; capacity: number; range: number }[] = [];
    for (let y = 0; y <= 15; y++) {
      const cap = calcRemainingCapacity(annualRate, y);
      yearlyData.push({
        year: y,
        capacity: cap,
        range: (vehicle.epaRangeMiles * cap) / 100,
      });
    }

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
      yearlyData,
    };
  }, [vehicle, ageYears, annualMiles, climate, chargingHabit, chargeLevel]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  return (
    <CalculatorLayout
      title="Battery Degradation Estimator"
      description="Estimate how much battery capacity your EV has lost based on age, driving habits, climate, and charging behavior."
      lastUpdated="March 2026"
      intro="EV batteries lose capacity gradually over time. Most lose about 2-3% per year under normal conditions, but factors like extreme heat, frequent fast charging, and regularly charging to 100% can speed up the process. This calculator estimates your battery's current health and projects future capacity based on your specific usage patterns."
    >
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery | ${vehicle.epaRangeMiles} mi EPA range`}
        />

        <SliderInput
          label="Vehicle Age"
          value={ageYears}
          onChange={setAgeYears}
          min={0}
          max={15}
          step={1}
          unit=" years"
          showValue
        />

        <SliderInput
          label="Annual Miles Driven"
          value={annualMiles}
          onChange={setAnnualMiles}
          min={5000}
          max={30000}
          step={1000}
          unit=" mi/yr"
          showValue
        />

        <SelectInput
          label="Climate"
          value={climate}
          onChange={(v) => setClimate(v as Climate)}
          options={CLIMATE_OPTIONS}
        />

        <SelectInput
          label="Charging Habits"
          value={chargingHabit}
          onChange={(v) => setChargingHabit(v as ChargingHabit)}
          options={CHARGING_OPTIONS}
        />

        <SelectInput
          label="Typical Charge Level"
          value={chargeLevel}
          onChange={(v) => setChargeLevel(v as ChargeLevel)}
          options={CHARGE_LEVEL_OPTIONS}
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Degradation Estimates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Estimated Current Capacity"
            value={results.currentCapacity.toFixed(1)}
            unit="%"
            highlight
            icon="🔋"
          />
          <ResultCard
            label="Estimated Current Range"
            value={Math.round(results.currentRange).toLocaleString()}
            unit="miles"
            icon="🗺️"
          />
          <ResultCard
            label="Range Lost vs New"
            value={Math.round(results.rangeLost).toLocaleString()}
            unit="miles"
            icon="📉"
          />
          <ResultCard
            label="Years to 80% Capacity"
            value={results.yearsTo80 !== null ? results.yearsTo80.toFixed(1) : "30+"}
            unit="years"
            icon="⚠️"
          />
          <ResultCard
            label="Range at 5 Years"
            value={Math.round(results.range5yr).toLocaleString()}
            unit="miles"
            icon="📅"
          />
          <ResultCard
            label="Range at 8 Years"
            value={Math.round(results.range8yr).toLocaleString()}
            unit="miles"
            icon="📅"
          />
          <ResultCard
            label="Range at 10 Years"
            value={Math.round(results.range10yr).toLocaleString()}
            unit="miles"
            icon="📅"
          />
          <ResultCard
            label="Annual Degradation Rate"
            value={(results.annualRate * 100).toFixed(1)}
            unit="%/year"
            icon="📊"
          />
          <ResultCard
            label="Years to 70% Capacity"
            value={results.yearsTo70 !== null ? results.yearsTo70.toFixed(1) : "30+"}
            unit="years"
            icon="🔻"
          />
        </div>
      </div>

      {/* Year-by-Year Capacity Table */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Year-by-Year Capacity Projection
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">Year</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">Capacity</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">Est. Range</th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">Range Lost</th>
              </tr>
            </thead>
            <tbody>
              {results.yearlyData.map((row) => {
                const isCurrentYear = row.year === ageYears;
                const rangeLost = vehicle.epaRangeMiles - row.range;
                return (
                  <tr
                    key={row.year}
                    className={`border-t border-[var(--color-border)] ${
                      isCurrentYear
                        ? "bg-[var(--color-ev-green)]/10 font-semibold"
                        : "bg-[var(--color-surface)]"
                    }`}
                  >
                    <td className="px-4 py-2 text-[var(--color-text)]">
                      {row.year === 0 ? "New" : `Year ${row.year}`}
                      {isCurrentYear && row.year > 0 && (
                        <span className="ml-2 text-xs text-[var(--color-ev-green)]">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-text)]">
                      {row.capacity.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-text)]">
                      {Math.round(row.range).toLocaleString()} mi
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-text-muted)]">
                      {row.year === 0 ? "-" : `${Math.round(rangeLost)} mi`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Calculate real-world range today →
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Estimate your charging costs →
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          How long to charge your battery? →
        </Link>
      </div>

      <ShareResults
        title={`Battery Health: ${results.currentCapacity.toFixed(1)}% after ${ageYears} years`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} has an estimated ${results.currentCapacity.toFixed(1)}% battery capacity after ${ageYears} years, giving about ${Math.round(results.currentRange)} miles of range (${Math.round(results.rangeLost)} miles less than new). At this rate, it will reach the 80% warranty threshold at ${results.yearsTo80 !== null ? results.yearsTo80.toFixed(1) : "30+"} years.`}
      />

      <EducationalContent>
        <h2>How to Maximize Your EV Battery&apos;s Lifespan</h2>
        <p>
          EV battery degradation is inevitable, but the rate at which it happens is largely within your control. Here are the most impactful steps you can take to keep your battery healthy for as long as possible.
        </p>
        <h3>Charge to 80% for Daily Driving</h3>
        <p>
          Lithium-ion batteries experience the most stress at very high and very low states of charge. Keeping your daily charge limit at 80% (or whatever your manufacturer recommends) reduces stress on the cells and can add years of usable life. Save the 100% charge for road trips when you actually need the extra range.
        </p>
        <h3>Minimize DC Fast Charging</h3>
        <p>
          DC fast charging is convenient but generates significantly more heat than Level 2 charging. Heat is the number one enemy of battery longevity. If you can charge at home on Level 2 for your regular needs, your battery will thank you. Using DCFC occasionally for road trips is perfectly fine.
        </p>
        <h3>Avoid Extreme Heat Exposure</h3>
        <p>
          Parking in the shade, using a garage, and pre-conditioning the battery while plugged in are simple ways to reduce thermal stress. Vehicles parked in consistently hot climates (like Phoenix or Houston) tend to show faster degradation than those in mild regions.
        </p>
        <h3>Drive Regularly</h3>
        <p>
          Batteries do better when they cycle regularly than when they sit at a fixed state of charge for weeks. If you store your EV for extended periods, keep the charge level around 50% and check it periodically.
        </p>
      </EducationalContent>

      <FAQSection questions={degradationFAQ} />
      <EmailCapture source="battery-degradation" />
      <RelatedCalculators currentPath="/battery-degradation" />
    </CalculatorLayout>
  );
}
