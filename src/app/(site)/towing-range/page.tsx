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

type Terrain = "flat" | "hilly" | "mountainous";
type Headwind = "none" | "light" | "strong";

const TERRAIN_OPTIONS: { value: Terrain; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "hilly", label: "Hilly" },
  { value: "mountainous", label: "Mountainous" },
];

const HEADWIND_OPTIONS: { value: Headwind; label: string }[] = [
  { value: "none", label: "None" },
  { value: "light", label: "Light (10 to 20 mph)" },
  { value: "strong", label: "Strong (20+ mph)" },
];

const TERRAIN_PENALTY: Record<Terrain, number> = {
  flat: 0,
  hilly: 10,
  mountainous: 20,
};

const HEADWIND_PENALTY: Record<Headwind, number> = {
  none: 0,
  light: 5,
  strong: 10,
};

const TOWING_FAQ = [
  {
    question: "How much range does towing reduce on an EV?",
    answer:
      "Towing typically reduces EV range by 30 to 50 percent, depending on the weight of the trailer, your speed, terrain, and wind conditions. A 3,000 lb trailer at highway speeds on flat roads will reduce range by roughly 20 to 30 percent. Add hills or headwind and reductions can reach 50 to 60 percent.",
  },
  {
    question: "What is the maximum tow rating for most EVs?",
    answer:
      "Tow ratings vary widely. The Tesla Model Y can tow up to 3,500 lbs, the Ford F-150 Lightning handles up to 10,000 lbs, and the Rivian R1T is rated for 11,000 lbs. Smaller EVs like the Model 3 are not rated for towing at all. Always check your vehicle's specific tow rating before hitching up.",
  },
  {
    question: "Why does speed matter so much when towing with an EV?",
    answer:
      "Aerodynamic drag increases with the square of your speed, and a trailer significantly increases your vehicle's frontal area and drag coefficient. Above 55 mph, every additional mile per hour costs disproportionately more energy. Slowing from 70 to 55 mph while towing can recover 15 to 25 percent of your range.",
  },
  {
    question: "How should I plan charging stops when towing?",
    answer:
      "Plan to charge more frequently than you would without a trailer. Use the 80 percent rule: only count on 80 percent of your estimated towing range between stops to account for elevation changes, detours, and battery degradation. Apps like A Better Route Planner (ABRP) let you input your trailer weight for more accurate stop planning.",
  },
  {
    question: "Does regenerative braking help when towing?",
    answer:
      "Yes, regenerative braking recovers more energy when towing because the heavier combined weight means more kinetic energy is available to recapture during deceleration. On hilly terrain, downhill regeneration can partially offset the extra energy used climbing. However, regen alone will not make up for the overall range penalty of towing.",
  },
];

export default function TowingRangePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [towWeight, setTowWeight] = useState(3000);
  const [speed, setSpeed] = useState(60);
  const [terrain, setTerrain] = useState<Terrain>("flat");
  const [headwind, setHeadwind] = useState<Headwind>("none");

  useUrlSync(
    { vehicle: vehicleId, weight: towWeight, speed, terrain, wind: headwind },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.weight) setTowWeight(Math.min(10000, Math.max(500, Number(p.weight))));
      if (p.speed) setSpeed(Math.min(80, Math.max(40, Number(p.speed))));
      if (p.terrain && ["flat", "hilly", "mountainous"].includes(p.terrain)) setTerrain(p.terrain as Terrain);
      if (p.wind && ["none", "light", "strong"].includes(p.wind)) setHeadwind(p.wind as Headwind);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const epaRange = vehicle.epaRangeMiles;

    // Base reduction from weight: weight / 200 as percentage
    const weightReduction = towWeight / 200;

    // Speed factor: above 55 mph, add 1.5% per mph over 55
    const speedReduction = speed > 55 ? (speed - 55) * 1.5 : 0;

    // Terrain and headwind penalties
    const terrainReduction = TERRAIN_PENALTY[terrain];
    const windReduction = HEADWIND_PENALTY[headwind];

    // Total reduction capped at 70%
    const totalReductionPercent = Math.min(
      70,
      weightReduction + speedReduction + terrainReduction + windReduction
    );

    const towingRange = epaRange * (1 - totalReductionPercent / 100);
    const milesLost = epaRange - towingRange;
    const safeTowDistance = towingRange * 0.8;

    // Charging stops for a 300-mile trip
    const chargingStops =
      safeTowDistance > 0 ? Math.ceil(300 / safeTowDistance) - 1 : 0;

    return {
      epaRange,
      towingRange,
      milesLost,
      totalReductionPercent,
      safeTowDistance,
      chargingStops: Math.max(0, chargingStops),
    };
  }, [vehicle, towWeight, speed, terrain, headwind]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const percentRetained = Math.max(0, 100 - results.totalReductionPercent);

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.epaRangeMiles} mi EPA range`}
      />
      <SliderInput
        label="Trailer weight"
        value={towWeight}
        onChange={setTowWeight}
        min={500}
        max={10000}
        step={100}
        unit="lbs"
        showValue
      />
      <SliderInput
        label="Average speed"
        value={speed}
        onChange={setSpeed}
        min={40}
        max={80}
        step={1}
        unit="mph"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Trailer range"
      headline="TOWING RANGE"
      amount={Math.round(results.towingRange)}
      amountPrefix=""
      amountDecimals={0}
      amountUnit=" miles"
      sub={`With a ${towWeight.toLocaleString()} lb trailer at ${speed} mph versus ${Math.round(results.epaRange)} miles EPA. Safe distance between charges: ${Math.round(results.safeTowDistance)} miles.`}
      dialPercent={Math.max(0, Math.min(100, Math.round(percentRetained)))}
      dialLabel="OF EPA"
      morphHero={false}
    >
      <SavingsTile
        label="TOWING RANGE"
        value={Math.round(results.towingRange)}
        prefix=""
        decimals={0}
        unit=" mi"
        tier="brand"
      />
      <SavingsTile
        label="EPA RATING"
        value={Math.round(results.epaRange)}
        prefix=""
        decimals={0}
        unit=" mi"
        tier="mid"
      />
      <SavingsTile
        label="DRAG PENALTY"
        value={Math.round(results.totalReductionPercent)}
        prefix=""
        decimals={0}
        unit="% lost"
        tier="warn"
      />
      <SavingsTile
        label="STOPS (300 MI)"
        value={results.chargingStops}
        prefix=""
        decimals={0}
        unit={results.chargingStops === 1 ? " stop" : " stops"}
        tier="volt"
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Trailer range"
      title="EV Towing Range Calculator"
      quickAnswer="Towing with an EV typically cuts range by 30 to 60 percent. Weight, highway speed, hills, and headwind all stack up fast."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Towing Range Calculator"
        description="Estimate how towing a trailer or heavy load affects your EV's range. Factor in trailer weight, speed, terrain, and headwind to calculate range reduction and plan charging stops."
        url="https://chargemath.com/towing-range"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Towing Range Calculator", url: "https://chargemath.com/towing-range" },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Terrain"
            value={terrain}
            onChange={(v) => setTerrain(v as Terrain)}
            options={TERRAIN_OPTIONS}
          />
          <SelectInput
            label="Headwind"
            value={headwind}
            onChange={(v) => setHeadwind(v as Headwind)}
            options={HEADWIND_OPTIONS}
          />
        </div>
      </details>

      {/* Contextual cross-links */}
      <div className="mt-2 mb-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Full range calculator (all conditions)
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate charging cost for your trip
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Estimate charging time per stop
        </Link>
      </div>

      <EducationalContent>
        <h2>EV Towing: What You Need to Know</h2>
        <p>
          Towing with an electric vehicle is increasingly common as trucks like the Ford F-150 Lightning, Rivian R1T, and Tesla Cybertruck hit the market. But towing dramatically increases energy consumption because of the added weight and aerodynamic drag from the trailer.
        </p>
        <h3>Why Towing Kills EV Range</h3>
        <p>
          Two forces work against you when towing: rolling resistance (proportional to weight) and aerodynamic drag (proportional to speed squared and frontal area). A trailer adds both weight and wind resistance, creating a compounding effect. At 65 mph with a 5,000 lb trailer, you can expect roughly 40 to 50 percent less range than the EPA rating.
        </p>
        <h3>Tips for Maximizing Towing Range</h3>
        <ul>
          <li>Slow down. Dropping from 70 to 55 mph can recover 15 to 25 percent of your towing range. Aerodynamic losses grow exponentially with speed.</li>
          <li>Use an aerodynamic trailer or add a nose cone. Reducing the trailer&apos;s drag coefficient can improve range by 5 to 10 percent.</li>
          <li>Keep tires properly inflated on both the vehicle and trailer. Under-inflation increases rolling resistance significantly.</li>
          <li>Plan charging stops conservatively. Use the 80 percent rule and always have a backup charger in mind.</li>
          <li>Pre-condition the cabin before departing while still plugged in. This avoids using battery energy for climate control early in the trip.</li>
          <li>Check your vehicle&apos;s tow rating before loading up. Exceeding the rated capacity damages the drivetrain and voids warranty coverage.</li>
        </ul>
        <h3>Planning a Towing Trip</h3>
        <p>
          Route planning is critical when towing with an EV. Use apps like A Better Route Planner (ABRP) that let you input trailer weight and get adjusted range estimates. Build in extra time for charging stops. DC fast charging from 10 to 80 percent is the most efficient window, so plan stops around that range.
        </p>
      </EducationalContent>

      <FAQSection questions={TOWING_FAQ} />
      <EmailCapture source="towing-range" />
      <RelatedCalculators currentPath="/towing-range" />
    </CalculatorShell>
  );
}
