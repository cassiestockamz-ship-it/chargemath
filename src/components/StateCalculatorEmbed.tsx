"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SavingsVerdict from "./SavingsVerdict";
import SavingsTile from "./SavingsTile";
import SavingsMeter from "./SavingsMeter";
import SelectInput from "./SelectInput";
import SliderInput from "./SliderInput";
import { EV_VEHICLES } from "@/data/ev-vehicles";

interface Props {
  /** State name like "California" */
  stateName: string;
  /** State code like "CA" */
  stateCode: string;
  /** State residential rate in cents per kWh */
  ratePerKwhCents: number;
}

const DEFAULT_MPG = 28;
const DEFAULT_GAS_PRICE = 3.5;

/**
 * A state-locked live calculator embedded in every /guides/[state]
 * page. Same shape as HomeLiveHero but the state is fixed. User can
 * change the EV and daily miles. The answer count-ups on every change.
 */
export default function StateCalculatorEmbed({
  stateName,
  stateCode,
  ratePerKwhCents,
}: Props) {
  const defaultId =
    EV_VEHICLES.find((v) => v.model.toLowerCase().includes("model 3"))?.id ??
    EV_VEHICLES[0].id;
  const [vehicleId, setVehicleId] = useState(defaultId);
  const [dailyMiles, setDailyMiles] = useState(35);

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = ratePerKwhCents / 100;

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;
    const evAnnual = annualKwh * rate;
    const gasAnnual = (annualMiles / DEFAULT_MPG) * DEFAULT_GAS_PRICE;
    const annualSavings = Math.max(0, gasAnnual - evAnnual);
    const monthly = evAnnual / 12;
    const fiveYear = annualSavings * 5;
    const evPerMile = rate * (vehicle.kwhPer100Miles / 100);
    const gasPerMile = DEFAULT_GAS_PRICE / DEFAULT_MPG;
    const fuelCut =
      gasAnnual > 0
        ? Math.max(0, Math.min(100, Math.round((annualSavings / gasAnnual) * 100)))
        : 0;
    return {
      evAnnual,
      gasAnnual,
      annualSavings,
      monthly,
      fiveYear,
      evPerMile,
      gasPerMile,
      fuelCut,
    };
  }, [dailyMiles, vehicle, rate]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const deepLink = `/gas-vs-electric?vehicle=${encodeURIComponent(
    vehicleId
  )}&state=${encodeURIComponent(stateCode)}&miles=${dailyMiles}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Your EV"
            value={vehicleId}
            onChange={setVehicleId}
            options={vehicleOptions}
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
        <p className="mt-3 cm-mono" style={{ color: "var(--color-ink-3)" }}>
          State rate locked at {ratePerKwhCents.toFixed(1)}¢/kWh (EIA residential average).
        </p>
      </div>

      <SavingsVerdict
        eyebrow={`${stateName} savings`}
        headline="YOU SAVE"
        amount={Math.round(results.annualSavings)}
        amountUnit="/year"
        sub={
          <>
            In {stateName}, versus a 28 MPG gas car at $3.50/gal. Over 5 years,
            that is ${Math.round(results.fiveYear).toLocaleString()}.
          </>
        }
        dialPercent={results.fuelCut}
        dialLabel="FUEL CUT"
        morphHero={false}
      >
        <SavingsTile
          label="MONTHLY CHARGING"
          value={Math.round(results.monthly)}
          prefix="$"
          unit="/mo"
          tier="brand"
        />
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
      </SavingsVerdict>

      <SavingsMeter
        leftLabel="GAS"
        leftValue={Math.round(results.gasAnnual)}
        rightLabel="EV"
        rightValue={Math.round(results.evAnnual)}
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={deepLink}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Open full comparison calculator
        </Link>
        <Link
          href={`/ev-charging-cost?state=${stateCode}`}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Break down your charging bill
        </Link>
        <Link
          href={`/charger-roi?state=${stateCode}`}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Home charger payback
        </Link>
      </div>
    </div>
  );
}
