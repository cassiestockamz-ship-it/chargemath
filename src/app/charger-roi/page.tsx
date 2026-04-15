"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsMeter from "@/components/SavingsMeter";
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
import { chargerRoiFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type PublicSplit = "100" | "75_25" | "50_50";

export default function ChargerROIPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargerCost, setChargerCost] = useState(500);
  const [installCost, setInstallCost] = useState(800);
  const [publicRate, setPublicRate] = useState(0.35);
  const [publicSplit, setPublicSplit] = useState<PublicSplit>("100");

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, charger: chargerCost, install: installCost },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.charger) setChargerCost(Number(p.charger));
      if (p.install) setInstallCost(Number(p.install));
    }, [])
  );

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
    const annualKwh = dailyKwh * 365;

    const totalUpfront = chargerCost + installCost;
    const monthlyHomeCost = monthlyKwh * homeRate;
    const homeAnnualCost = annualKwh * homeRate;

    // Monthly cost without a home charger (public + Level 1 mix)
    let monthlyWithoutHome: number;
    let publicAnnualCost: number;
    if (publicSplit === "100") {
      monthlyWithoutHome = monthlyKwh * publicRate;
      publicAnnualCost = annualKwh * publicRate;
    } else if (publicSplit === "75_25") {
      monthlyWithoutHome =
        0.75 * monthlyKwh * publicRate + 0.25 * monthlyKwh * homeRate;
      publicAnnualCost =
        0.75 * annualKwh * publicRate + 0.25 * annualKwh * homeRate;
    } else {
      monthlyWithoutHome =
        0.5 * monthlyKwh * publicRate + 0.5 * monthlyKwh * homeRate;
      publicAnnualCost =
        0.5 * annualKwh * publicRate + 0.5 * annualKwh * homeRate;
    }

    const monthlySavings = monthlyWithoutHome - monthlyHomeCost;
    const paybackMonths =
      monthlySavings > 0 ? totalUpfront / monthlySavings : Infinity;
    const fiveYearNet = monthlySavings * 60 - totalUpfront;
    const lifetimeSavings = Math.max(0, fiveYearNet);

    // Time savings: Level 2 ~30 mi/hr vs Level 1 ~4 mi/hr
    const weeklyMiles = dailyMiles * 7;
    const weeklyHoursL1 = weeklyMiles / 4;
    const weeklyHoursL2 = weeklyMiles / 30;
    const weeklyTimeSaved = weeklyHoursL1 - weeklyHoursL2;

    return {
      monthlyKwh,
      totalUpfront,
      monthlyHomeCost,
      homeAnnualCost,
      monthlyWithoutHome,
      publicAnnualCost,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      paybackMonths,
      fiveYearNet,
      lifetimeSavings,
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
      label: `${data.state} (${data.residential}\u00A2/kWh)`,
    }));

  const publicSplitOptions: { value: PublicSplit; label: string }[] = [
    { value: "100", label: "100% public charging" },
    { value: "75_25", label: "75% public / 25% Level 1" },
    { value: "50_50", label: "50% public / 50% Level 1" },
  ];

  // For the dial: return percentage, capped at 100
  const totalInvestment = Math.max(1, chargerCost + installCost);
  const returnPct = Math.min(
    100,
    Math.max(0, Math.round((results.lifetimeSavings / totalInvestment) * 100))
  );

  // Payback amount shown in the hero: integer months, or 999 if never
  const paybackDisplay = isFinite(results.paybackMonths)
    ? Math.ceil(results.paybackMonths)
    : 0;

  const inputs = (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectInput
          label="Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh, ${vehicle.epaRangeMiles} mi range`}
        />
        <NumberInput
          label="Home Charger Cost"
          value={chargerCost}
          onChange={setChargerCost}
          min={0}
          max={5000}
          step={50}
          unit="$"
        />
        <SliderInput
          label="Daily Miles"
          value={dailyMiles}
          onChange={setDailyMiles}
          min={10}
          max={150}
          step={5}
          unit="mi"
          showValue
        />
      </div>
      <details className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Installation cost"
            value={installCost}
            onChange={setInstallCost}
            min={0}
            max={10000}
            step={50}
            unit="$"
            helpText="Electrician and panel upgrade if needed"
          />
          <NumberInput
            label="Public charging rate"
            value={publicRate}
            onChange={setPublicRate}
            min={0}
            max={2}
            step={0.01}
            unit="$/kWh"
            helpText="Average DC fast charging rate"
          />
          <SelectInput
            label="State"
            value={stateCode}
            onChange={setStateCode}
            options={stateOptions}
            helpText="Sets your home electricity rate"
          />
          <NumberInput
            label="Custom home rate (optional)"
            value={customRate ?? 0}
            onChange={(v) => setCustomRate(v > 0 ? v : null)}
            min={0}
            max={100}
            step={0.1}
            unit={"\u00A2/kWh"}
            helpText="Leave at 0 to use state average"
          />
          <SelectInput
            label="Without a home charger, you would use"
            value={publicSplit}
            onChange={(v) => setPublicSplit(v as PublicSplit)}
            options={publicSplitOptions}
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Home charger ROI"
      headline="PAYS OFF IN"
      amount={paybackDisplay}
      amountPrefix=""
      amountDecimals={0}
      amountUnit=" months"
      sub="Versus using public fast chargers at $0.40 to $0.60 per kWh"
      dialPercent={returnPct}
      dialLabel="RETURN"
    >
      <>
        <SavingsTile
          label="MONTHLY SAVINGS"
          value={Math.max(0, results.monthlySavings)}
          prefix="$"
          unit="/mo"
          tier="good"
        />
        <SavingsTile
          label="LIFETIME SAVINGS"
          value={results.lifetimeSavings}
          prefix="$"
          unit=" total"
          tier="volt"
        />
        <SavingsTile
          label="PUBLIC CHARGING"
          value={results.publicAnnualCost}
          prefix="$"
          unit="/yr"
          tier="warn"
        />
        <SavingsTile
          label="HOME CHARGING"
          value={results.homeAnnualCost}
          prefix="$"
          unit="/yr"
          tier="brand"
        />
      </>
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="Home EV Charger ROI Calculator"
        description="Calculate the payback period for installing a Level 2 home EV charger compared to public charging or Level 1 charging."
        url="https://chargemath.com/charger-roi"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Home Charger ROI", url: "https://chargemath.com/charger-roi" },
        ]}
      />
      <CalculatorShell
        eyebrow="Home charger"
        title="Home Charger ROI"
        quickAnswer="A Level 2 home charger typically pays for itself in 1 to 3 years versus public fast charging."
        inputs={inputs}
        hero={hero}
      >
        <div className="mb-8">
          <SavingsMeter
            leftLabel="PUBLIC"
            leftValue={results.publicAnnualCost}
            rightLabel="HOME"
            rightValue={results.homeAnnualCost}
          />
        </div>

        {/* Contextual cross-links */}
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/charging-time"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Check your charging time
          </Link>
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate monthly charging cost
          </Link>
          <Link
            href="/tax-credits"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Get a charger installation credit
          </Link>
        </div>

        <EducationalContent>
          <h2>How the Charger ROI Calculation Works</h2>
          <p>
            The payback period divides your total upfront cost (charger plus installation) by the monthly savings from charging at home versus your current mix of public and Level 1 charging. Home electricity rates come from EIA state averages. Public charging rates default to $0.35 per kWh, which reflects the 2026 average across major networks like Electrify America and ChargePoint.
          </p>
          <h3>Installation Costs: What to Expect</h3>
          <p>
            The charger unit itself typically costs $300 to $600. Installation costs vary more: a simple NEMA 14-50 outlet install runs $200 to $500 if your panel is nearby and has capacity. Panel upgrades add $1,000 to $3,000. Running new wire from a distant panel adds $500 to $1,500. Get three quotes from licensed electricians. Prices vary significantly by region.
          </p>
          <h3>Factors That Improve Your ROI</h3>
          <ul>
            <li>High daily mileage: the more you drive, the faster a home charger pays off. Commuters driving 50+ miles per day typically break even in under a year.</li>
            <li>Time-of-use electricity plans: many utilities offer overnight rates 30 to 50% below standard rates, making home charging even cheaper.</li>
            <li>The federal 30C charger tax credit covers 30% of equipment and installation costs (up to $1,000), reducing your payback period by nearly a third.</li>
            <li>Home chargers can increase property value. A 2024 Zillow study found homes with EV chargers sold for 3.3% more on average.</li>
          </ul>
        </EducationalContent>
        <FAQSection questions={chargerRoiFAQ} />
        <EmailCapture source="charger-roi" />
        <RelatedCalculators currentPath="/charger-roi" />
      </CalculatorShell>
    </>
  );
}
