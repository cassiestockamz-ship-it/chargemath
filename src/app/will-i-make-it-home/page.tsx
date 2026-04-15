"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import RelatedCalculators from "@/components/RelatedCalculators";
import Link from "next/link";
import { EV_VEHICLES } from "@/data/ev-vehicles";

/**
 * Will-I-Make-It-Home model
 *
 * Efficiency (kWh/mi) is adjusted for three factors:
 *   - Temperature: data from Recurrent 2023 cold-weather study. Average EV
 *     loses ~12% at 32F, ~24% at 20F, ~40% at 0F, ~50% at -10F vs 70F baseline.
 *   - Speed: Bjorn Nyland 90/110 km/h tests + InsideEVs 70mph ratings. Efficiency
 *     drops roughly (1 + 0.015*(mph - 50)) above 50mph, flat below.
 *   - Cabin heat: drawing 2 kW of heat at 30mph adds ~67 Wh/mi. We model this as
 *     a fixed kWh-per-hour penalty based on heater setting.
 *
 * Reserve: we assume true 0% is hard fail. Model predicts arrival SOC; a
 * real-world buffer of 8% is suggested as the safe threshold.
 */

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const heatOptions = [
  { value: "0", label: "Off / vent only (0 kW)" },
  { value: "1.5", label: "Low / defrost (1.5 kW)" },
  { value: "3", label: "Medium / cold day (3 kW)" },
  { value: "5", label: "Max / very cold (5 kW)" },
];

function tempMultiplier(tempF: number): number {
  // Linear interpolation on Recurrent 2023 cold-weather data
  // tempF : lossPct
  const points: [number, number][] = [
    [-20, 0.65],
    [-10, 0.55],
    [0, 0.4],
    [10, 0.32],
    [20, 0.24],
    [30, 0.14],
    [40, 0.08],
    [50, 0.04],
    [60, 0.01],
    [70, 0.0],
    [80, 0.02],
    [90, 0.05],
    [100, 0.08],
  ];
  if (tempF <= points[0][0]) return 1 + points[0][1];
  if (tempF >= points[points.length - 1][0])
    return 1 + points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [t0, l0] = points[i];
    const [t1, l1] = points[i + 1];
    if (tempF >= t0 && tempF <= t1) {
      const frac = (tempF - t0) / (t1 - t0);
      return 1 + (l0 + frac * (l1 - l0));
    }
  }
  return 1;
}

function speedMultiplier(mph: number): number {
  if (mph <= 50) return 1;
  return 1 + 0.015 * (mph - 50);
}

export default function WillIMakeItHomePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [startSoc, setStartSoc] = useState(28);
  const [distance, setDistance] = useState(42);
  const [speed, setSpeed] = useState(65);
  const [tempF, setTempF] = useState(32);
  const [heatKw, setHeatKw] = useState("3");
  const [elevation, setElevation] = useState(0);
  const [headwind, setHeadwind] = useState(0);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const r = useMemo(() => {
    const vehicle = EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0];
    const baseKwhPerMile = vehicle.kwhPer100Miles / 100;

    const tMult = tempMultiplier(tempF);
    const sMult = speedMultiplier(speed);

    // Cabin heat as kWh per mile at the chosen speed
    const heatKwNum = Number(heatKw);
    const hoursAtSpeed = 1 / speed; // hours to drive 1 mile
    const heatKwhPerMile = heatKwNum * hoursAtSpeed;

    // Elevation: each ft of gain costs ~0.12 Wh, each ft of loss returns ~60% via regen
    // (net assumption for a mixed route)
    const elevWhPerMile = (elevation / distance) * 0.12;
    const elevKwhPerMile = elevWhPerMile / 1000;

    // Headwind: model +10mph headwind as ~8% extra energy
    const windMult = 1 + Math.max(0, headwind) * 0.008;

    const effectiveKwhPerMile =
      (baseKwhPerMile * tMult * sMult + heatKwhPerMile + elevKwhPerMile) *
      windMult;

    const startKwh = (startSoc / 100) * vehicle.batteryCapacityKwh;
    const energyNeededKwh = effectiveKwhPerMile * distance;
    const arrivalKwh = startKwh - energyNeededKwh;
    const arrivalSoc = (arrivalKwh / vehicle.batteryCapacityKwh) * 100;

    let verdict: "go" | "marginal" | "nope";
    let verdictText: string;
    let advice: string[];
    if (arrivalSoc >= 10) {
      verdict = "go";
      verdictText = "You make it home comfortably.";
      advice = [
        `Arrive with ~${fmt(arrivalSoc, 0)}% battery remaining.`,
        "Drive normally.",
      ];
    } else if (arrivalSoc >= 0) {
      verdict = "marginal";
      verdictText = "You make it, but cut it close. Be conservative.";
      advice = [];
      const dropMph = 10;
      const saferSpeed = Math.max(45, speed - dropMph);
      const saferSMult = speedMultiplier(saferSpeed);
      const saferKwhPerMile =
        (baseKwhPerMile * tMult * saferSMult + heatKwhPerMile + elevKwhPerMile) *
        windMult;
      const saferArrivalSoc =
        ((startKwh - saferKwhPerMile * distance) / vehicle.batteryCapacityKwh) * 100;
      advice.push(
        `Drop to ${saferSpeed} mph and arrival SOC improves to about ${fmt(saferArrivalSoc, 0)}%.`
      );
      advice.push("Turn heat down to 1.5 kW or lower. Use seat heaters instead.");
      advice.push("Draft behind a truck if you can do it safely.");
    } else {
      verdict = "nope";
      verdictText = `You run out of battery about ${fmt((Math.abs(arrivalKwh) / effectiveKwhPerMile), 0)} miles short. Detour to a charger.`;
      advice = [
        "Detour to the nearest DC fast charger before you get stuck.",
        "Check PlugShare or A Better Route Planner for options on your route.",
        "Drop speed to 55 mph or below to stretch remaining range.",
        "Turn heat off. Use seat heaters only.",
      ];
    }

    // Compute max speed that still gets you home
    let maxSafeSpeed = 55;
    for (let test = 45; test <= 85; test++) {
      const testKwhPerMile =
        (baseKwhPerMile * tMult * speedMultiplier(test) +
          heatKwNum * (1 / test) +
          elevKwhPerMile) *
        windMult;
      const testArrival =
        ((startKwh - testKwhPerMile * distance) / vehicle.batteryCapacityKwh) * 100;
      if (testArrival >= 8) maxSafeSpeed = test;
    }

    return {
      vehicle,
      arrivalSoc,
      arrivalKwh,
      energyNeededKwh,
      effectiveKwhPerMile,
      verdict,
      verdictText,
      advice,
      maxSafeSpeed,
      tMult,
      sMult,
    };
  }, [vehicleId, startSoc, distance, speed, tempF, heatKw, elevation, headwind]);

  const verdictColor =
    r.verdict === "go"
      ? "text-emerald-600"
      : r.verdict === "marginal"
        ? "text-amber-600"
        : "text-rose-600";
  const verdictBg =
    r.verdict === "go"
      ? "bg-emerald-50 border-emerald-300"
      : r.verdict === "marginal"
        ? "bg-amber-50 border-amber-300"
        : "bg-rose-50 border-rose-300";
  const verdictEmoji = r.verdict === "go" ? "🟢" : r.verdict === "marginal" ? "🟡" : "🔴";
  const verdictLabel = r.verdict === "go" ? "GO" : r.verdict === "marginal" ? "MARGINAL" : "NOPE";

  return (
    <CalculatorLayout
      title="Will I Make It Home?"
      description="EV panic calculator. Enter your current battery, distance, temperature and speed. Get a real-world arrival SOC with a traffic-light verdict in 10 seconds."
      answerBlock={
        <p>
          <strong>Quick answer:</strong> Your real-world arrival battery percentage depends on
          temperature, speed, cabin heat, elevation, and wind, not just miles divided by
          EPA range. At 32°F and 65 mph with moderate heat, most EVs use{" "}
          <strong>20-30% more energy per mile</strong> than their EPA rating suggests. This
          tool runs a full-energy balance for your exact car, your exact conditions, and
          tells you GO (10%+ arrival), MARGINAL (slow down), or NOPE (detour to a charger now).
        </p>
      }
      lastUpdated="April 2026"
    >
      <CalculatorSchema
        name="Will I Make It Home EV Panic Calculator"
        description="Real-world EV arrival SOC calculator with temperature, speed, cabin heat, and elevation. Traffic-light verdict in 10 seconds. Free."
        url="https://chargemath.com/will-i-make-it-home"
        featureList={[
          "Real-world temperature correction from Recurrent data",
          "Speed and cabin heat energy model",
          "Elevation and headwind adjustment",
          "Traffic-light GO / MARGINAL / NOPE verdict",
          "Max safe speed suggestion",
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Will I Make It Home", url: "https://chargemath.com/will-i-make-it-home" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${r.vehicle.batteryCapacityKwh} kWh battery · ${r.vehicle.kwhPer100Miles} kWh/100mi EPA`}
        />
        <div>
          <SliderInput
            label="Current battery"
            value={startSoc}
            onChange={setStartSoc}
            min={1}
            max={100}
            step={1}
            unit="%"
            showValue
          />
        </div>
        <NumberInput
          label="Distance to destination"
          value={distance}
          onChange={setDistance}
          min={1}
          max={500}
          step={1}
          unit="mi"
        />
        <div>
          <SliderInput
            label="Typical driving speed"
            value={speed}
            onChange={setSpeed}
            min={35}
            max={85}
            step={1}
            unit="mph"
            showValue
          />
        </div>
        <div>
          <SliderInput
            label="Outside temperature"
            value={tempF}
            onChange={setTempF}
            min={-20}
            max={110}
            step={1}
            unit="°F"
            showValue
          />
        </div>
        <SelectInput
          label="Cabin heat setting"
          value={heatKw}
          onChange={setHeatKw}
          options={heatOptions}
        />
        <NumberInput
          label="Net elevation gain"
          value={elevation}
          onChange={setElevation}
          min={-5000}
          max={10000}
          step={100}
          unit="ft"
          helpText="Negative if mostly downhill. Leave at 0 for flat."
        />
        <NumberInput
          label="Headwind"
          value={headwind}
          onChange={setHeadwind}
          min={0}
          max={40}
          step={1}
          unit="mph"
          helpText="From a weather app or just eyeball it."
        />
      </div>

      {/* Verdict */}
      <div
        className={`mt-10 rounded-3xl border-2 ${verdictBg} p-8 text-center shadow-sm`}
        data-verdict={r.verdict}
      >
        <div className="text-6xl">{verdictEmoji}</div>
        <div className={`mt-3 text-5xl font-black ${verdictColor}`}>
          {verdictLabel}
        </div>
        <div className="mt-3 text-2xl font-bold text-[var(--color-text)]">
          Arrival: {fmt(r.arrivalSoc, 0)}%
        </div>
        <p className="mt-4 mx-auto max-w-2xl text-base text-[var(--color-text)]">
          {r.verdictText}
        </p>
        {r.advice.length > 0 && (
          <ul className="mx-auto mt-4 max-w-xl space-y-1 text-left text-sm text-[var(--color-text)]">
            {r.advice.map((line) => (
              <li key={line} className="before:mr-2 before:content-['→']">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ResultCard
          label="Energy needed"
          value={`${fmt(r.energyNeededKwh, 1)}`}
          unit="kWh"
          icon="🔋"
        />
        <ResultCard
          label="Real efficiency"
          value={`${fmt(r.effectiveKwhPerMile * 100, 1)}`}
          unit="kWh/100mi"
          icon="📏"
        />
        <ResultCard
          label="Max safe speed"
          value={`${r.maxSafeSpeed}`}
          unit="mph"
          icon="🛑"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/winter-range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          How much range do I lose in winter? →
        </Link>
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Normal-conditions range →
        </Link>
        <Link
          href="/road-trip"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Road trip planner →
        </Link>
      </div>

      <ShareResults
        title={`Will I make it home? ${verdictLabel}, ${fmt(r.arrivalSoc, 0)}%`}
        text={`${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} at ${startSoc}% SOC going ${distance} mi in ${tempF}°F. Predicted arrival: ${fmt(r.arrivalSoc, 0)}%. Verdict: ${verdictLabel}.`}
        card={{
          headline: `${fmt(r.arrivalSoc, 0)}%`,
          label: `Arrival SOC: ${verdictLabel}`,
          sub: `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} · ${distance} mi at ${tempF}°F, ${speed} mph`,
          calc: "will-i-make-it-home",
        }}
      />

      {/* Related-tool chips for a panicked user who wants more context */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Real-world range calculator
        </Link>
        <Link
          href="/winter-range-forecast"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          7-day winter range forecast
        </Link>
        <Link
          href="/road-trip"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Plan your next road trip
        </Link>
      </div>

      <EducationalContent>
        <h2>What Makes This Different From Your Car&apos;s GOM</h2>
        <p>
          Your dash&apos;s guess-o-meter (GOM) is mostly a rolling average of recent
          efficiency. It does not know what the road ahead looks like. If you just spent 20
          minutes on flat highway at 65 mph, it will happily predict that same efficiency
          for the next 40 miles, even if the next 40 are uphill into a 25 mph headwind at 5°F.
          This calculator runs an actual energy balance: starting energy, energy per mile
          at your conditions, and arrival SOC.
        </p>
        <h3>The Temperature Curve We Use</h3>
        <p>
          EVs lose energy in cold weather for three reasons: battery chemistry slows down
          (internal resistance increases), cabin heat is expensive (resistive heat pulls
          1-5 kW, heat pumps only help above ~20°F), and viscous losses go up (cold tires,
          cold motor bearings, cold lubricants). Recurrent Motors tracked 10,000+ EVs across
          model years and found the average modern EV loses about 12% of range at 32°F, 24%
          at 20°F, 40% at 0°F, and around 50% at -10°F vs a 70°F baseline. Those numbers are
          interpolated inside this calculator.
        </p>
        <h3>The Speed Correction</h3>
        <p>
          Aerodynamic drag scales with the square of velocity, but energy-to-overcome-drag
          scales with the cube. That means every mph above ~50 mph costs proportionally more
          energy than the last. Bjorn Nyland&apos;s 90 km/h and 110 km/h tests and
          InsideEVs&apos;s 70 mph highway range tests consistently show a penalty of about
          1.5% per mph above 50 mph. We apply that as a linear multiplier.
        </p>
        <h3>When To Actually Listen To This Tool</h3>
        <ul>
          <li>
            <strong>Trust it for the direction</strong> (go / marginal / nope). It&apos;s
            unlikely to be wrong by a full category if your inputs are honest.
          </li>
          <li>
            <strong>Pad the answer</strong>. Arrive with 8-10% minimum. Unexpected detours,
            traffic idle time, and rolling elevation that averages flat but includes big
            climbs will all nibble at your margin.
          </li>
          <li>
            <strong>Heat pump advantage:</strong> if your EV has a heat pump and it&apos;s
            warmer than about 20°F, you use less cabin heat energy than this calculator
            assumes. Subtract about 30% from the heat penalty.
          </li>
          <li>
            <strong>DC fast charging changes everything.</strong> A 5-minute detour for a
            10% top-up is almost always worth it vs crawling home at 45 mph.
          </li>
        </ul>
        <h3>Sources</h3>
        <ul>
          <li>Recurrent Motors 2023 cold-weather range study (10,000+ EVs)</li>
          <li>InsideEVs 70 mph highway range tests</li>
          <li>Bjorn Nyland 90/110 km/h EV range tests</li>
          <li>SAE J1634 EV range test procedure</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={panicFAQ} />
      <RelatedCalculators currentPath="/will-i-make-it-home" />
    </CalculatorLayout>
  );
}

const panicFAQ = [
  {
    question: "Can I trust this more than my car's dash range estimate?",
    answer:
      "For 'will I make it' questions, yes. Your dash's guess-o-meter is a rolling average of recent efficiency and doesn't account for what the road ahead is actually going to be like. This calculator runs a full energy balance using temperature, speed, cabin heat, elevation, and wind. That said, pad the answer. Arrive with at least 8-10% for safety.",
  },
  {
    question: "Why does cabin heat matter so much in winter?",
    answer:
      "Resistive cabin heat pulls 2-5 kW continuously. At 30 mph, that's 67-167 Wh per mile of pure heat penalty on top of the temperature effect on the battery itself. That's why this calculator asks for your heat setting separately. Seat heaters (~60 W) and steering wheel warmers (~40 W) are dramatically cheaper. If you're genuinely worried about making it home, turn cabin heat down and use those.",
  },
  {
    question: "Does the calculator handle heat pumps?",
    answer:
      "Indirectly. If you select a lower cabin heat setting, the energy penalty drops. Modern heat pumps (Tesla, Ioniq 5, Mach-E post-2023, etc.) are genuinely about 50% more efficient than resistive heat above 20°F. A reasonable approximation: if your car has a heat pump and the temperature is above 20°F, pick the heat setting one notch lower than you'd otherwise use.",
  },
  {
    question: "What if I have a big elevation drop at the end of my route?",
    answer:
      "Regenerative braking recovers roughly 60-70% of the potential energy from a downhill. The elevation field nets gain minus recovery, so enter the NET gain to your destination. If you're going 500 ft downhill over the route, enter -500. The tool will credit you for the regen.",
  },
  {
    question: "I'm below 10% and the verdict says GO. Is that really safe?",
    answer:
      "Technically yes, but most EVs reduce power output below 10% SOC (limp mode) and the bottom 2-3% is usually padding you don't want to touch. If the tool says GO with an arrival SOC under 10%, treat it like MARGINAL in real life: drop 10 mph, turn heat down, and check for a DC fast charger within 10 miles of your destination as a just-in-case.",
  },
  {
    question: "Does a headwind really cost 8% per 10 mph?",
    answer:
      "Approximately. Aerodynamic drag is a function of air velocity over the vehicle, not ground velocity. A 10 mph headwind at 65 mph is the same drag load as driving 75 mph in calm air. Since efficiency loss above 50 mph scales at roughly 1.5% per mph, 10 extra mph of effective speed ~= 15% extra energy. We round it to 8% per 10 mph to account for the fact that drivers naturally slow down slightly in strong headwinds.",
  },
];
