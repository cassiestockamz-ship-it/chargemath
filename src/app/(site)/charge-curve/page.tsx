"use client";

import { useMemo, useState } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import RelatedCalculators from "@/components/RelatedCalculators";
import Link from "next/link";
import {
  CHARGE_CURVES,
  interpolateKw,
  simulateChargeSession,
  type ChargeCurve,
} from "@/data/charge-curves";

const chargerOptions = [
  { value: "50", label: "50 kW (older CCS / CHAdeMO)" },
  { value: "100", label: "100 kW (EVgo, ChargePoint)" },
  { value: "150", label: "150 kW (EA legacy, FLO)" },
  { value: "250", label: "250 kW (Tesla V3, EA Hyper)" },
  { value: "350", label: "350 kW (EA V2, Francis, Ionna)" },
  { value: "400", label: "400 kW (Tesla V4, future)" },
];

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export default function ChargeCurvePage() {
  const [carId, setCarId] = useState(CHARGE_CURVES[0].id);
  const [startSoc, setStartSoc] = useState(10);
  const [endSoc, setEndSoc] = useState(80);
  const [chargerKw, setChargerKw] = useState("250");

  const carOptions = CHARGE_CURVES.map((c) => ({
    value: c.id,
    label: `${c.year} ${c.make} ${c.model}`,
  }));

  const car: ChargeCurve =
    CHARGE_CURVES.find((c) => c.id === carId) ?? CHARGE_CURVES[0];

  const session = useMemo(
    () => simulateChargeSession(car, startSoc, endSoc, Number(chargerKw)),
    [car, startSoc, endSoc, chargerKw]
  );

  // Sample curve at 2% steps for chart rendering
  const chartData = useMemo(() => {
    const data: Array<{ soc: number; curveKw: number; deliveredKw: number }> = [];
    for (let soc = 0; soc <= 100; soc += 2) {
      const curveKw = (function () {
        // replicate interpolateKw inline to avoid importing the fn again
        const pts = car.curve;
        if (soc <= pts[0][0]) return pts[0][1];
        if (soc >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
        for (let i = 0; i < pts.length - 1; i++) {
          const [s0, k0] = pts[i];
          const [s1, k1] = pts[i + 1];
          if (soc >= s0 && soc <= s1) {
            const frac = (soc - s0) / (s1 - s0);
            return k0 + frac * (k1 - k0);
          }
        }
        return 0;
      })();
      data.push({
        soc,
        curveKw,
        deliveredKw: Math.min(curveKw, Number(chargerKw)),
      });
    }
    return data;
  }, [car, chargerKw]);

  const maxKwOnChart = Math.max(
    ...chartData.map((d) => d.curveKw),
    Number(chargerKw)
  );
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = { left: 40, right: 10, top: 10, bottom: 30 };

  function x(soc: number): number {
    return (
      padding.left +
      ((soc / 100) * (chartWidth - padding.left - padding.right))
    );
  }
  function y(kw: number): number {
    return (
      padding.top +
      (1 - kw / maxKwOnChart) * (chartHeight - padding.top - padding.bottom)
    );
  }

  const curvePath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.soc)},${y(d.curveKw)}`)
    .join(" ");
  const deliveredPath = chartData
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(d.soc)},${y(d.deliveredKw)}`)
    .join(" ");

  // Quick answer reads the visitor's car and charger, never typed figures.
  const firstHalf = useMemo(
    () => simulateChargeSession(car, 10, 60, Number(chargerKw)),
    [car, chargerKw]
  );
  const topUp = useMemo(
    () => simulateChargeSession(car, 60, 80, Number(chargerKw)),
    [car, chargerKw]
  );

  const peakKw = Math.max(...car.curve.map(([, kw]) => kw));
  const avgKw = session.telemetry.length
    ? session.telemetry.reduce((s, t) => s + t.kw, 0) / session.telemetry.length
    : 0;
  const kwhPerMile = 0.3; // rough average for miles-added estimate
  const milesAdded = session.kwhAdded / kwhPerMile;

  const chargerLimited = Number(chargerKw) < peakKw;

  return (
    <CalculatorLayout
      title="EV Charge Curve Simulator"
      description="Simulate a full DC fast-charging session on 15 popular EVs. Real curve data, any charger speed, any SOC window. See the whole session in one chart."
      answerBlock={
        <p>
          <strong>Quick answer:</strong> Charge curves fall away in the upper half of the
          battery on most EVs. A {car.year} {car.make} {car.model} on a {`${chargerKw} kW`}{" "}
          charger goes from 10% to 60% in about {`${fmt(firstHalf.totalMinutes)} minutes`} and
          adds {`${fmt(firstHalf.kwhAdded)} kWh`}; the next stretch, 60% to 80%, takes another{" "}
          {`${fmt(topUp.totalMinutes)} minutes`} for only {`${fmt(topUp.kwhAdded)} kWh`}. That is why
          road-trip advice is &ldquo;arrive low, leave around 60%&rdquo;. Pick your own car,
          charger and window above to run the exact session.
        </p>
      }
      lastUpdated="April 2026"
    >
      <CalculatorSchema
        name="EV Charge Curve Simulator"
        description="Simulate DC fast-charging sessions for 15 popular EVs using real curve data from InsideEVs, Out of Spec, and Fastned. Free."
        url="https://chargemath.com/charge-curve"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Charge Curve", url: "https://chargemath.com/charge-curve" },
        ]}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Vehicle"
          value={carId}
          onChange={setCarId}
          options={carOptions}
          helpText={`${car.batteryKwh} kWh battery, ${car.voltageArchitecture}V architecture, peak ${peakKw} kW`}
        />
        <SelectInput
          label="Charger max power"
          value={chargerKw}
          onChange={setChargerKw}
          options={chargerOptions}
        />
        <div>
          <SliderInput
            label="Start SOC"
            value={startSoc}
            onChange={setStartSoc}
            min={0}
            max={99}
            step={1}
            unit="%"
            showValue
          />
        </div>
        <div>
          <SliderInput
            label="Target SOC"
            value={endSoc}
            onChange={setEndSoc}
            min={Math.min(99, startSoc + 1)}
            max={100}
            step={1}
            unit="%"
            showValue
          />
        </div>
      </div>

      {/* Chart */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Charging curve
          </h2>
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[var(--color-primary)]" />
              Vehicle max
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
              Delivered at this charger
            </span>
          </div>
        </div>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-auto w-full"
          role="img"
          aria-label="Charge curve chart"
        >
          {/* Y axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const kw = maxKwOnChart * (1 - frac);
            const yy =
              padding.top +
              frac * (chartHeight - padding.top - padding.bottom);
            return (
              <g key={frac}>
                <line
                  x1={padding.left}
                  y1={yy}
                  x2={chartWidth - padding.right}
                  y2={yy}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 4}
                  y={yy + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                >
                  {Math.round(kw)}
                </text>
              </g>
            );
          })}
          {/* X axis labels */}
          {[0, 20, 40, 60, 80, 100].map((soc) => (
            <text
              key={soc}
              x={x(soc)}
              y={chartHeight - padding.bottom + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {soc}%
            </text>
          ))}
          {/* Charger cap line */}
          {chargerLimited && (
            <line
              x1={padding.left}
              y1={y(Number(chargerKw))}
              x2={chartWidth - padding.right}
              y2={y(Number(chargerKw))}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )}
          {/* Vehicle curve */}
          <path d={curvePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
          {/* Delivered curve (green) */}
          <path
            d={deliveredPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />
          {/* Start / end markers */}
          <line
            x1={x(startSoc)}
            y1={padding.top}
            x2={x(startSoc)}
            y2={chartHeight - padding.bottom}
            stroke="#64748b"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <line
            x1={x(endSoc)}
            y1={padding.top}
            x2={x(endSoc)}
            y2={chartHeight - padding.bottom}
            stroke="#64748b"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <text
            x={x(startSoc)}
            y={padding.top + 10}
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
          >
            start
          </text>
          <text
            x={x(endSoc)}
            y={padding.top + 10}
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
          >
            end
          </text>
        </svg>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Y axis: power (kW). X axis: state of charge (%). Data points are
          interpolated at 2% intervals.
        </p>
        {car.notes && (
          <p className="mt-2 text-sm italic text-[var(--color-text-muted)]">
            Note: {car.notes}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          label="Session time"
          value={`${fmt(session.totalMinutes, 1)}`}
          unit="min"
          highlight
          icon="⏱️"
        />
        <ResultCard
          label="Energy added"
          value={`${fmt(session.kwhAdded, 1)}`}
          unit="kWh"
          icon="🔋"
        />
        <ResultCard
          label="Miles added"
          value={`${fmt(milesAdded, 0)}`}
          unit="mi"
          icon="🛣️"
        />
        <ResultCard
          label="Average delivered"
          value={`${fmt(avgKw, 0)}`}
          unit="kW"
          icon="⚡"
        />
        <ResultCard
          label="Peak delivered"
          value={`${fmt(Math.min(peakKw, Number(chargerKw)), 0)}`}
          unit="kW"
          icon="🚀"
        />
        <ResultCard
          label={chargerLimited ? "Charger is bottleneck" : "Car is bottleneck"}
          value={chargerLimited ? `${chargerKw} kW` : `${peakKw} kW`}
          unit="cap"
          icon="⚠️"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Level 1/2 charging time →
        </Link>
        <Link
          href="/road-trip"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Plan a full road trip →
        </Link>
        <Link
          href="/public-charging"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Public charging cost →
        </Link>
      </div>

      <ShareResults
        title={`${car.make} ${car.model}: ${startSoc}% → ${endSoc}% in ${fmt(session.totalMinutes, 1)} min`}
        text={`${car.year} ${car.make} ${car.model} at a ${chargerKw}kW charger: ${startSoc}% to ${endSoc}% SOC in ${fmt(session.totalMinutes, 1)} minutes, ${fmt(session.kwhAdded, 1)} kWh added.`}
        card={{
          headline: `${fmt(session.totalMinutes, 0)} min`,
          label: `${startSoc}% → ${endSoc}% session time`,
          sub: `${car.year} ${car.make} ${car.model} at ${chargerKw} kW, ${fmt(session.kwhAdded, 0)} kWh added`,
          calc: "charge-curve",
        }}
      />

      <EducationalContent>
        <h2>Why Charge Curves Exist</h2>
        <p>
          Lithium-ion batteries accept charge much faster at low states of charge than at
          high. The reason is electrochemical: as the battery fills, the lithium-ion
          concentration gradient inside each cell flattens out and the battery
          management system (BMS) has to reduce current to avoid plating metallic lithium
          on the anode, which would permanently kill capacity. Every EV has a
          manufacturer-programmed curve that trades peak power for long-term battery
          health, and that&apos;s what you see charted here.
        </p>
        <h3>The 10%-to-60% Rule</h3>
        <p>
          On most recent EVs, half the battery goes in fast and the rest goes in slowly.
          The {car.year} {car.make} {car.model} you picked, on a {`${chargerKw} kW`} charger,
          goes from 10% to 60% in about {`${fmt(firstHalf.totalMinutes)} minutes`}, then needs{" "}
          {`${fmt(topUp.totalMinutes)} more minutes`} for the 20 points from 60% to 80%. On road trips,
          stopping at 10% and leaving at 60% is almost always faster-per-mile than
          stopping at 30% and leaving at 80%, even if you make more stops. This
          calculator lets you run that comparison numerically for your car. For the
          total minutes from any start level to any end level, on Level 1, Level 2 or
          DC fast, use the{" "}
          <Link href="/charging-time">EV charging time calculator</Link>.
        </p>
        <h3>Why 800V Matters</h3>
        <p>
          Cars like the Hyundai Ioniq 5, Kia EV6, Lucid Air, and Porsche Taycan run 800V
          battery packs. At a given power level, doubling voltage halves the current,
          which halves resistive heat losses (which scale with I²R). That&apos;s why 800V
          cars can hold near-peak power deep into the SOC range: they&apos;re producing
          less waste heat, so the BMS doesn&apos;t have to taper as aggressively. A{" "}
          {IONIQ5.year} Ioniq 5 holds {`${IONIQ5_HOLD_KW} kW`} or more from 5% to 50% SOC; most 400V cars see their peak power
          for only 10-15% of the curve.
        </p>
        <h3>What The Charger Cap Does</h3>
        <p>
          If your car&apos;s peak is 270 kW and the charger is 150 kW, you see 150 kW for
          most of the session, until the car&apos;s natural taper drops below 150 kW,
          after which the charger stops being the bottleneck. You can see this on the
          chart as the point where the green line separates from the orange dashed cap
          line. For 400V cars paired with 350 kW chargers, most of the session is
          car-limited.
        </p>
        <h3>Data Sources</h3>
        <ul>
          <li>InsideEVs published 10-80% charging tests (2022-2025)</li>
          <li>Out of Spec Studios charging curves on YouTube</li>
          <li>Bjorn Nyland 10-80% tests</li>
          <li>Fastned network statistics (published charging data per model)</li>
          <li>Manufacturer spec sheets for battery capacity and peak kW</li>
        </ul>
        <p className="text-sm italic">
          Curves are representative of a well-preconditioned battery at moderate ambient
          temperature. Cold starts without preconditioning can cut peak power by 40-60%;
          hot batteries on a second back-to-back session can also reduce the curve
          significantly (especially on air-cooled packs like the Nissan Leaf).
        </p>
      </EducationalContent>
      <FAQSection questions={curveFAQ} />
      <RelatedCalculators currentPath="/charge-curve" />
    </CalculatorLayout>
  );
}

// FAQ and explainer figures are read from the curve data so they match the simulator.
const curveById = (id: string): ChargeCurve =>
  CHARGE_CURVES.find((c) => c.id === id) ?? CHARGE_CURVES[0];
const M3 = curveById("tesla-model-3-lr-2024");
const IONIQ5 = curveById("hyundai-ioniq-5-2024");
const BOLT = curveById("chevy-bolt-euv-2023");
const kwAt = (c: ChargeCurve, soc: number) => Math.round(interpolateKw(c.curve, soc));
const peakOf = (c: ChargeCurve) => Math.max(...c.curve.map(([, kw]) => kw));
const mins10to80 = (c: ChargeCurve, chargerKw: number) =>
  Math.round(simulateChargeSession(c, 10, 80, chargerKw).totalMinutes);
const IONIQ5_HOLD_KW = Math.min(
  ...IONIQ5.curve.filter(([soc]) => soc >= 5 && soc <= 50).map(([, kw]) => kw)
);

const curveFAQ = [
  {
    question: "Why does my Tesla stop charging at 250 kW after just a few minutes?",
    answer:
      `The ${peakOf(M3)} kW peak is real but brief. The Model 3 Long Range curve holds ${kwAt(M3, 10)} kW from about 10% to 20% SOC, then steps down to roughly ${kwAt(M3, 40)} kW by 40%, ${kwAt(M3, 50)} kW by 50%, and ${kwAt(M3, 60)} kW by 60%; the Model Y Long Range follows a similar shape. The 'I saw ${peakOf(M3)} kW for 30 seconds' experience is normal. That's how the curve is shaped. This calculator plots the whole shape so you know what to expect.`,
  },
  {
    question: "Why do Ioniq 5 and EV6 charge so much faster than other EVs?",
    answer:
      `Two reasons: 800V battery architecture (which halves current at any given power, cutting resistive heat losses 75%), and aggressive BMS tuning. The E-GMP platform holds ${IONIQ5_HOLD_KW} kW or more from 5% to 50% SOC, which few 400V cars come close to. The cost is that the curve takes a steep step-down at ~55% SOC, so you really should unplug at that point on a road trip.`,
  },
  {
    question: "Is it true that 10% to 80% is faster than 10% to 100%?",
    answer:
      "Much faster. On most EVs, going from 80% to 100% takes roughly as long as going from 10% to 60%. The taper is that steep in the top 20%. Unless you are absolutely out of charging options between here and your destination, it is almost always faster-per-mile to stop twice and charge 10%-60% each time than to charge once to 100%.",
  },
  {
    question: "Do these curves assume the battery is preconditioned?",
    answer:
      "Yes. All curves represent a well-preconditioned battery at moderate ambient temperature (60-80°F). Cold-start charging without preconditioning can cut peak power 40-60% on most EVs. If you plan to fast-charge in winter, set your nav destination to the charger 20-30 minutes before arrival so the BMS pre-heats the pack.",
  },
  {
    question: "Why is the Bolt so slow, and is it really that bad?",
    answer:
      `Yes, it's that slow. The Bolt's battery management caps DC fast charging at about ${peakOf(BOLT)} kW, held only from roughly 10% to 30% SOC, and by 70% power is down to about ${kwAt(BOLT, 70)} kW. A Bolt 10-80% session runs about ${mins10to80(BOLT, 150)} minutes in this simulator, against ${mins10to80(IONIQ5, 350)} minutes for an Ioniq 5 on a 350 kW charger. If you road-trip often, the Bolt is the wrong tool for the job.`,
  },
  {
    question: "How accurate is the session time estimate?",
    answer:
      "Within about 10-15% of real-world for the listed models on a preconditioned battery at a working charger. Variables this calculator does NOT account for: charger station power sharing (some 350 kW stalls split power between adjacent stalls), handshake time (10-60 seconds to start the session), degraded batteries on higher-mileage cars (typically 3-8% slower), and cold starts. Treat the number as a confident estimate, not a stopwatch.",
  },
];
