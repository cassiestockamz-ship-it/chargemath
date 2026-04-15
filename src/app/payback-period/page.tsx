"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
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
import { paybackPeriodFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

export default function PaybackPeriodPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [evPrice, setEvPrice] = useState(35000);
  const [gasCarPrice, setGasCarPrice] = useState(28000);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasCarMpg, setGasCarMpg] = useState(28);
  const [maintenanceSavings, setMaintenanceSavings] = useState(40);
  const [federalCredit, setFederalCredit] = useState(0);
  const [stateIncentive, setStateIncentive] = useState(0);

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: dailyMiles,
      evPrice: evPrice,
      gasPrice: gasPrice,
      mpg: gasCarMpg,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.evPrice) setEvPrice(Number(p.evPrice));
      if (p.gasPrice) setGasPrice(Number(p.gasPrice));
      if (p.mpg) setGasCarMpg(Number(p.mpg));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const electricityRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  const results = useMemo(() => {
    const monthlyMiles = dailyMiles * 30;

    // Monthly gas cost
    const monthlyGasCost = (monthlyMiles / gasCarMpg) * gasPrice;

    // Monthly electricity cost
    const monthlyKwh = (monthlyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyElecCost = monthlyKwh * electricityRate;

    // Monthly fuel savings (gas minus electricity)
    const monthlyFuelSavings = monthlyGasCost - monthlyElecCost;

    // Total monthly savings including maintenance
    const totalMonthlySavings = monthlyFuelSavings + maintenanceSavings;

    // Effective price premium after incentives
    const pricePremium = evPrice - gasCarPrice;
    const effectivePremium = Math.max(
      0,
      pricePremium - federalCredit - stateIncentive
    );

    // Payback period
    const paybackMonths =
      totalMonthlySavings > 0 ? effectivePremium / totalMonthlySavings : Infinity;
    const paybackYears = paybackMonths / 12;

    // Year-by-year cumulative savings (10 years)
    const yearBySavings: number[] = [];
    for (let y = 1; y <= 10; y++) {
      const cumulative = totalMonthlySavings * 12 * y - effectivePremium;
      yearBySavings.push(cumulative);
    }

    // Total 10-year savings
    const tenYearSavings = totalMonthlySavings * 120 - effectivePremium;

    return {
      monthlyGasCost,
      monthlyElecCost,
      monthlyFuelSavings,
      totalMonthlySavings,
      pricePremium,
      effectivePremium,
      paybackMonths,
      paybackYears,
      yearBySavings,
      tenYearSavings,
    };
  }, [
    dailyMiles,
    gasCarMpg,
    gasPrice,
    vehicle,
    electricityRate,
    maintenanceSavings,
    evPrice,
    gasCarPrice,
    federalCredit,
    stateIncentive,
  ]);

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

  // Year 5 recovery: share of EV premium recovered by year 5
  const fiveYearSavings = results.totalMonthlySavings * 60;
  const dialPercent =
    results.effectivePremium > 0
      ? Math.max(0, Math.min(100, (fiveYearSavings / results.effectivePremium) * 100))
      : 100;

  // Break-even month (rounded) for tile
  const breakEvenMonth =
    isFinite(results.paybackMonths) && results.paybackMonths > 0
      ? Math.ceil(results.paybackMonths)
      : 0;

  // Payback years for hero, capped at 99 when it never breaks even
  const heroYears = isFinite(results.paybackYears)
    ? Math.min(99, results.paybackYears)
    : 99;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi, ${vehicle.epaRangeMiles} mi range`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <SliderInput
        label="Daily miles driven"
        value={dailyMiles}
        onChange={setDailyMiles}
        min={10}
        max={150}
        step={5}
        unit="miles"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="PAYS OFF IN"
      amount={heroYears}
      amountPrefix=""
      amountDecimals={1}
      amountUnit=" years"
      sub={
        <>
          A {`$${Math.round(results.effectivePremium).toLocaleString()}`} EV premium recovered from {`$${Math.round(results.totalMonthlySavings).toLocaleString()}`}/mo in fuel and maintenance savings.
          10 year net: {`$${Math.round(results.tenYearSavings).toLocaleString()}`}.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="5 YR RECOVERY"
    >
      <SavingsTile
        label="ANNUAL SAVINGS"
        value={Math.max(0, results.totalMonthlySavings * 12)}
        prefix="$"
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="EV PREMIUM"
        value={results.effectivePremium}
        prefix="$"
        unit=" net"
        tier="warn"
        animate
      />
      <SavingsTile
        label="5 YR NET"
        value={Math.max(0, results.totalMonthlySavings * 60 - results.effectivePremium)}
        prefix="$"
        unit=" total"
        tier="volt"
        animate
      />
      <SavingsTile
        label="BREAK-EVEN MONTH"
        value={breakEvenMonth}
        unit={breakEvenMonth > 0 ? " mo" : " never"}
        tier={breakEvenMonth > 0 ? "good" : "warn"}
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Payback period"
      title="EV Payback Period Calculator"
      quickAnswer="Most EV buyers break even in 3 to 7 years. Higher daily miles and state incentives shorten the timeline."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Payback Period Calculator"
        description="Calculate when an electric vehicle pays for itself compared to a gas car, including fuel savings, maintenance savings, and tax incentives."
        url="https://chargemath.com/payback-period"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "EV Payback Period",
            url: "https://chargemath.com/payback-period",
          },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="group mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="EV purchase price"
            value={evPrice}
            onChange={setEvPrice}
            min={10000}
            max={150000}
            step={500}
            unit={"$"}
            helpText="Sticker price or negotiated price before incentives"
          />
          <NumberInput
            label="Comparable gas car price"
            value={gasCarPrice}
            onChange={setGasCarPrice}
            min={5000}
            max={100000}
            step={500}
            unit={"$"}
            helpText="Price of a similar gas car you would buy instead"
          />
          <NumberInput
            label="Gas price"
            value={gasPrice}
            onChange={setGasPrice}
            min={1}
            max={10}
            step={0.1}
            unit={"$/gal"}
          />
          <NumberInput
            label="Gas car fuel economy"
            value={gasCarMpg}
            onChange={setGasCarMpg}
            min={10}
            max={60}
            step={1}
            unit={"MPG"}
          />
          <NumberInput
            label="Monthly maintenance savings"
            value={maintenanceSavings}
            onChange={setMaintenanceSavings}
            min={0}
            max={200}
            step={5}
            unit={"$/mo"}
            helpText="No oil changes, fewer brake jobs, no transmission service"
          />
          <NumberInput
            label="Federal tax credit applied"
            value={federalCredit}
            onChange={setFederalCredit}
            min={0}
            max={7500}
            step={500}
            unit={"$"}
            helpText="30D expired Sept 30 2025. Enter $0 for new 2026+ purchases."
          />
          <NumberInput
            label="State incentive / rebate"
            value={stateIncentive}
            onChange={setStateIncentive}
            min={0}
            max={10000}
            step={250}
            unit={"$"}
            helpText="Check your state's current EV rebate programs"
          />
        </div>
      </details>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Gas vs electric cost comparison
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate monthly charging cost
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check available EV tax credits
        </Link>
      </div>

      <EducationalContent>
        <h2>How the EV Payback Calculation Works</h2>
        <p>
          This calculator compares the total cost of owning an EV versus a
          comparable gas car. The &quot;payback period&quot; is the number of months
          until cumulative savings from cheaper fuel and lower maintenance costs
          offset the higher purchase price of the EV.
        </p>
        <h3>What Goes Into the Calculation</h3>
        <p>
          The effective price premium is the EV price minus the gas car price,
          minus any federal or state incentives you receive. Monthly savings come
          from two sources: fuel savings (the difference between gas cost and
          electricity cost for the same miles) and maintenance savings (oil
          changes, brake pads, transmission service you no longer need).
        </p>
        <h3>Why Maintenance Savings Matter</h3>
        <p>
          EVs have significantly fewer moving parts than gas cars. There is no
          engine oil to change, no transmission fluid, no exhaust system, and
          regenerative braking means brake pads last 2 to 3 times longer.
          Consumer Reports estimates EV owners save about 50% on maintenance
          over the life of the vehicle. We default to $40/month, which is
          conservative for most drivers.
        </p>
        <h3>Tips to Shorten Your Payback Period</h3>
        <ul>
          <li>
            Drive more miles. Higher mileage means more fuel savings each month,
            which shrinks the payback period. Commuters driving 50+ miles/day
            often break even in under 3 years.
          </li>
          <li>
            Take advantage of every incentive. Stack state rebates with federal
            credits (when available) to cut the effective price premium.
          </li>
          <li>
            Charge at home on a time-of-use plan. Many utilities offer overnight
            rates 30 to 50% below standard rates, further reducing your
            electricity cost.
          </li>
          <li>
            Compare similar vehicles. Matching the EV to a truly comparable gas
            car (same size, features, trim level) gives the most accurate
            payback estimate.
          </li>
        </ul>
      </EducationalContent>

      <FAQSection questions={paybackPeriodFAQ} />
      <EmailCapture source="payback-period" />
      <RelatedCalculators currentPath="/payback-period" />
    </CalculatorShell>
  );
}
