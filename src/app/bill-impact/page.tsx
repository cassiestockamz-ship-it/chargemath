"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SavingsMeter from "@/components/SavingsMeter";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { billImpactFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

export default function BillImpactPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [currentBill, setCurrentBill] = useState(150);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargingHome, setChargingHome] = useState(100);
  const [hasTOU, setHasTOU] = useState("no");
  const [offPeakDiscount, setOffPeakDiscount] = useState(40);

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { vehicle: vehicleId, state: stateCode, bill: currentBill, miles: dailyMiles, home: chargingHome },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.bill) setCurrentBill(Number(p.bill));
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.home) setChargingHome(Number(p.home));
    }, [])
  );

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
  }, [vehicle, currentBill, dailyMiles, chargingHome, rate, hasTOU, offPeakDiscount]);

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
    { value: "no", label: "No (flat rate)" },
    { value: "yes", label: "Yes (time-of-use plan)" },
  ];

  // Compact primary input strip
  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <NumberInput
        label="Current monthly bill"
        value={currentBill}
        onChange={setCurrentBill}
        min={0}
        max={1000}
        step={5}
        unit="$"
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="BILL GOES UP"
      amount={results.monthlyEvCost}
      amountUnit="/month"
      sub={
        <>
          Adding a {vehicle.year} {vehicle.make} {vehicle.model} to your home charging raises your
          bill from {`$${currentBill.toFixed(0)}`} to {`$${results.newBill.toFixed(0)}`} per month.
        </>
      }
      dialPercent={Math.max(0, Math.min(100, results.evSharePercent))}
      dialLabel="EV SHARE"
    >
      <SavingsTile
        label="NEW MONTHLY BILL"
        value={results.newBill}
        prefix="$"
        unit="/mo"
        tier="brand"
        animate
      />
      <SavingsTile
        label="EV SHARE"
        value={results.evSharePercent}
        decimals={1}
        unit="% of bill"
        tier="volt"
        animate
      />
      <SavingsTile
        label="ANNUAL ADD"
        value={results.annualEvCost}
        prefix="$"
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="kWh/MONTH"
        value={Math.round(results.monthlyEvKwh)}
        unit=" kWh"
        tier="mid"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Bill impact"
      title="EV Electricity Bill Impact"
      quickAnswer="Charging an EV at home typically adds $30 to $60 per month to your electricity bill, depending on miles driven and local rates."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Electricity Bill Impact Calculator"
        description="Calculate how much your electricity bill will increase when charging an EV at home. Includes time-of-use rate optimization."
        url="https://chargemath.com/bill-impact"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Bill Impact Calculator", url: "https://chargemath.com/bill-impact" },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SliderInput
            label="Daily miles driven"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={10}
            max={150}
            step={5}
            unit="mi"
            showValue
          />
          <SliderInput
            label="Home charging share"
            value={chargingHome}
            onChange={setChargingHome}
            min={0}
            max={100}
            step={5}
            unit="%"
            showValue
          />
          <SelectInput
            label="Time-of-use rate plan?"
            value={hasTOU}
            onChange={setHasTOU}
            options={touOptions}
            helpText="TOU plans offer cheaper overnight rates"
          />
          {hasTOU === "yes" && (
            <SliderInput
              label="Off-peak discount"
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
      </details>

      {/* Signature split-column live meter: BEFORE vs AFTER monthly bill */}
      <SavingsMeter
        leftLabel="BEFORE"
        leftValue={currentBill}
        rightLabel="AFTER"
        rightValue={results.newBill}
        period="/mo"
        verb="ADDS"
      />

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Compare gas vs electric costs
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Break down your charging cost
        </Link>
        <Link
          href="/charger-roi"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Is a home charger worth it?
        </Link>
      </div>

      <EducationalContent>
        <h2>How we estimate your bill impact</h2>
        <p>
          This calculator converts your daily mileage into energy consumption using your vehicle&apos;s EPA efficiency rating, then multiplies by your state&apos;s average residential electricity rate from the EIA. The home charging percentage lets you account for workplace or public charging that would not appear on your home bill.
        </p>
        <h3>Time-of-use plans can cut EV costs 30-50%</h3>
        <p>
          Many utilities offer time-of-use (TOU) rate plans with heavily discounted overnight rates, exactly when most people charge their EVs. In California, PG&amp;E&apos;s EV rate charges 25&cent;/kWh off-peak versus 55&cent;/kWh peak. Most smart EV chargers can schedule charging to start automatically when off-peak rates begin.
        </p>
        <h3>Reducing your EV&apos;s impact on your bill</h3>
        <ul>
          <li>Switch to a TOU plan. This is the single biggest cost reduction available to most EV owners. Contact your utility to compare plan options.</li>
          <li>Charge during off-peak hours (typically 9pm to 6am). Even without a formal TOU plan, avoiding peak demand helps grid stability and may qualify for utility incentives.</li>
          <li>A whole-home energy monitor ($100 to $300) can track exactly what your EV costs per charge and identify other energy savings opportunities.</li>
          <li>Solar panels can offset 100% of EV charging costs for homeowners, with typical payback periods of 5 to 8 years depending on your state&apos;s solar resources.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={billImpactFAQ} />
      <EmailCapture source="bill-impact" />
      <RelatedCalculators currentPath="/bill-impact" />
    </CalculatorShell>
  );
}
