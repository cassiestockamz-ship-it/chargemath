"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type PublicSplit = "100" | "75_25" | "50_50";

const AMAZON_TAG = "kawaiiguy0f-20";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtShort = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export default function ChargerROIPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargerCost, setChargerCost] = useState(500);
  const [installCost, setInstallCost] = useState(800);
  const [publicRate, setPublicRate] = useState(0.35);
  const [publicSplit, setPublicSplit] = useState<PublicSplit>("100");

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const homeRate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;

    const totalUpfront = chargerCost + installCost;
    const monthlyHomeCost = monthlyKwh * homeRate;

    // Monthly cost without a home charger (public + Level 1 mix)
    let monthlyWithoutHome: number;
    if (publicSplit === "100") {
      monthlyWithoutHome = monthlyKwh * publicRate;
    } else if (publicSplit === "75_25") {
      monthlyWithoutHome =
        0.75 * monthlyKwh * publicRate + 0.25 * monthlyKwh * homeRate;
    } else {
      monthlyWithoutHome =
        0.5 * monthlyKwh * publicRate + 0.5 * monthlyKwh * homeRate;
    }

    const monthlySavings = monthlyWithoutHome - monthlyHomeCost;
    const paybackMonths =
      monthlySavings > 0 ? totalUpfront / monthlySavings : Infinity;
    const fiveYearNet = monthlySavings * 60 - totalUpfront;

    // Time savings: Level 2 ~30 mi/hr vs Level 1 ~4 mi/hr
    const weeklyMiles = dailyMiles * 7;
    const weeklyHoursL1 = weeklyMiles / 4;
    const weeklyHoursL2 = weeklyMiles / 30;
    const weeklyTimeSaved = weeklyHoursL1 - weeklyHoursL2;

    return {
      monthlyKwh,
      totalUpfront,
      monthlyHomeCost,
      monthlyWithoutHome,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      paybackMonths,
      fiveYearNet,
      weeklyTimeSaved,
    };
  }, [
    dailyMiles,
    vehicle,
    homeRate,
    chargerCost,
    installCost,
    publicRate,
    publicSplit,
  ]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}¢/kWh)`,
    }));

  const publicSplitOptions: { value: PublicSplit; label: string }[] = [
    { value: "100", label: "100% public charging" },
    { value: "75_25", label: "75% public / 25% Level 1" },
    { value: "50_50", label: "50% public / 50% Level 1" },
  ];

  const formatPayback = (months: number): string => {
    if (!isFinite(months) || months <= 0) return "N/A";
    const roundedMonths = Math.ceil(months);
    if (roundedMonths < 12) return `${roundedMonths} months`;
    const years = Math.floor(roundedMonths / 12);
    const remaining = roundedMonths % 12;
    if (remaining === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""}, ${remaining} month${remaining > 1 ? "s" : ""}`;
  };

  // Break-even timeline calculations
  const paybackCapped = Math.min(results.paybackMonths, 60);
  const paybackPct = isFinite(results.paybackMonths)
    ? (paybackCapped / 60) * 100
    : 100;

  return (
    <CalculatorLayout
      title="Home EV Charger ROI Calculator"
      description="Find out how quickly a Level 2 home charger pays for itself compared to public charging or Level 1 charging."
      lastUpdated="March 2026"
    >
      <CalculatorSchema name="Home EV Charger ROI Calculator" description="Calculate the payback period for installing a Level 2 home EV charger compared to public charging or Level 1 charging." url="https://chargemath.com/charger-roi" />
      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery \u2022 ${vehicle.epaRangeMiles} mi EPA range \u2022 ${vehicle.kwhPer100Miles} kWh/100mi`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText="Average residential electricity rate from EIA"
        />

        <NumberInput
          label="Custom Electricity Rate (optional)"
          value={customRate ?? 0}
          onChange={(v) => setCustomRate(v > 0 ? v : null)}
          min={0}
          max={100}
          step={0.1}
          unit={"¢/kWh"}
          helpText="Leave at 0 to use your state's average rate"
        />

        <NumberInput
          label="Home Charger Cost"
          value={chargerCost}
          onChange={setChargerCost}
          min={0}
          max={5000}
          step={50}
          unit={"$"}
        />

        <NumberInput
          label="Installation Cost"
          value={installCost}
          onChange={setInstallCost}
          min={0}
          max={10000}
          step={50}
          unit={"$"}
          helpText="Includes electrician + panel upgrade if needed"
        />

        <NumberInput
          label="Public Charging Rate"
          value={publicRate}
          onChange={setPublicRate}
          min={0}
          max={2}
          step={0.01}
          unit={"$/kWh"}
          helpText="Average DC fast charging rate"
        />

        <SelectInput
          label="Without Home Charger, You'd Use..."
          value={publicSplit}
          onChange={(v) => setPublicSplit(v as PublicSplit)}
          options={publicSplitOptions}
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Daily Miles Driven"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={10}
            max={150}
            step={5}
            unit="miles"
            showValue
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your ROI Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Payback Period"
            value={formatPayback(results.paybackMonths)}
            unit=""
            highlight
            icon="📅"
          />
          <ResultCard
            label="Monthly Savings"
            value={fmt.format(results.monthlySavings)}
            unit="/month"
            icon="💰"
          />
          <ResultCard
            label="Annual Savings"
            value={fmtShort.format(results.annualSavings)}
            unit="/year"
            icon="📈"
          />
          <ResultCard
            label="5-Year Net Savings"
            value={fmtShort.format(results.fiveYearNet)}
            unit="after equipment cost"
            highlight
            icon="🏆"
          />
          <ResultCard
            label="Weekly Time Saved vs Level 1"
            value={`${results.weeklyTimeSaved.toFixed(1)}`}
            unit="hours"
            icon="⏱️"
          />
          <ResultCard
            label="Total Investment"
            value={fmtShort.format(results.totalUpfront)}
            unit="upfront"
            icon="🔌"
          />
        </div>

        {/* Break-Even Timeline */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Break-Even Timeline
          </h3>
          <div className="relative">
            {/* Track */}
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              {/* Payback segment */}
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${paybackPct}%` }}
              />
            </div>

            {/* Labels */}
            <div className="mt-3 flex items-start justify-between text-xs">
              <div className="text-[var(--color-text-muted)]">
                <span className="block font-semibold">Today</span>
                <span>{fmtShort.format(results.totalUpfront)} invested</span>
              </div>

              {isFinite(results.paybackMonths) && results.paybackMonths <= 60 && (
                <div
                  className="absolute text-center"
                  style={{
                    left: `${paybackPct}%`,
                    transform: "translateX(-50%)",
                    top: "2.25rem",
                  }}
                >
                  <span className="block font-semibold text-[var(--color-ev-green)]">
                    Break Even
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    Month {Math.ceil(results.paybackMonths)}
                  </span>
                </div>
              )}

              <div className="text-right text-[var(--color-text-muted)]">
                <span className="block font-semibold">5 Years</span>
                <span className="font-semibold text-[var(--color-ev-green)]">
                  {fmtShort.format(results.fiveYearNet)} saved
                </span>
              </div>
            </div>
          </div>

          {!isFinite(results.paybackMonths) && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Home charging is not cheaper with current settings. Adjust your
              public charging rate or electricity rate.
            </p>
          )}

          {isFinite(results.paybackMonths) && results.paybackMonths > 60 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Payback period exceeds 5 years ({formatPayback(results.paybackMonths)}).
              Consider a lower-cost charger or higher public charging rate.
            </p>
          )}
        </div>
      </div>

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Top-Rated Home EV Chargers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AffiliateCard
            title="ChargePoint Home Flex"
            description="Adjustable amperage (16-50A), works with all EVs, WiFi-enabled with app control and energy tracking."
            priceRange="$399 - $549"
            amazonTag={AMAZON_TAG}
            searchQuery="ChargePoint Home Flex ev charger"
            imageAlt="ChargePoint Home Flex EV charger on Amazon"
          />
          <AffiliateCard
            title="Emporia Smart Level 2 Charger"
            description="Smart energy management, WiFi-connected, 48A output, works with Emporia Vue energy monitor."
            priceRange="$449 - $549"
            amazonTag={AMAZON_TAG}
            searchQuery="Emporia smart ev charger level 2"
            imageAlt="Emporia Smart Level 2 EV charger on Amazon"
          />
          <AffiliateCard
            title="Grizzl-E Classic"
            description="Rugged, weather-resistant design rated for extreme temperatures. 40A, NEMA 14-50, no-fuss reliability."
            priceRange="$399 - $459"
            amazonTag={AMAZON_TAG}
            searchQuery="Grizzl-E classic ev charger"
            imageAlt="Grizzl-E Classic EV charger on Amazon"
          />
        </div>
      </div>
      <RelatedCalculators currentPath="/charger-roi" />
    </CalculatorLayout>
  );
}
