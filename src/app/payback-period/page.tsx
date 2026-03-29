"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import Link from "next/link";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { paybackPeriodFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

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

  const formatPayback = (months: number): string => {
    if (!isFinite(months) || months <= 0) return "N/A";
    const roundedMonths = Math.ceil(months);
    if (roundedMonths < 12) return `${roundedMonths} months`;
    const years = Math.floor(roundedMonths / 12);
    const remaining = roundedMonths % 12;
    if (remaining === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""}, ${remaining} month${remaining > 1 ? "s" : ""}`;
  };

  // Break-even timeline bar (capped at 10 years / 120 months)
  const paybackCapped = Math.min(results.paybackMonths, 120);
  const paybackPct = isFinite(results.paybackMonths)
    ? (paybackCapped / 120) * 100
    : 100;

  return (
    <CalculatorLayout
      title="EV Payback Period Calculator"
      description="Find out when an electric vehicle pays for itself compared to a similar gas car, factoring in fuel savings, maintenance, and incentives."
      intro="The average EV costs $5,000 to $15,000 more than a comparable gas car upfront, but lower fuel and maintenance costs close the gap over time. Most EV buyers break even in 3 to 7 years. This calculator shows your specific payback timeline based on real electricity rates, gas prices, and your driving habits."
      lastUpdated="March 2026"
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.kwhPer100Miles} kWh/100mi \u2022 ${vehicle.epaRangeMiles} mi EPA range`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText="Determines your electricity rate from EIA data"
        />

        <NumberInput
          label="EV Purchase Price"
          value={evPrice}
          onChange={setEvPrice}
          min={10000}
          max={150000}
          step={500}
          unit={"$"}
          helpText="Sticker price or negotiated price before incentives"
        />

        <NumberInput
          label="Comparable Gas Car Price"
          value={gasCarPrice}
          onChange={setGasCarPrice}
          min={5000}
          max={100000}
          step={500}
          unit={"$"}
          helpText="Price of a similar gas car you would buy instead"
        />

        <NumberInput
          label="Gas Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={10}
          step={0.1}
          unit={"$/gal"}
        />

        <NumberInput
          label="Gas Car Fuel Economy"
          value={gasCarMpg}
          onChange={setGasCarMpg}
          min={10}
          max={60}
          step={1}
          unit={"MPG"}
        />

        <NumberInput
          label="Monthly Maintenance Savings"
          value={maintenanceSavings}
          onChange={setMaintenanceSavings}
          min={0}
          max={200}
          step={5}
          unit={"$/mo"}
          helpText="No oil changes, fewer brake jobs, no transmission service"
        />

        <NumberInput
          label="Federal Tax Credit Applied"
          value={federalCredit}
          onChange={setFederalCredit}
          min={0}
          max={7500}
          step={500}
          unit={"$"}
          helpText="30D expired early 2026; enter $0 unless you qualify otherwise"
        />

        <NumberInput
          label="State Incentive / Rebate"
          value={stateIncentive}
          onChange={setStateIncentive}
          min={0}
          max={10000}
          step={250}
          unit={"$"}
          helpText="Check your state's current EV rebate programs"
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
          Your Payback Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Payback Period"
            value={formatPayback(results.paybackMonths)}
            unit=""
            highlight
            icon="\uD83D\uDCC5"
          />
          <ResultCard
            label="Monthly Fuel Savings"
            value={fmt.format(results.monthlyFuelSavings)}
            unit="/month"
            icon="\u26FD"
          />
          <ResultCard
            label="Total Monthly Savings"
            value={fmt.format(results.totalMonthlySavings)}
            unit="/month (fuel + maintenance)"
            icon="\uD83D\uDCB0"
          />
          <ResultCard
            label="Effective Price Premium"
            value={fmtShort.format(results.effectivePremium)}
            unit="after incentives"
            icon="\uD83C\uDFF7\uFE0F"
          />
          <ResultCard
            label="10-Year Net Savings"
            value={fmtShort.format(results.tenYearSavings)}
            unit="total"
            highlight
            icon="\uD83C\uDFC6"
          />
          <ResultCard
            label="Monthly Gas Cost (Comparable)"
            value={fmt.format(results.monthlyGasCost)}
            unit="/month"
            icon="\uD83D\uDEE2\uFE0F"
          />
        </div>

        {/* Monthly Savings Breakdown */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Savings Breakdown
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">
                Gas car fuel cost
              </span>
              <span className="font-medium text-[var(--color-text)]">
                {fmt.format(results.monthlyGasCost)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">
                EV electricity cost
              </span>
              <span className="font-medium text-[var(--color-text)]">
                {fmt.format(results.monthlyElecCost)}/mo
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="text-[var(--color-text-muted)]">
                Fuel savings
              </span>
              <span className="font-medium text-[var(--color-ev-green)]">
                {fmt.format(results.monthlyFuelSavings)}/mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">
                Maintenance savings
              </span>
              <span className="font-medium text-[var(--color-ev-green)]">
                {fmt.format(maintenanceSavings)}/mo
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="font-semibold text-[var(--color-text)]">
                Total monthly savings
              </span>
              <span className="font-bold text-[var(--color-ev-green)]">
                {fmt.format(results.totalMonthlySavings)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Break-Even Timeline */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Break-Even Timeline
          </h3>
          <div className="relative">
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${paybackPct}%` }}
              />
            </div>

            <div className="mt-3 flex items-start justify-between text-xs">
              <div className="text-[var(--color-text-muted)]">
                <span className="block font-semibold">Today</span>
                <span>{fmtShort.format(results.effectivePremium)} premium</span>
              </div>

              {isFinite(results.paybackMonths) &&
                results.paybackMonths <= 120 && (
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
                <span className="block font-semibold">10 Years</span>
                <span className="font-semibold text-[var(--color-ev-green)]">
                  {fmtShort.format(results.tenYearSavings)} saved
                </span>
              </div>
            </div>
          </div>

          {!isFinite(results.paybackMonths) && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              The EV does not pay for itself with current settings. Try
              increasing daily miles, adjusting gas prices, or adding
              incentives.
            </p>
          )}

          {isFinite(results.paybackMonths) && results.paybackMonths > 120 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Payback period exceeds 10 years (
              {formatPayback(results.paybackMonths)}). Consider a lower-priced
              EV, higher daily mileage, or available incentives.
            </p>
          )}
        </div>

        {/* Year-by-Year Cumulative Savings */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Year-by-Year Cumulative Savings
          </h3>
          <div className="space-y-2 text-sm">
            {results.yearBySavings.map((cumulative, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">
                  Year {i + 1}
                </span>
                <span
                  className={`font-medium ${
                    cumulative >= 0
                      ? "text-[var(--color-ev-green)]"
                      : "text-red-500"
                  }`}
                >
                  {cumulative >= 0 ? "+" : ""}
                  {fmtShort.format(cumulative)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Gas vs electric cost comparison →
          </Link>
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate monthly charging cost →
          </Link>
          <Link
            href="/tax-credits"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Check available EV tax credits →
          </Link>
        </div>
      </div>

      <ShareResults
        title={`EV Payback: ${formatPayback(results.paybackMonths)}`}
        text={`My EV pays for itself in ${formatPayback(results.paybackMonths)} vs a gas car. Saving ${fmt.format(results.totalMonthlySavings)}/month on fuel and maintenance. ${fmtShort.format(results.tenYearSavings)} total savings over 10 years!`}
      />

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
    </CalculatorLayout>
  );
}
