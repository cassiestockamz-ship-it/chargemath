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

type DrivingMode = "city" | "highway" | "mix";

/**
 * Piecewise linear interpolation for cold-weather range loss.
 * Data points (tempF -> loss fraction with cabin heating ON):
 *   -20F -> 0.55 (55% loss)
 *     0F -> 0.50 (50% loss)
 *    20F -> 0.40 (40% loss)
 *    40F -> 0.15 (15% loss)
 *    70F -> 0.00 (0% loss, baseline)
 *   100F -> 0.00 (no cold penalty)
 */
function getWinterLossFraction(
  tempF: number,
  cabinHeat: boolean,
  preconditioning: boolean,
  drivingMode: DrivingMode
): number {
  // Piecewise linear: temp breakpoints and corresponding loss with heating
  const points: [number, number][] = [
    [-20, 0.55],
    [0, 0.50],
    [20, 0.40],
    [40, 0.15],
    [70, 0.0],
    [100, 0.0],
  ];

  let heatedLoss: number;

  if (tempF <= points[0][0]) {
    heatedLoss = points[0][1];
  } else if (tempF >= points[points.length - 1][0]) {
    heatedLoss = points[points.length - 1][1];
  } else {
    // Find the two surrounding points and interpolate
    let lower = points[0];
    let upper = points[1];
    for (let i = 0; i < points.length - 1; i++) {
      if (tempF >= points[i][0] && tempF <= points[i + 1][0]) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }
    const ratio = (tempF - lower[0]) / (upper[0] - lower[0]);
    heatedLoss = lower[1] + ratio * (upper[1] - lower[1]);
  }

  // Without cabin heating, the loss is reduced by about 40% (no HVAC draw)
  let loss = cabinHeat ? heatedLoss : heatedLoss * 0.6;

  // Preconditioning recovers about 10% of the loss
  if (preconditioning && loss > 0) {
    loss = loss * 0.9;
  }

  // Highway driving adds another 10% loss (absolute addition scaled to current loss)
  if (drivingMode === "highway") {
    loss = Math.min(loss + 0.10, 0.80);
  } else if (drivingMode === "city") {
    // City driving is slightly better for EVs in cold (regen, lower aero drag)
    loss = loss * 0.95;
  }

  return Math.max(0, Math.min(loss, 0.80));
}

const DRIVING_OPTIONS: { value: DrivingMode; label: string }[] = [
  { value: "city", label: "City Driving" },
  { value: "mix", label: "Mix (City + Highway)" },
  { value: "highway", label: "Highway Driving" },
];

const HEATING_OPTIONS = [
  { value: "on", label: "Cabin Heat On" },
  { value: "off", label: "Cabin Heat Off" },
];

const PRECONDITION_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes (while plugged in)" },
];

const winterFAQs = [
  {
    question: "How much range do EVs lose in cold weather?",
    answer:
      "Most EVs lose 20-40% of their EPA-rated range in cold weather. At 20 degrees Fahrenheit with the cabin heater running, expect about 40% less range than the EPA number. At 0 degrees Fahrenheit, that can climb to 50%. The exact amount depends on your vehicle, driving speed, and whether you use preconditioning.",
  },
  {
    question: "Does turning off cabin heat really help EV range in winter?",
    answer:
      "Yes, cabin heating is one of the biggest energy draws in cold weather. Turning off the main heater and relying on heated seats and a heated steering wheel instead can recover roughly 30-40% of the winter range loss. Heated seats use about 75 watts each versus 3,000-5,000 watts for the cabin heater.",
  },
  {
    question: "What is battery preconditioning and does it help?",
    answer:
      "Battery preconditioning warms the battery pack to its optimal operating temperature before you start driving. When done while the car is still plugged in, it uses grid electricity instead of stored battery energy. This can recover about 10% of your winter range loss and also improves regenerative braking performance.",
  },
  {
    question: "Do heat pump EVs perform better in winter?",
    answer:
      "EVs with heat pumps (like newer Tesla models, Hyundai Ioniq 5, and BMW iX) handle cold weather better than those with resistive heaters. A heat pump moves heat rather than generating it, so it uses 2-3x less energy for cabin heating. This can mean 10-15% better winter range compared to a resistive-heater EV at the same temperature.",
  },
  {
    question: "Should I charge my EV differently in winter?",
    answer:
      "In winter, charge more frequently and keep the battery above 20% when possible. Cold batteries charge slower, so DC fast charging sessions may take longer. If your EV supports it, schedule charging to finish right before you leave so the battery is warm. Avoid letting the battery sit at very low charge in freezing temperatures.",
  },
];

export default function WinterRangePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [temperature, setTemperature] = useState(20);
  const [cabinHeat, setCabinHeat] = useState("on");
  const [drivingMode, setDrivingMode] = useState<DrivingMode>("mix");
  const [preconditioning, setPreconditioning] = useState("no");

  useUrlSync(
    {
      vehicle: vehicleId,
      temp: temperature,
      heat: cabinHeat,
      drive: drivingMode,
      precond: preconditioning,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.temp) setTemperature(Number(p.temp));
      if (p.heat && ["on", "off"].includes(p.heat)) setCabinHeat(p.heat);
      if (p.drive && ["city", "highway", "mix"].includes(p.drive))
        setDrivingMode(p.drive as DrivingMode);
      if (p.precond && ["yes", "no"].includes(p.precond))
        setPreconditioning(p.precond);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const epaRange = vehicle.epaRangeMiles;
    const isHeatOn = cabinHeat === "on";
    const isPrecond = preconditioning === "yes";

    const lossFraction = getWinterLossFraction(
      temperature,
      isHeatOn,
      isPrecond,
      drivingMode
    );

    const winterRange = epaRange * (1 - lossFraction);
    const milesLost = epaRange - winterRange;
    const percentReduction = lossFraction * 100;

    // Charging stops for a 200-mile trip
    // Assume usable range is 90% of estimated (don't run to 0)
    const usableWinterRange = winterRange * 0.9;
    const usableSummerRange = epaRange * 0.9;

    const tripDistance = 200;
    const winterStops =
      usableWinterRange >= tripDistance
        ? 0
        : Math.ceil(tripDistance / usableWinterRange) - 1;
    const summerStops =
      usableSummerRange >= tripDistance
        ? 0
        : Math.ceil(tripDistance / usableSummerRange) - 1;

    return {
      epaRange,
      winterRange,
      milesLost,
      percentReduction,
      lossFraction,
      winterStops,
      summerStops,
      usableWinterRange,
    };
  }, [vehicle, temperature, cabinHeat, drivingMode, preconditioning]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  // Visual bar widths
  const epaBarWidth = 100;
  const winterBarWidth = Math.max(
    5,
    (results.winterRange / results.epaRange) * 100
  );

  return (
    <CalculatorLayout
      title="Winter Range Calculator"
      description="Estimate how cold weather affects your EV's driving range. See your expected winter miles based on temperature, heating, and driving conditions."
      lastUpdated="March 2026"
      intro="Cold weather is the single biggest factor that reduces EV range. Freezing temperatures slow battery chemistry, cabin heating draws significant power, and cold tires increase rolling resistance. This calculator shows exactly how many miles you can expect from your EV in winter conditions."
    >
      <CalculatorSchema
        name="Winter Range Calculator"
        description="Estimate how cold weather affects your EV's range. Calculate winter miles lost from temperature, cabin heating, preconditioning, and driving style for any electric vehicle."
        url="https://chargemath.com/winter-range"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Winter Range Calculator",
            url: "https://chargemath.com/winter-range",
          },
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
          label="Outside Temperature"
          value={temperature}
          onChange={setTemperature}
          min={-20}
          max={100}
          step={1}
          unit="°F"
          showValue
        />

        <SelectInput
          label="Cabin Heating"
          value={cabinHeat}
          onChange={setCabinHeat}
          options={HEATING_OPTIONS}
          helpText="Turning off cabin heat and using seat warmers saves significant range"
        />

        <SelectInput
          label="Driving Style"
          value={drivingMode}
          onChange={(v) => setDrivingMode(v as DrivingMode)}
          options={DRIVING_OPTIONS}
        />

        <SelectInput
          label="Battery Preconditioning"
          value={preconditioning}
          onChange={setPreconditioning}
          options={PRECONDITION_OPTIONS}
          helpText="Warming the battery while plugged in before departure"
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Winter Range Estimate
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Estimated Winter Range"
            value={Math.round(results.winterRange).toLocaleString()}
            unit="miles"
            highlight
            icon="❄️"
          />
          <ResultCard
            label="EPA Rated Range"
            value={Math.round(results.epaRange).toLocaleString()}
            unit="miles"
            icon="📋"
          />
          <ResultCard
            label="Miles Lost to Cold"
            value={Math.round(results.milesLost).toLocaleString()}
            unit="miles"
            icon="📉"
          />
          <ResultCard
            label="Range Reduction"
            value={results.percentReduction.toFixed(1)}
            unit="%"
            icon="🌡️"
          />
          <ResultCard
            label="Winter Charging Stops (200 mi)"
            value={String(results.winterStops)}
            unit={results.winterStops === 1 ? "stop" : "stops"}
            icon="🔌"
          />
          <ResultCard
            label="Summer Charging Stops (200 mi)"
            value={String(results.summerStops)}
            unit={results.summerStops === 1 ? "stop" : "stops"}
            icon="☀️"
          />
        </div>
      </div>

      {/* EPA vs Winter Range Comparison Bar */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          EPA Range vs Winter Range
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          {/* EPA Range Bar */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">
                EPA Rated Range
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {Math.round(results.epaRange)} miles
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="flex h-full items-center justify-end rounded-full pr-3 transition-all duration-500"
                style={{
                  width: `${epaBarWidth}%`,
                  backgroundColor: "var(--color-ev-green)",
                }}
              >
                <span className="text-xs font-bold text-white">100%</span>
              </div>
            </div>
          </div>

          {/* Winter Range Bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">
                Estimated Winter Range
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {Math.round(results.winterRange)} miles
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="flex h-full items-center justify-end rounded-full pr-3 transition-all duration-500"
                style={{
                  width: `${winterBarWidth}%`,
                  backgroundColor: "#3b82f6",
                }}
              >
                <span className="text-xs font-bold text-white">
                  {(100 - results.percentReduction).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Loss callout */}
          {results.milesLost > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Range Lost to Winter Conditions
              </span>
              <span className="text-lg font-bold text-red-500">
                {`-${Math.round(results.milesLost)} miles (${results.percentReduction.toFixed(0)}%)`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Full Range Calculator (all factors) &rarr;
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          How much does charging cost? &rarr;
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Calculate charging time &rarr;
        </Link>
      </div>

      <ShareResults
        title={`Winter Range: ${Math.round(results.winterRange)} miles`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} gets about ${Math.round(results.winterRange)} miles in winter at ${temperature}°F vs ${Math.round(results.epaRange)} miles EPA range. That's a ${results.percentReduction.toFixed(0)}% reduction from cold weather.`}
      />

      <EducationalContent>
        <h2>How Cold Weather Affects EV Range</h2>
        <p>
          Cold temperatures reduce EV range through several mechanisms. Lithium-ion batteries have higher internal resistance in the cold, which reduces the energy they can deliver. Cabin heating draws 3-5 kW continuously, and cold tires have higher rolling resistance. Together, these factors can cut your range by 30-50% in freezing conditions.
        </p>
        <h3>Preconditioning: The Single Best Winter Habit</h3>
        <p>
          Preconditioning means warming your battery and cabin while the car is still plugged into the charger. This uses grid electricity instead of stored battery energy. Most modern EVs let you schedule preconditioning from their app. Starting with a warm battery also means regenerative braking works immediately, which improves efficiency during the first few miles of your drive.
        </p>
        <h3>Seat Heaters vs Cabin Heat</h3>
        <p>
          The cabin heater in an EV typically draws 3,000 to 5,000 watts. A heated seat uses about 50-75 watts, and a heated steering wheel about 30 watts. By switching to seat and wheel heaters and lowering the cabin temperature by 10-15 degrees, you can save a meaningful amount of range. Some drivers report recovering 15-20 miles of range this way on a typical commute.
        </p>
        <h3>Park in a Garage When Possible</h3>
        <p>
          Even an unheated garage keeps your car 10-20 degrees warmer than parking outside overnight. This means a warmer battery in the morning, less preconditioning energy needed, and less cabin heating required. If you have access to a garage with a Level 2 charger, you can precondition the car right before departure and leave with a warm, fully charged battery.
        </p>
        <h3>Plan for Shorter Legs Between Charging Stops</h3>
        <p>
          On winter road trips, plan your charging stops closer together. Instead of pushing for the maximum range between stops, stop every 100-120 miles at DC fast chargers. Cold batteries also charge slower, so expect DC fast charging sessions to take 10-20% longer in freezing weather.
        </p>
      </EducationalContent>

      <FAQSection questions={winterFAQs} />
      <EmailCapture source="winter-range" />
      <RelatedCalculators currentPath="/winter-range" />
    </CalculatorLayout>
  );
}
