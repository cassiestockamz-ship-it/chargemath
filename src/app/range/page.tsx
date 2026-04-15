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
import { rangeFAQ } from "@/data/faq-data";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type ClimateControl = "off" | "ac" | "heat" | "heat_seats";
type Terrain = "flat" | "hilly" | "mountainous";
type Cargo = "driver" | "two_passengers" | "full" | "towing";

function getTempFactor(tempF: number): number {
  if (tempF < 20) return 0.59;
  if (tempF <= 32) return 0.68;
  if (tempF <= 50) return 0.82;
  if (tempF <= 60) return 0.92;
  if (tempF <= 80) return 1.0;
  if (tempF <= 95) return 0.97;
  return 0.83;
}

function getSpeedFactor(mph: number): number {
  if (mph <= 35) return 1.2;
  if (mph <= 45) return 1.15;
  if (mph <= 55) return 1.08;
  if (mph <= 65) return 1.0;
  if (mph <= 75) return 0.88;
  return 0.75;
}

const CLIMATE_FACTORS: Record<ClimateControl, number> = {
  off: 1.0,
  ac: 0.95,
  heat: 0.83,
  heat_seats: 0.88,
};

const TERRAIN_FACTORS: Record<Terrain, number> = {
  flat: 1.0,
  hilly: 0.9,
  mountainous: 0.75,
};

const CARGO_FACTORS: Record<Cargo, number> = {
  driver: 1.0,
  two_passengers: 0.97,
  full: 0.92,
  towing: 0.55,
};

const CLIMATE_OPTIONS: { value: ClimateControl; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "ac", label: "AC On" },
  { value: "heat", label: "Heat On" },
  { value: "heat_seats", label: "Heat + Seat Warmers" },
];

const TERRAIN_OPTIONS: { value: Terrain; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "hilly", label: "Hilly" },
  { value: "mountainous", label: "Mountainous" },
];

const CARGO_OPTIONS: { value: Cargo; label: string }[] = [
  { value: "driver", label: "Driver only" },
  { value: "two_passengers", label: "2 passengers" },
  { value: "full", label: "Full car + cargo" },
  { value: "towing", label: "Towing" },
];

export default function RangePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [startPercent, setStartPercent] = useState(100);
  const [temperature, setTemperature] = useState(70);
  const [speed, setSpeed] = useState(65);
  const [climate, setClimate] = useState<ClimateControl>("off");
  const [terrain, setTerrain] = useState<Terrain>("flat");
  const [cargo, setCargo] = useState<Cargo>("driver");

  useUrlSync(
    { vehicle: vehicleId, battery: startPercent, temp: temperature, speed, climate, terrain, cargo },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.battery) setStartPercent(Number(p.battery));
      if (p.temp) setTemperature(Number(p.temp));
      if (p.speed) setSpeed(Number(p.speed));
      if (p.climate && ["off", "ac", "heat", "heat_seats"].includes(p.climate)) setClimate(p.climate as ClimateControl);
      if (p.terrain && ["flat", "hilly", "mountainous"].includes(p.terrain)) setTerrain(p.terrain as Terrain);
      if (p.cargo && ["driver", "two_passengers", "full", "towing"].includes(p.cargo)) setCargo(p.cargo as Cargo);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const epaRange = vehicle.epaRangeMiles;
    const baseRange = epaRange * (startPercent / 100);

    const tempFactor = getTempFactor(temperature);
    const speedFactor = getSpeedFactor(speed);
    const climateFactor = CLIMATE_FACTORS[climate];
    const terrainFactor = TERRAIN_FACTORS[terrain];
    const cargoFactor = CARGO_FACTORS[cargo];

    const combinedFactor =
      tempFactor * speedFactor * climateFactor * terrainFactor * cargoFactor;

    const adjustedRange = baseRange * combinedFactor;
    const rangeReduction = baseRange - adjustedRange;
    const percentOfEpa =
      baseRange > 0 ? (adjustedRange / baseRange) * 100 : 0;
    const adjustedEfficiency = vehicle.kwhPer100Miles / combinedFactor;

    // mi/kWh derived for the hero tile
    const miPerKwh = adjustedEfficiency > 0 ? 100 / adjustedEfficiency : 0;

    return {
      adjustedRange,
      baseRange,
      rangeReduction,
      percentOfEpa,
      adjustedEfficiency,
      miPerKwh,
      combinedFactor,
    };
  }, [vehicle, startPercent, temperature, speed, climate, terrain, cargo]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const pctOfEpa = Math.round(results.percentOfEpa);
  const rangeLost = Math.max(0, Math.round(results.baseRange - results.adjustedRange));

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
        label="Average speed"
        value={speed}
        onChange={setSpeed}
        min={25}
        max={85}
        step={1}
        unit="mph"
        showValue
      />
      <SliderInput
        label="Outside temp"
        value={temperature}
        onChange={setTemperature}
        min={-10}
        max={110}
        step={1}
        unit="°F"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <SliderInput
            label="Starting battery"
            value={startPercent}
            onChange={setStartPercent}
            min={5}
            max={100}
            step={1}
            unit="%"
            showValue
          />
          <SelectInput
            label="Climate control"
            value={climate}
            onChange={(v) => setClimate(v as ClimateControl)}
            options={CLIMATE_OPTIONS}
          />
          <SelectInput
            label="Terrain"
            value={terrain}
            onChange={(v) => setTerrain(v as Terrain)}
            options={TERRAIN_OPTIONS}
          />
          <SelectInput
            label="Cargo / passengers"
            value={cargo}
            onChange={(v) => setCargo(v as Cargo)}
            options={CARGO_OPTIONS}
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Real range"
      headline="YOU GET"
      amount={Math.round(results.adjustedRange)}
      amountUnit=" miles"
      sub={`Versus the EPA rating of ${vehicle.epaRangeMiles} miles. That is about ${pctOfEpa}% of sticker.`}
      dialPercent={Math.min(100, Math.max(0, Math.round((results.adjustedRange / vehicle.epaRangeMiles) * 100)))}
      dialLabel="OF EPA"
      morphHero={false}
    >
      <SavingsTile
        label="REAL RANGE"
        value={Math.round(results.adjustedRange)}
        unit=" mi"
        tier="brand"
      />
      <SavingsTile
        label="EPA RATING"
        value={vehicle.epaRangeMiles}
        unit=" mi"
        tier="mid"
      />
      <SavingsTile
        label="EFFICIENCY"
        value={results.miPerKwh}
        decimals={1}
        unit=" mi/kWh"
        tier="good"
      />
      <SavingsTile
        label="RANGE LOST"
        value={rangeLost}
        unit=" mi"
        tier="warn"
      />
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Range Calculator"
        description="Calculate your EV's real-world range based on temperature, speed, terrain, climate control, and cargo. See how each factor reduces your EPA-rated range."
        url="https://chargemath.com/range"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Range Calculator", url: "https://chargemath.com/range" },
        ]}
      />
      <CalculatorShell
        eyebrow="Real range"
        title="EV Range Calculator"
        quickAnswer="Real world EV range typically falls 10 to 30 percent below the EPA sticker, depending on speed, temperature, and terrain."
        inputs={inputs}
        hero={hero}
      >
        {/* Cross-link chips */}
        <div className="mt-2 mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            How much does this range cost?
          </Link>
          <Link
            href="/charging-time"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate charging time
          </Link>
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Compare gas vs electric costs
          </Link>
        </div>

        <EducationalContent>
          <h2>How Real-World EV Range Is Calculated</h2>
          <p>
            This calculator starts with your vehicle&apos;s EPA-rated range and applies multiplicative reduction factors for temperature, speed, climate control, terrain, and cargo weight. Each factor is based on published research from organizations including AAA, Idaho National Laboratory, and Recurrent Auto.
          </p>
          <h3>Why EPA Range Doesn&apos;t Match Reality</h3>
          <p>
            The EPA tests vehicles on a dynamometer at 73°F with no climate control, no wind, and a standardized drive cycle averaging about 48 mph. Real driving includes highway speeds, temperature extremes, hills, and passenger weight, all of which reduce efficiency. Most drivers see 10 to 20 percent less range than the EPA rating under normal conditions, and up to 40 percent less in extreme cold.
          </p>
          <h3>Maximizing Your Range</h3>
          <ul>
            <li>Tire pressure matters. Under-inflated tires can reduce range by 3 to 5 percent. Check monthly and inflate to the door placard spec, not the tire sidewall maximum.</li>
            <li>Pre-condition while plugged in. Heating or cooling the cabin while still connected to the charger preserves battery energy for driving.</li>
            <li>Use seat heaters instead of cabin heat. Heated seats and steering wheel use 75 percent less energy than the climate system.</li>
            <li>Slow down on highways. Aerodynamic drag increases with the square of speed. Driving 65 mph instead of 75 mph can recover 10 to 15 percent of range.</li>
          </ul>
        </EducationalContent>
        <FAQSection questions={rangeFAQ} />
        <EmailCapture source="range" />
        <RelatedCalculators currentPath="/range" />
      </CalculatorShell>
    </>
  );
}
