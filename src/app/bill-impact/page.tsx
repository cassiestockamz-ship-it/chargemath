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
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import Link from "next/link";
import { billImpactFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const AMAZON_TAG = "kawaiiguy0f-cm-20";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function BillImpactPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [currentBill, setCurrentBill] = useState(150);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargingHome, setChargingHome] = useState(100);
  const [hasTOU, setHasTOU] = useState("no");
  const [offPeakDiscount, setOffPeakDiscount] = useState(40);

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const homeChargePercent = chargingHome / 100;
    const monthlyEvKwh = dailyKwh * 30 * homeChargePercent;

    let effectiveRate = rate;
    if (hasTOU === "yes") {
      effectiveRate = rate * (1 - offPeakDiscount / 100);
    }

    const monthlyEvCost = monthlyEvKwh * effectiveRate;
    const newBill = currentBill + monthlyEvCost;
    const percentIncrease = currentBill > 0 ? (monthlyEvCost / currentBill) * 100 : 0;

    // Current usage estimate (reverse from bill)
    const currentKwh = currentBill / rate;
    const newTotalKwh = currentKwh + monthlyEvKwh;
    const evSharePercent = (monthlyEvKwh / newTotalKwh) * 100;

    // Annual impact
    const annualEvCost = monthlyEvCost * 12;

    // TOU savings
    const touSavings = hasTOU === "yes" ? monthlyEvKwh * rate * (offPeakDiscount / 100) : 0;

    return {
      monthlyEvCost,
      newBill,
      percentIncrease,
      monthlyEvKwh,
      currentKwh,
      newTotalKwh,
      evSharePercent,
      annualEvCost,
      touSavings,
      effectiveRate,
    };
  }, [vehicle, stateCode, currentBill, dailyMiles, chargingHome, rate, hasTOU, offPeakDiscount]);

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

  const touOptions = [
    { value: "no", label: "No — flat rate" },
    { value: "yes", label: "Yes — time-of-use plan" },
  ];

  // Bill breakdown bar chart
  const currentPct = results.newBill > 0 ? (currentBill / results.newBill) * 100 : 100;
  const evPct = 100 - currentPct;

  return (
    <CalculatorLayout
      title="EV Electricity Bill Impact Calculator"
      description="See exactly how much your monthly electricity bill will increase when you start charging an EV at home."
      intro="Charging an EV at home typically adds $30-60 per month to your electricity bill, depending on how far you drive and your local rates. The average EV uses 25-35 kWh per 100 miles — at the national average of 16¢/kWh, that's about $4-6 per 100 miles added to your bill."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="EV Electricity Bill Impact Calculator"
        description="Calculate how much your electricity bill will increase when charging an EV at home. Includes time-of-use rate optimization."
        url="https://chargemath.com/bill-impact"
      />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://chargemath.com" }, { name: "Bill Impact Calculator", url: "https://chargemath.com/bill-impact" }]} />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.kwhPer100Miles} kWh/100mi efficiency`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
        />

        <NumberInput
          label="Current Monthly Electric Bill"
          value={currentBill}
          onChange={setCurrentBill}
          min={0}
          max={1000}
          step={5}
          unit="$"
          helpText="Your electric bill before adding an EV"
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

        <div className="sm:col-span-2">
          <SliderInput
            label="% of Charging Done at Home"
            value={chargingHome}
            onChange={setChargingHome}
            min={0}
            max={100}
            step={5}
            unit="%"
            showValue
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            The rest is assumed to be at work, public chargers, etc. (not on your bill)
          </p>
        </div>

        <SelectInput
          label="Time-of-Use (TOU) Rate Plan?"
          value={hasTOU}
          onChange={setHasTOU}
          options={touOptions}
          helpText="TOU plans offer cheaper overnight rates — great for EV charging"
        />

        {hasTOU === "yes" && (
          <SliderInput
            label="Off-Peak Discount"
            value={offPeakDiscount}
            onChange={setOffPeakDiscount}
            min={10}
            max={70}
            step={5}
            unit="% cheaper"
            showValue
          />
        )}
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your Bill Impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="EV Adds to Your Bill"
            value={fmt.format(results.monthlyEvCost)}
            unit="/month"
            highlight
            icon="⚡"
          />
          <ResultCard
            label="New Monthly Bill"
            value={fmt.format(results.newBill)}
            unit={fmtPct(results.percentIncrease)}
            icon="📄"
          />
          <ResultCard
            label="Annual EV Charging Cost"
            value={fmt.format(results.annualEvCost)}
            unit="/year"
            icon="📅"
          />
          <ResultCard
            label="Monthly EV kWh Usage"
            value={Math.round(results.monthlyEvKwh).toLocaleString()}
            unit="kWh"
            icon="🔌"
          />
          <ResultCard
            label="EV Share of Total Usage"
            value={results.evSharePercent.toFixed(1)}
            unit="%"
            icon="📊"
          />
          {hasTOU === "yes" && (
            <ResultCard
              label="TOU Savings"
              value={fmt.format(results.touSavings)}
              unit="/month"
              highlight
              icon="🌙"
            />
          )}
        </div>

        {/* Bill Breakdown Visual */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Bill Breakdown
          </h3>

          {/* Before */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text-muted)]">Before EV</span>
              <span className="font-semibold text-[var(--color-text)]">{fmt.format(currentBill)}</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[#64748b] transition-all duration-500"
                style={{ width: `${currentPct}%` }}
              />
            </div>
          </div>

          {/* After */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">After EV</span>
              <span className="font-semibold text-[var(--color-text)]">{fmt.format(results.newBill)}</span>
            </div>
            <div className="flex h-6 w-full overflow-hidden rounded-full">
              <div
                className="h-full bg-[#64748b] transition-all duration-500"
                style={{ width: `${currentPct}%` }}
                title={`Existing usage: ${fmt.format(currentBill)}`}
              />
              <div
                className="h-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${evPct}%` }}
                title={`EV charging: ${fmt.format(results.monthlyEvCost)}`}
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#64748b]" />
                Existing usage
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                EV charging
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
            Your bill increases by <span className="font-semibold text-[var(--color-text)]">{fmt.format(results.monthlyEvCost)}</span> ({fmtPct(results.percentIncrease)}) —
            {results.percentIncrease < 30
              ? " a modest increase for most households."
              : results.percentIncrease < 60
                ? " a noticeable but manageable increase."
                : " significant — consider a TOU rate plan to reduce costs."}
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          <Link href="/gas-vs-electric" className="text-blue-500 hover:underline">Compare gas vs electric costs &rarr;</Link>
        </p>

        <ShareResults
          title={`EV Bill Impact: ${fmtPct(results.percentIncrease)}`}
          text={`Adding a ${vehicle.year} ${vehicle.make} ${vehicle.model} to my home charging will increase my electric bill by ${fmt.format(results.monthlyEvCost)}/month (${fmtPct(results.percentIncrease)}). New bill: ${fmt.format(results.newBill)}/month.`}
        />
      </div>

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AffiliateCard
            title="Smart Energy Monitor"
            description="Track your whole-home and EV electricity usage in real-time. See exactly how much your EV costs per charge."
            priceRange="$100 - $300"
            amazonTag={AMAZON_TAG}
            searchQuery="smart home energy monitor electricity"
            imageAlt="Smart home energy monitor on Amazon"
            slug="bill-impact"
          />
          <AffiliateCard
            title="Smart EV Charger with Energy Tracking"
            description="Level 2 chargers with built-in energy monitoring, scheduling for off-peak hours, and app control."
            priceRange="$300 - $600"
            amazonTag={AMAZON_TAG}
            searchQuery="smart ev charger energy monitoring wifi"
            imageAlt="Smart EV charger with energy monitoring on Amazon"
            slug="bill-impact"
          />
        </div>
      </div>

      <FAQSection questions={billImpactFAQ} />
      <RelatedCalculators currentPath="/bill-impact" />
    </CalculatorLayout>
  );
}
