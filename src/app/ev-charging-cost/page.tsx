"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import { chargingCostFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type ChargingLevel = "level1" | "level2" | "dcfast";

const AMAZON_TAG = "kawaiiguy0f-cm-20";

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

export default function EVChargingCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargingLevel, setChargingLevel] = useState<ChargingLevel>("level2");

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const effectiveRate = useMemo(() => {
    if (chargingLevel === "dcfast") return rate * 2.5;
    return rate;
  }, [rate, chargingLevel]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;
    const annualKwh = dailyKwh * 365;

    const costPerFullCharge = vehicle.batteryCapacityKwh * effectiveRate;
    const monthlyCost = monthlyKwh * effectiveRate;
    const annualCost = annualKwh * effectiveRate;
    const costPerMile = effectiveRate * (vehicle.kwhPer100Miles / 100);

    // Gas comparison
    const gasMpg = 28;
    const gasPrice = 3.5;
    const gasMonthlyCost = ((dailyMiles * 30) / gasMpg) * gasPrice;
    const gasCostPerMile = gasPrice / gasMpg;
    const monthlySavings = gasMonthlyCost - monthlyCost;
    const annualSavings = monthlySavings * 12;

    return {
      dailyKwh,
      monthlyKwh,
      annualKwh,
      costPerFullCharge,
      monthlyCost,
      annualCost,
      costPerMile,
      gasMonthlyCost,
      gasCostPerMile,
      monthlySavings,
      annualSavings,
    };
  }, [dailyMiles, vehicle, effectiveRate]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}\u00A2/kWh)`,
    }));

  const chargingLevels: { value: ChargingLevel; label: string }[] = [
    { value: "level1", label: "Level 1 (120V)" },
    { value: "level2", label: "Level 2 (240V)" },
    { value: "dcfast", label: "DC Fast Charging" },
  ];

  const evBarWidth = Math.min(
    100,
    (results.monthlyCost /
      Math.max(results.monthlyCost, results.gasMonthlyCost)) *
      100
  );
  const gasBarWidth = Math.min(
    100,
    (results.gasMonthlyCost /
      Math.max(results.monthlyCost, results.gasMonthlyCost)) *
      100
  );

  return (
    <CalculatorLayout
      title="EV Charging Cost Calculator"
      description="Estimate your monthly and annual EV charging costs based on your vehicle, electricity rate, and daily driving."
      lastUpdated="March 2026"
      intro="The average EV costs $50-80 per month to charge at home, depending on your vehicle efficiency and local electricity rate. At the national average of 16.11¢/kWh, a Tesla Model 3 costs about $9.67 for a full charge providing 272 miles of range — roughly $0.04 per mile compared to $0.13 per mile for a gas car."
    >
      <CalculatorSchema name="EV Charging Cost Calculator" description="Calculate your monthly and annual EV charging costs based on your vehicle, state electricity rates, and daily driving habits." url="https://chargemath.com/ev-charging-cost" />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "EV Charging Cost Calculator", url: "https://chargemath.com/ev-charging-cost"}]} />
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

        <div>
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
          {chargingLevel === "dcfast" && (
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
              DC Fast uses public station rates (~2.5x home rates)
            </p>
          )}
        </div>

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
          Your Estimated Costs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Monthly Charging Cost"
            value={fmt.format(results.monthlyCost)}
            unit="/month"
            highlight
            icon="⚡"
          />
          <ResultCard
            label="Annual Charging Cost"
            value={fmt.format(results.annualCost)}
            unit="/year"
            icon="📅"
          />
          <ResultCard
            label="Cost Per Mile (EV)"
            value={`$${results.costPerMile.toFixed(3)}`}
            unit="/mile"
            icon="🔋"
          />
          <ResultCard
            label="Annual Savings vs Gas"
            value={fmtShort.format(results.annualSavings)}
            unit="/year"
            highlight
            icon="💰"
          />
          <ResultCard
            label="Cost for Full Charge"
            value={fmt.format(results.costPerFullCharge)}
            unit={`(${vehicle.epaRangeMiles} mi range)`}
            icon="🔌"
          />
          <ResultCard
            label="Cost Per Mile (Gas)"
            value={`$${results.gasCostPerMile.toFixed(3)}`}
            unit="/mile @ $3.50/gal"
            icon="⛽"
          />
        </div>

        {/* Comparison Bar */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Cost Comparison
          </h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-ev-green)]">
                  EV (Electric)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.monthlyCost)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-ev-green)] transition-all duration-500"
                  style={{ width: `${evBarWidth}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-gas-red)]">
                  Gas (28 MPG @ $3.50/gal)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.gasMonthlyCost)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-gas-red)] transition-all duration-500"
                  style={{ width: `${gasBarWidth}%` }}
                />
              </div>
            </div>
          </div>
          {results.monthlySavings > 0 ? (
            <p className="mt-4 text-center text-sm font-semibold text-[var(--color-ev-green)]">
              You save {fmt.format(results.monthlySavings)}/month with an EV
            </p>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-amber-600">
              Gas is cheaper by {fmt.format(Math.abs(results.monthlySavings))}/month in this scenario
            </p>
          )}
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            Comparison assumes 28 MPG and $3.50/gal. For custom values, try our{" "}
            <Link href="/gas-vs-electric" className="text-[var(--color-primary)] hover:underline">
              Gas vs Electric calculator
            </Link>.
          </p>
        </div>

        <ShareResults
          title={`EV Charging Cost: ${fmt.format(results.monthlyCost)}/month`}
          text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.monthlyCost)}/month to charge (${fmt.format(results.annualCost)}/year). That's ${fmtShort.format(results.annualSavings)}/year less than gas!`}
        />
      </div>

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {chargingLevel === "level2" && (
            <AffiliateCard
              title="Level 2 EV Home Charger"
              description="Charge your EV up to 10x faster than a standard outlet. Smart features, NEMA 14-50 compatible."
              priceRange="$250 - $600"
              amazonTag={AMAZON_TAG}
              searchQuery="level 2 ev home charger"
              imageAlt="Level 2 EV home charger on Amazon"
              slug="ev-charging-cost"
            />
          )}
          {chargingLevel === "level1" && (
            <AffiliateCard
              title="Portable EV Charger"
              description="Versatile portable charger that works with standard 120V outlets and can upgrade to 240V."
              priceRange="$150 - $350"
              amazonTag={AMAZON_TAG}
              searchQuery="portable ev charger level 1 level 2"
              imageAlt="Portable EV charger on Amazon"
              slug="ev-charging-cost"
            />
          )}
          <AffiliateCard
            title="EV Charging Cable Organizer"
            description="Keep your charging cable tidy and off the ground with a wall-mounted organizer."
            priceRange="$15 - $40"
            amazonTag={AMAZON_TAG}
            searchQuery="ev charging cable organizer wall mount"
            imageAlt="EV charging cable wall mount organizer on Amazon"
            slug="ev-charging-cost"
          />
        </div>
      </div>
      <FAQSection questions={chargingCostFAQ} />
      <RelatedCalculators currentPath="/ev-charging-cost" />
    </CalculatorLayout>
  );
}
