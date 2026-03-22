"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import { rangeFAQ } from "@/data/faq-data";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const AMAZON_TAG = "kawaiiguy0f-20";

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

      <ShareResults
        title={`Real Range: ${Math.round(results.adjustedRange)} miles`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} gets ${Math.round(results.adjustedRange)} miles real-world range vs ${Math.round(results.baseRange)} miles EPA at ${startPercent}% battery. That's ${results.percentOfEpa.toFixed(0)}% of EPA range at ${speed} mph and ${temperature}°F.`}
      />

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {temperature < 40 && (
            <AffiliateCard
              title="EV Winter Kit"
              description="Stay warm and protect your range in cold weather with insulated covers, battery warmers, and winter accessories designed for EVs."
              priceRange="$25 - $60"
              amazonTag={AMAZON_TAG}
              searchQuery="electric car winter accessories kit"
              imageAlt="EV winter accessories kit on Amazon"
            />
          )}
          {cargo === "towing" && (
            <AffiliateCard
              title="EV Towing Accessories"
              description="Hitch accessories, wiring harnesses, and towing gear designed for electric vehicles. Tow safely and maximize your range."
              priceRange="$50 - $200"
              amazonTag={AMAZON_TAG}
              searchQuery="electric vehicle towing hitch accessories"
              imageAlt="EV towing hitch accessories on Amazon"
            />
          )}
          <AffiliateCard
            title="Tire Pressure Gauge"
            description="Proper tire pressure can improve your EV range by up to 3%. A quality digital gauge ensures accuracy every time."
            priceRange="$8 - $20"
            amazonTag={AMAZON_TAG}
            searchQuery="digital tire pressure gauge accurate"
            imageAlt="Digital tire pressure gauge on Amazon"
          />
          <AffiliateCard
            title="EV Charging Cable Bag"
            description="Keep your charging cables organized and protected. Durable bags with compartments for adapters, cables, and accessories."
            priceRange="$15 - $35"
            amazonTag={AMAZON_TAG}
            searchQuery="ev charging cable bag organizer"
            imageAlt="EV charging cable bag organizer on Amazon"
          />
        </div>
      </div>

      <FAQSection questions={rangeFAQ} />
      <RelatedCalculators currentPath="/range" />
    </CalculatorLayout>
  );
}
