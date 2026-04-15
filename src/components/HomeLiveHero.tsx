"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SavingsVerdict from "./SavingsVerdict";
import SavingsTile from "./SavingsTile";
import SavingsMeter from "./SavingsMeter";
import SelectInput from "./SelectInput";
import SliderInput from "./SliderInput";
import NumberInput from "./NumberInput";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const DEFAULT_MPG = 28;
const DEFAULT_GAS_PRICE = 3.5;

/**
 * Live homepage hero. Runs a real SavingsVerdict on first paint with
 * sensible defaults (geo-IP state, 2024 Tesla Model 3, 35 daily miles,
 * national-average gas price and a 28 MPG reference car). Any input
 * change re-animates the result via CountUp and digit rolls.
 *
 * The advanced inputs section lets the user override gas price and
 * gas-car MPG so the answer reflects their specific comparison,
 * without forcing a navigation to the full Gas vs Electric calculator.
 */
export default function HomeLiveHero() {
  const defaultVehicleId =
    EV_VEHICLES.find((v) => v.model.toLowerCase().includes("model 3"))?.id ??
    EV_VEHICLES[0].id;

  const [vehicleId, setVehicleId] = useState(defaultVehicleId);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasPrice, setGasPrice] = useState(DEFAULT_GAS_PRICE);
  const [gasMpg, setGasMpg] = useState(DEFAULT_MPG);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setStateCode(getDefaultStateCode());
    setHydrated(true);
  }, []);

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate =
    (ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? "your state";
  const vehicleLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;
    const evAnnual = annualKwh * rate;
    const gasAnnual = (annualMiles / gasMpg) * gasPrice;
    const annualSavings = Math.max(0, gasAnnual - evAnnual);
    const fiveYear = annualSavings * 5;
    const evPerMile = rate * (vehicle.kwhPer100Miles / 100);
    const gasPerMile = gasPrice / gasMpg;
    const fuelCut =
      gasAnnual > 0
        ? Math.max(0, Math.min(100, Math.round((annualSavings / gasAnnual) * 100)))
        : 0;
    return {
      evAnnual,
      gasAnnual,
      annualSavings,
      fiveYear,
      evPerMile,
      gasPerMile,
      fuelCut,
      annualKwh,
    };
  }, [dailyMiles, vehicle, rate, gasPrice, gasMpg]);

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

  const deepLink = `/gas-vs-electric?vehicle=${encodeURIComponent(
    vehicleId
  )}&state=${encodeURIComponent(stateCode)}&miles=${dailyMiles}&gas=${gasPrice}&mpg=${gasMpg}`;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
      <div className="mb-4 flex flex-col gap-1">
        <span className="cm-eyebrow">EV savings, instantly</span>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-5xl">
          Your EV answer is already on screen.
        </h1>
        <p
          className="mt-2 max-w-prose text-sm text-[var(--color-ink-3)] sm:text-base"
          data-speakable="true"
        >
          Preloaded with {hydrated ? stateName : "your state"} electricity rates
          and a {vehicleLabel}. Change any input, the answer changes with you.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectInput
            label="Your EV"
            value={vehicleId}
            onChange={setVehicleId}
            options={vehicleOptions}
          />
          <SelectInput
            label="Your state"
            value={stateCode}
            onChange={setStateCode}
            options={stateOptions}
          />
          <SliderInput
            label="Daily miles"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={5}
            max={120}
            step={5}
            unit="mi"
            showValue
          />
        </div>
        <details className="group mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
            Compare to a different gas car
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Gas price"
              value={gasPrice}
              onChange={setGasPrice}
              min={1}
              max={10}
              step={0.1}
              unit="$/gal"
              helpText="Your local price, national average 3.50"
            />
            <NumberInput
              label="Gas car MPG"
              value={gasMpg}
              onChange={setGasMpg}
              min={10}
              max={60}
              step={1}
              unit="MPG"
              helpText="28 avg, 35 Corolla, 18 pickup"
            />
          </div>
        </details>
      </div>

      <SavingsVerdict
        headline="YOU SAVE"
        amount={Math.round(results.annualSavings)}
        amountUnit="/year"
        sub={
          <>
            Versus a {gasMpg} MPG gas car in {stateName} at ${gasPrice.toFixed(2)}
            /gal. Over 5 years, that is $
            {Math.round(results.fiveYear).toLocaleString()} you keep in your
            pocket.
          </>
        }
        dialPercent={results.fuelCut}
        dialLabel="FUEL CUT"
      >
        <SavingsTile
          label="ANNUAL SAVINGS"
          value={Math.round(results.annualSavings)}
          prefix="$"
          unit="/yr"
          tier="good"
        />
        <SavingsTile
          label="COST PER MILE"
          value={Number(results.evPerMile.toFixed(3))}
          prefix="$"
          decimals={3}
          unit=" EV"
          tier="brand"
          compareBars={[
            { label: "GAS", value: Number(results.gasPerMile.toFixed(3)), color: "var(--color-warn)" },
            { label: "EV", value: Number(results.evPerMile.toFixed(3)), color: "var(--color-teal)" },
          ]}
        />
        <SavingsTile
          label="5 YEAR SAVINGS"
          value={Math.round(results.fiveYear)}
          prefix="$"
          unit=" total"
          tier="volt"
        />
        <SavingsTile
          label="ANNUAL ENERGY"
          value={Math.round(results.annualKwh)}
          unit=" kWh"
          tier="mid"
        />
      </SavingsVerdict>

      <div className="mt-5">
        <SavingsMeter
          leftLabel="GAS"
          leftValue={Math.round(results.gasAnnual)}
          rightLabel="EV"
          rightValue={Math.round(results.evAnnual)}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <Link
          href={deepLink}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Open in Gas vs Electric calculator
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Break down your charging bill
        </Link>
        <Link
          href="/tax-credits"
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check 2026 tax credits
        </Link>
      </div>
    </section>
  );
}
