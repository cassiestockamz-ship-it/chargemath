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

    // Individual impact breakdown (miles lost per factor)
    const tempLoss = baseRange * (1 - tempFactor);
    const speedLoss = baseRange * tempFactor * (1 - speedFactor);
    const climateLoss =
      baseRange * tempFactor * speedFactor * (1 - climateFactor);
    const terrainLoss =
      baseRange *
      tempFactor *
      speedFactor *
      climateFactor *
      (1 - terrainFactor);
    const cargoLoss =
      baseRange *
      tempFactor *
      speedFactor *
      climateFactor *
      terrainFactor *
      (1 - cargoFactor);

    return {
      adjustedRange,
      baseRange,
      rangeReduction,
      percentOfEpa,
      adjustedEfficiency,
      combinedFactor,
      factors: {
        temp: { factor: tempFactor, loss: tempLoss },
        speed: { factor: speedFactor, loss: speedLoss },
        climate: { factor: climateFactor, loss: climateLoss },
        terrain: { factor: terrainFactor, loss: terrainLoss },
        cargo: { factor: cargoFactor, loss: cargoLoss },
      },
    };
  }, [vehicle, startPercent, temperature, speed, climate, terrain, cargo]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  // Sort impact factors by loss (descending) for the breakdown
  const impactBreakdown = [
    { label: "Temperature", loss: results.factors.temp.loss, color: "var(--color-ev-green)" },
    { label: "Speed", loss: results.factors.speed.loss, color: "#3b82f6" },
    { label: "Climate Control", loss: results.factors.climate.loss, color: "#f59e0b" },
    { label: "Terrain", loss: results.factors.terrain.loss, color: "#8b5cf6" },
    { label: "Cargo / Passengers", loss: results.factors.cargo.loss, color: "#ef4444" },
  ].sort((a, b) => b.loss - a.loss);

  const totalLoss = impactBreakdown.reduce((sum, f) => sum + f.loss, 0);

  return (
    <CalculatorLayout
      title="EV Range Calculator"
      description="See how temperature, speed, terrain, and other real-world conditions affect your EV's range compared to its EPA rating."
      lastUpdated="March 2026"
      intro="Real-world EV range is typically 10-20% less than the EPA rating. Cold weather can reduce range by 30-40%, highway speeds over 75 mph cut range by 15-25%, and towing can halve your range. This calculator shows exactly how each factor affects your specific vehicle."
    >
      <CalculatorSchema
        name="EV Range Calculator"
        description="Calculate your EV's real-world range based on temperature, speed, terrain, climate control, and cargo. See how each factor reduces your EPA-rated range."
        url="https://chargemath.com/range"
      />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "Range Calculator", url: "https://chargemath.com/range"}]} />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery • ${vehicle.epaRangeMiles} mi EPA range`}
        />

        <SliderInput
          label="Starting Battery %"
          value={startPercent}
          onChange={setStartPercent}
          min={5}
          max={100}
          step={1}
          unit="%"
          showValue
        />

        <SliderInput
          label="Outside Temperature"
          value={temperature}
          onChange={setTemperature}
          min={-10}
          max={110}
          step={1}
          unit="°F"
          showValue
        />

        <SliderInput
          label="Average Speed"
          value={speed}
          onChange={setSpeed}
          min={25}
          max={85}
          step={1}
          unit="mph"
          showValue
        />

        <SelectInput
          label="Climate Control"
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
          label="Cargo / Passengers"
          value={cargo}
          onChange={(v) => setCargo(v as Cargo)}
          options={CARGO_OPTIONS}
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Range Estimates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Estimated Real-World Range"
            value={Math.round(results.adjustedRange).toLocaleString()}
            unit="miles"
            highlight
            icon="🗺️"
          />
          <ResultCard
            label="EPA Range (at battery %)"
            value={Math.round(results.baseRange).toLocaleString()}
            unit="miles"
            icon="📋"
          />
          <ResultCard
            label="Range Reduction"
            value={Math.round(results.rangeReduction).toLocaleString()}
            unit="miles lost"
            icon="📉"
          />
          <ResultCard
            label="% of EPA Range"
            value={results.percentOfEpa.toFixed(1)}
            unit="%"
            icon="🎯"
          />
          <ResultCard
            label="Adjusted Efficiency"
            value={results.adjustedEfficiency.toFixed(1)}
            unit="kWh/100mi"
            icon="⚡"
          />
        </div>
      </div>

      {/* Range Impact Breakdown */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Range Impact Breakdown
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          {/* Stacked bar */}
          {totalLoss > 0 && (
            <div className="mb-5">
              <div className="flex h-8 w-full overflow-hidden rounded-full">
                {impactBreakdown.map(
                  (f) =>
                    f.loss > 0 && (
                      <div
                        key={f.label}
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(f.loss / totalLoss) * 100}%`,
                          backgroundColor: f.color,
                          minWidth: f.loss > 0 ? "4px" : "0",
                        }}
                        title={`${f.label}: -${Math.round(f.loss)} mi`}
                      />
                    )
                )}
              </div>
            </div>
          )}

          {/* Factor rows */}
          <div className="space-y-3">
            {impactBreakdown.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                <span className="min-w-[140px] text-sm font-medium text-[var(--color-text)]">
                  {f.label}
                </span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width:
                          results.baseRange > 0
                            ? `${(f.loss / results.baseRange) * 100}%`
                            : "0%",
                        backgroundColor: f.color,
                      }}
                    />
                  </div>
                </div>
                <span className="min-w-[80px] text-right text-sm font-semibold text-[var(--color-text)]">
                  {f.loss > 0.5 ? `−${Math.round(f.loss)} mi` : "No impact"}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Total Range Lost
            </span>
            <span className="text-lg font-bold text-[var(--color-text)]">
              {totalLoss > 0.5
                ? `−${Math.round(totalLoss)} miles`
                : "No range loss"}
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
          How much does this range cost? →
        </Link>
        <Link href="/charging-time" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
          Calculate charging time →
        </Link>
        <Link href="/gas-vs-electric" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
          Compare gas vs electric costs →
        </Link>
      </div>

      <ShareResults
        title={`Real Range: ${Math.round(results.adjustedRange)} miles`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} gets ${Math.round(results.adjustedRange)} miles real-world range vs ${Math.round(results.baseRange)} miles EPA at ${startPercent}% battery. That's ${results.percentOfEpa.toFixed(0)}% of EPA range at ${speed} mph and ${temperature}°F.`}
      />

      <EducationalContent>
        <h2>How Real-World EV Range Is Calculated</h2>
        <p>
          This calculator starts with your vehicle&apos;s EPA-rated range and applies multiplicative reduction factors for temperature, speed, climate control, terrain, and cargo weight. Each factor is based on published research from organizations including AAA, Idaho National Laboratory, and Recurrent Auto.
        </p>
        <h3>Why EPA Range Doesn&apos;t Match Reality</h3>
        <p>
          The EPA tests vehicles on a dynamometer at 73°F with no climate control, no wind, and a standardized drive cycle averaging about 48 mph. Real driving includes highway speeds, temperature extremes, hills, and passenger weight, all of which reduce efficiency. Most drivers see 10-20% less range than the EPA rating under normal conditions, and up to 40% less in extreme cold.
        </p>
        <h3>Maximizing Your Range</h3>
        <ul>
          <li>Tire pressure matters. Under-inflated tires can reduce range by 3-5%. Check monthly and inflate to the door placard spec, not the tire sidewall maximum.</li>
          <li>Pre-condition while plugged in. Heating or cooling the cabin while still connected to the charger preserves battery energy for driving.</li>
          <li>Use seat heaters instead of cabin heat. Heated seats and steering wheel use 75% less energy than the climate system.</li>
          <li>Slow down on highways. Aerodynamic drag increases with the square of speed. Driving 65 mph instead of 75 mph can recover 10-15% of range.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={rangeFAQ} />
      <EmailCapture source="range" />
      <RelatedCalculators currentPath="/range" />
    </CalculatorLayout>
  );
}
