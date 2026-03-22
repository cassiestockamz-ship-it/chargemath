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
import { chargingTimeFAQ } from "@/data/faq-data";
import { NATIONAL_AVERAGE_RATE } from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type ChargingLevel = "level1" | "level2" | "dcfast";

const AMAZON_TAG = "kawaiiguy0f-20";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTime(hours: number): string {
  if (!isFinite(hours) || hours < 0) return "N/A";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

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

export default function ChargingTimePage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [startPercent, setStartPercent] = useState(20);
  const [targetPercent, setTargetPercent] = useState(80);
  const [chargingLevel, setChargingLevel] = useState<ChargingLevel>("level2");

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

  // Comparison data for all 3 levels
  const comparison = useMemo(() => {
    const levels: { key: ChargingLevel; label: string }[] = [
      { key: "level1", label: "Level 1" },
      { key: "level2", label: "Level 2" },
      { key: "dcfast", label: "DC Fast" },
    ];

    return levels.map((lvl) => {
      const power = getChargingPower(vehicle, lvl.key);
      const time = calcChargeTime(
        vehicle.batteryCapacityKwh,
        startPercent,
        effectiveTarget,
        power,
        lvl.key
      );
      const milesPerHour =
        (vehicle.epaRangeMiles * power) / vehicle.batteryCapacityKwh;
      return {
        ...lvl,
        power,
        time,
        milesPerHour,
      };
    });
  }, [vehicle, startPercent, effectiveTarget]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const chargingLevels: { value: ChargingLevel; label: string }[] = [
    { value: "level1", label: "Level 1 (120V)" },
    { value: "level2", label: "Level 2 (240V)" },
    { value: "dcfast", label: "DC Fast Charging" },
  ];

  return (
    <CalculatorLayout
      title="EV Charging Time Calculator"
      description="See how long it takes to charge your EV from any battery level, at Level 1, Level 2, or DC Fast speeds."
      lastUpdated="March 2026"
    >
      <CalculatorSchema name="EV Charging Time Calculator" description="Calculate how long it takes to charge your EV from any battery level at Level 1, Level 2, or DC Fast charging speeds." url="https://chargemath.com/charging-time" />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "Charging Time Calculator", url: "https://chargemath.com/charging-time"}]} />
      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery \u2022 ${vehicle.epaRangeMiles} mi EPA range`}
        />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
            Charging Level
          </span>
          <div className="flex gap-2">
            {chargingLevels.map((cl) => (
              <button
                key={cl.value}
                onClick={() => setChargingLevel(cl.value)}
                aria-pressed={chargingLevel === cl.value}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                  chargingLevel === cl.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]"
                }`}
              >
                {cl.label}
              </button>
            ))}
          </div>
        </div>

        <SliderInput
          label="Starting Battery %"
          value={startPercent}
          onChange={setStartPercent}
          min={0}
          max={99}
          step={1}
          unit="%"
          showValue
        />

        <SliderInput
          label="Target Battery %"
          value={targetPercent}
          onChange={setTargetPercent}
          min={1}
          max={100}
          step={1}
          unit="%"
          showValue
        />
      </div>

      {/* Battery Progress Bar */}
      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
          Charging Session
        </h3>
        <div className="relative">
          <div className="h-10 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
            {/* Existing charge (0 to start) */}
            {startPercent > 0 && (
              <div
                className="absolute left-0 top-0 h-10 rounded-l-full bg-[var(--color-ev-green)]/30"
                style={{ width: `${startPercent}%` }}
              />
            )}
            {/* New charge (start to target) */}
            <div
              className="absolute top-0 h-10 bg-[var(--color-ev-green)] transition-all duration-500"
              style={{
                left: `${startPercent}%`,
                width: `${effectiveTarget - startPercent}%`,
                borderRadius:
                  startPercent === 0
                    ? "9999px 0 0 9999px"
                    : effectiveTarget >= 100
                      ? "0 9999px 9999px 0"
                      : "0",
              }}
            />
          </div>
          {/* Labels */}
          <div className="mt-2 flex justify-between text-xs text-[var(--color-text-muted)]">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
          {/* Start marker */}
          <div
            className="absolute -top-1 flex flex-col items-center"
            style={{ left: `${startPercent}%`, transform: "translateX(-50%)" }}
          >
            <div className="h-12 w-0.5 bg-[var(--color-text-muted)]" />
            <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold text-[var(--color-text-muted)]">
              {startPercent}%
            </span>
          </div>
          {/* Target marker */}
          <div
            className="absolute -top-1 flex flex-col items-center"
            style={{
              left: `${effectiveTarget}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="h-12 w-0.5 bg-[var(--color-primary)]" />
            <span className="mt-0.5 whitespace-nowrap text-[10px] font-semibold text-[var(--color-primary)]">
              {effectiveTarget}%
            </span>
          </div>
        </div>
        {chargingLevel === "dcfast" && effectiveTarget > 80 && (
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Note: DC Fast charging slows significantly above 80% to protect
            battery health. Time estimate accounts for this tapering.
          </p>
        )}
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Charging Estimates
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Charging Time"
            value={formatTime(results.chargeTimeHours)}
            unit={`at ${results.power} kW`}
            highlight
            icon="⏱️"
          />
          <ResultCard
            label="kWh to Charge"
            value={results.kwhNeeded.toFixed(1)}
            unit="kWh"
            icon="⚡"
          />
          <ResultCard
            label="Miles of Range Added"
            value={Math.round(results.milesAdded).toLocaleString()}
            unit="miles"
            icon="🛣️"
          />
          <ResultCard
            label="Miles Per Hour of Charging"
            value={Math.round(results.milesPerHour).toLocaleString()}
            unit="mi/hr plugged in"
            icon="🔋"
          />
          <ResultCard
            label="Estimated Cost"
            value={fmt.format(results.cost)}
            unit={`at ${NATIONAL_AVERAGE_RATE}¢/kWh avg`}
            icon="💰"
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Charging Level Comparison
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]" />
                {comparison.map((c) => (
                  <th
                    key={c.key}
                    className={`px-4 py-3 text-center font-semibold ${
                      c.key === chargingLevel
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text-muted)]">
                  Power
                </td>
                {comparison.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-center ${
                      c.key === chargingLevel
                        ? "font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {c.power} kW
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text-muted)]">
                  Time ({startPercent}% → {effectiveTarget}%)
                </td>
                {comparison.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-center ${
                      c.key === chargingLevel
                        ? "font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {formatTime(c.time)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-[var(--color-text-muted)]">
                  Miles/Hour
                </td>
                {comparison.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 text-center ${
                      c.key === chargingLevel
                        ? "font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    {Math.round(c.milesPerHour)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ShareResults
        title={`Charging Time: ${formatTime(results.chargeTimeHours)}`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} takes ${formatTime(results.chargeTimeHours)} to charge from ${startPercent}% to ${effectiveTarget}% on ${chargingLevel === "level1" ? "Level 1" : chargingLevel === "level2" ? "Level 2" : "DC Fast"} (${results.power} kW). That adds ${Math.round(results.milesAdded)} miles of range for ${fmt.format(results.cost)}.`}
      />

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {chargingLevel === "level1" && (
            <AffiliateCard
              title="Portable EV Charger"
              description="Versatile portable charger that works with standard 120V outlets and can upgrade to 240V. Perfect for home and travel charging."
              priceRange="$150 - $350"
              amazonTag={AMAZON_TAG}
              searchQuery="portable ev charger level 1 level 2"
              imageAlt="Portable EV charger on Amazon"
            />
          )}
          {chargingLevel === "level2" && (
            <AffiliateCard
              title="Level 2 EV Home Charger"
              description="Charge your EV up to 10x faster than a standard outlet. Smart features, NEMA 14-50 compatible."
              priceRange="$250 - $600"
              amazonTag={AMAZON_TAG}
              searchQuery="level 2 ev home charger"
              imageAlt="Level 2 EV home charger on Amazon"
            />
          )}
          {chargingLevel === "dcfast" && (
            <AffiliateCard
              title="EV Charging Adapter"
              description="Ensure compatibility at any charging station with a CCS, NACS, or J1772 adapter for your EV."
              priceRange="$20 - $150"
              amazonTag={AMAZON_TAG}
              searchQuery="ev charging adapter ccs nacs j1772"
              imageAlt="EV charging adapter on Amazon"
            />
          )}
          <AffiliateCard
            title="EV Cable Organizer"
            description="Keep your charging cable tidy and off the ground with a wall-mounted organizer."
            priceRange="$15 - $40"
            amazonTag={AMAZON_TAG}
            searchQuery="ev charging cable organizer wall mount"
            imageAlt="EV charging cable wall mount organizer on Amazon"
          />
        </div>
      </div>
      <FAQSection questions={chargingTimeFAQ} />
      <RelatedCalculators currentPath="/charging-time" />
    </CalculatorLayout>
  );
}
