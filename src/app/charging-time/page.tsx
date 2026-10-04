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
import HowToSchema from "@/components/HowToSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { useUrlSync } from "@/lib/useUrlState";
import { chargingTimeFAQ } from "@/data/faq-data";
import { NATIONAL_AVERAGE_RATE } from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";
import { CHARGE_CURVES, simulateChargeSession } from "@/data/charge-curves";

type ChargingLevel = "level1" | "level2" | "dcfast";

function getChargingPower(
  vehicle: (typeof EV_VEHICLES)[number],
  level: ChargingLevel
): number {
  switch (level) {
    case "level1":
      return vehicle.chargerTypes.level1KW;
    case "level2":
      return vehicle.chargerTypes.level2KW;
    case "dcfast":
      return vehicle.chargerTypes.dcFastKW;
  }
}

function calcChargeTime(
  batteryKwh: number,
  startPct: number,
  targetPct: number,
  powerKW: number,
  level: ChargingLevel
): number {
  if (powerKW <= 0 || startPct >= targetPct) return 0;

  // DC Fast: above 80% charges at ~50% speed due to tapering
  if (level === "dcfast" && targetPct > 80) {
    const fastPortion = Math.max(0, 80 - startPct);
    const slowPortion = targetPct - Math.max(startPct, 80);
    const fastKwh = (batteryKwh * fastPortion) / 100;
    const slowKwh = (batteryKwh * slowPortion) / 100;
    return fastKwh / powerKW + slowKwh / (powerKW * 0.5);
  }

  const kwhNeeded = (batteryKwh * (targetPct - startPct)) / 100;
  return kwhNeeded / powerKW;
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 60) return `${h + 1} hr`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

// Static reference tables, rendered into the page HTML.
const HOME_CHARGE_TABLE = EV_VEHICLES.map((v) => ({
  id: v.id,
  name: `${v.make} ${v.model}`,
  battery: v.batteryCapacityKwh,
  l1Hours: v.batteryCapacityKwh / v.chargerTypes.level1KW,
  l2KW: v.chargerTypes.level2KW,
  l2Hours: v.batteryCapacityKwh / v.chargerTypes.level2KW,
}));

const DC_FAST_TABLE = CHARGE_CURVES.map((c) => ({
  id: c.id,
  name: c.model.startsWith(c.make) ? c.model : `${c.make} ${c.model}`,
  minutes: Math.round(simulateChargeSession(c, 10, 80, 350).totalMinutes),
  peak: Math.max(...c.curve.map(([, kw]) => kw)),
}));

export default function ChargingTimePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [startPercent, setStartPercent] = useState(20);
  const [targetPercent, setTargetPercent] = useState(80);
  const [chargingLevel, setChargingLevel] = useState<ChargingLevel>("level2");

  useUrlSync(
    { vehicle: vehicleId, start: startPercent, target: targetPercent, level: chargingLevel },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.start) setStartPercent(Number(p.start));
      if (p.target) setTargetPercent(Number(p.target));
      if (p.level && ["level1", "level2", "dcfast"].includes(p.level)) setChargingLevel(p.level as ChargingLevel);
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  // Ensure target > start
  const effectiveTarget = Math.max(targetPercent, startPercent + 1);

  const results = useMemo(() => {
    const kwhNeeded =
      (vehicle.batteryCapacityKwh * (effectiveTarget - startPercent)) / 100;
    const power = getChargingPower(vehicle, chargingLevel);
    const chargeTimeHours = calcChargeTime(
      vehicle.batteryCapacityKwh,
      startPercent,
      effectiveTarget,
      power,
      chargingLevel
    );
    const milesAdded =
      ((effectiveTarget - startPercent) / 100) * vehicle.epaRangeMiles;
    const milesPerHour =
      (vehicle.epaRangeMiles * power) / vehicle.batteryCapacityKwh;
    const cost = (kwhNeeded * NATIONAL_AVERAGE_RATE) / 100;

    return {
      kwhNeeded,
      chargeTimeHours,
      milesAdded,
      milesPerHour,
      cost,
      power,
    };
  }, [vehicle, startPercent, effectiveTarget, chargingLevel]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const chargerLevelOptions: { value: ChargingLevel; label: string }[] = [
    { value: "level1", label: "Level 1 (120V)" },
    { value: "level2", label: "Level 2 (240V)" },
    { value: "dcfast", label: "DC Fast Charging" },
  ];

  const chargerLabel =
    chargingLevel === "level1"
      ? "Level 1 charger"
      : chargingLevel === "level2"
        ? "Level 2 charger"
        : "DC fast charger";

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.batteryCapacityKwh} kWh battery`}
      />
      <SelectInput
        label="Charger type"
        value={chargingLevel}
        onChange={(v) => setChargingLevel(v as ChargingLevel)}
        options={chargerLevelOptions}
      />
      <SliderInput
        label="Starting battery"
        value={startPercent}
        onChange={setStartPercent}
        min={0}
        max={99}
        step={1}
        unit="%"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3">
          <SliderInput
            label="Target battery"
            value={targetPercent}
            onChange={setTargetPercent}
            min={1}
            max={100}
            step={1}
            unit="%"
            showValue
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Charging time"
      headline="PLUG IN FOR"
      amount={results.chargeTimeHours}
      amountPrefix=""
      amountDecimals={1}
      amountUnit=" hours"
      sub={`From ${startPercent}% to ${effectiveTarget}% on a ${chargerLabel}. That is about ${Math.round(results.milesAdded)} miles of range added.`}
      dialPercent={effectiveTarget}
      dialLabel="FULL"
      morphHero={false}
    >
      <SavingsTile
        label="TIME TO FULL"
        value={results.chargeTimeHours}
        unit=" hr"
        decimals={1}
        tier="brand"
      />
      <SavingsTile
        label="MILES ADDED"
        value={Math.round(results.milesAdded)}
        unit=" mi"
        tier="good"
      />
      <SavingsTile
        label="ENERGY"
        value={results.kwhNeeded}
        unit=" kWh"
        decimals={1}
        tier="mid"
      />
      <SavingsTile
        label="COST TO CHARGE"
        value={results.cost}
        prefix="$"
        decimals={2}
        tier="volt"
      />
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Charging Time Calculator"
        description="Calculate how long it takes to charge your EV from any battery level at Level 1, Level 2, or DC Fast charging speeds."
        url="https://chargemath.com/charging-time"
      />
      <HowToSchema
        name="How to estimate EV charging time"
        description="Figure out exactly how long an EV takes to charge from any starting battery level on Level 1, Level 2, or DC Fast charging."
        url="https://chargemath.com/charging-time"
        totalTime="PT1M"
        steps={[
          { name: "Pick your EV", text: "Select your vehicle. The calculator pulls battery capacity and onboard AC charger spec from EPA data." },
          { name: "Pick a charger type", text: "Level 1 is a standard wall outlet. Level 2 is a 240V home charger. DC Fast is a public fast-charging station. Each has a different kilowatt rate." },
          { name: "Set the starting battery level", text: "Drag the slider to your current state of charge. The default is 20 percent, which matches a typical come-home-and-plug-in scenario." },
          { name: "Optionally set the target", text: "Open Advanced inputs and change the target from 80 percent. DC Fast only benefits up to 80 percent because the taper slows sharply after that." },
          { name: "Read the plug-in time", text: "The hero shows how many hours to reach the target, plus how many miles of range that adds and what it costs you at your home rate." },
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Charging Time Calculator", url: "https://chargemath.com/charging-time" },
        ]}
      />
      <CalculatorShell
        eyebrow="Charging time"
        title="EV Charging Time Calculator"
        quickAnswer="Level 1 adds 3 to 5 miles per hour. Level 2 adds 20 to 30. DC fast charging gets you from 10 to 80 percent in 20 to 40 minutes."
        inputs={inputs}
        hero={hero}
      >
        {/* Cross-link chips */}
        <div className="mt-2 mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate your charging cost
          </Link>
          <Link
            href="/range"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Check your real world range
          </Link>
          <Link
            href="/charger-roi"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Is a home charger worth it?
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-bold text-[var(--color-text)]">EV Charging Time by Vehicle: Level 1 and Level 2</h2>
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            Time to charge from empty to full: usable battery divided by charging power. Level 1 assumes a standard 120V outlet at 1.4 kW. Level 2 assumes a 240V charger that can supply the car&apos;s full onboard charger rating. Real sessions run about 10 percent longer because of charging losses, and most owners charge from around 20 percent, which is faster.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-3">Vehicle</th>
                  <th className="py-2 pr-3">Battery</th>
                  <th className="py-2 pr-3">Level 1 (1.4 kW)</th>
                  <th className="py-2 pr-3">Level 2</th>
                </tr>
              </thead>
              <tbody>
                {HOME_CHARGE_TABLE.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3">{row.battery} kWh</td>
                    <td className="py-2 pr-3">{Math.round(row.l1Hours)} hr</td>
                    <td className="py-2 pr-3">{formatHours(row.l2Hours)} at {row.l2KW} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="mt-8 mb-3 text-xl font-bold text-[var(--color-text)]">DC Fast Charging Time, 10 to 80 Percent</h2>
          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
            Estimated minutes from 10 to 80 percent on a 350 kW charger, using each car&apos;s published charging curve with a warm, preconditioned battery. A cold battery or a slower station takes longer, and automaker figures are often a few minutes faster than these estimates. See the full curves on the <Link href="/charge-curve" className="text-[var(--color-primary)] underline">charge curve calculator</Link>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-3">Vehicle</th>
                  <th className="py-2 pr-3">Peak power</th>
                  <th className="py-2 pr-3">10 to 80 percent</th>
                </tr>
              </thead>
              <tbody>
                {DC_FAST_TABLE.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-border)]">
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3">{row.peak} kW</td>
                    <td className="py-2 pr-3">about {row.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EducationalContent>
          <h2>How EV Charging Time Is Calculated</h2>
          <p>
            Charging time is determined by dividing the energy needed (kWh) by the charger&apos;s power output (kW). For example, adding 40 kWh to a battery using a 10 kW Level 2 charger takes 4 hours. Each vehicle in this calculator uses its manufacturer-rated maximum charging power for each level, from automaker specifications.
          </p>
          <h3>Why DC Fast Charging Slows Above 80%</h3>
          <p>
            Lithium-ion batteries accept charge more slowly as they approach full capacity. This is a physical limitation of the chemistry, not a software restriction. Between 80 and 100 percent, the battery management system reduces charging power by roughly 50% to prevent overheating and degradation. This is why most charging networks price sessions by the minute above 80%, and why daily charging to 80% is standard practice.
          </p>
          <h3>Real-World Factors That Affect Charging Speed</h3>
          <ul>
            <li>Battery temperature: cold batteries charge 20 to 40 percent slower until they warm up. Many EVs now pre-condition the battery when navigating to a fast charger.</li>
            <li>State of charge: the 10 to 80 percent window is the fastest charging zone. Below 10 percent, some vehicles also reduce charging speed.</li>
            <li>Charger sharing: if another vehicle is using the same power cabinet, both may receive reduced power (common at older Tesla Supercharger sites).</li>
            <li>Home circuit capacity: Level 2 charging speed depends on your circuit amperage. A 50A circuit delivers 40A continuous (9.6 kW), while a 30A circuit delivers only 24A (5.7 kW).</li>
          </ul>
        </EducationalContent>
        <FAQSection questions={chargingTimeFAQ} />
        <EmailCapture source="charging-time" />
        <RelatedCalculators currentPath="/charging-time" />
      </CalculatorShell>
    </>
  );
}
