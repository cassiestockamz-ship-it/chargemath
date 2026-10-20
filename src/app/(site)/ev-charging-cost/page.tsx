"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { US_GAS_PRICE, US_GAS_PRICE_LABEL, PUBLIC_DCFC_RATE, PUBLIC_DCFC_RATE_PERIOD } from "@/data/fuel-prices";
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
import HowToSchema from "@/components/HowToSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { chargingCostFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
  RATES_LABEL,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

export default function EVChargingCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [publicShare, setPublicShare] = useState(0);
  const [gasMpg, setGasMpg] = useState(28);

  // Auto-detect state from timezone on first visit
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  // Sync state to/from URL for shareable links
  useUrlSync(
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, public: publicShare, mpg: gasMpg },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.public && Number(p.public) >= 0 && Number(p.public) <= 100) setPublicShare(Number(p.public));
      // Old shared links used level=dcfast for all-public charging
      if (p.level === "dcfast" && !p.public) setPublicShare(100);
      if (p.mpg && Number(p.mpg) > 0) setGasMpg(Number(p.mpg));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  // Blended rate: home share at the residential rate, the rest at public DC fast prices
  const effectiveRate = useMemo(
    () => rate * (1 - publicShare / 100) + PUBLIC_DCFC_RATE * (publicShare / 100),
    [rate, publicShare]
  );

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = (dailyKwh * 365) / 12;
    const annualKwh = dailyKwh * 365;

    const homeFullCharge = vehicle.batteryCapacityKwh * rate;
    const fastCharge10to80 = vehicle.batteryCapacityKwh * 0.7 * PUBLIC_DCFC_RATE;
    const monthlyCost = monthlyKwh * effectiveRate;
    const annualCost = annualKwh * effectiveRate;
    const costPerMile = effectiveRate * (vehicle.kwhPer100Miles / 100);

    // Gas comparison
    const gasPrice = US_GAS_PRICE;
    const gasMonthlyCost = ((dailyMiles * 365) / 12 / gasMpg) * gasPrice;
    const gasAnnualCost = ((dailyMiles * 365) / gasMpg) * gasPrice;
    const gasCostPerMile = gasPrice / gasMpg;
    const monthlySavings = gasMonthlyCost - monthlyCost;
    const annualSavings = gasAnnualCost - annualCost;

    return {
      dailyKwh,
      monthlyKwh,
      annualKwh,
      homeFullCharge,
      fastCharge10to80,
      monthlyCost,
      annualCost,
      costPerMile,
      gasMonthlyCost,
      gasAnnualCost,
      gasCostPerMile,
      monthlySavings,
      annualSavings,
    };
  }, [dailyMiles, vehicle, effectiveRate, rate, gasMpg]);

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

  // Dial: share of gas cost eliminated (0-100)
  const gasEliminatedPct = results.gasMonthlyCost > 0
    ? Math.max(0, Math.min(100, Math.round(((results.gasMonthlyCost - results.monthlyCost) / results.gasMonthlyCost) * 100)))
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
        <SelectInput
          label="State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
          helpText={RATES_LABEL}
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
      <div>
        <SliderInput
          label="Share charged at public fast chargers"
          value={publicShare}
          onChange={setPublicShare}
          min={0}
          max={100}
          step={5}
          unit="%"
          showValue
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          {`Home at your state rate, public DC fast at $${PUBLIC_DCFC_RATE.toFixed(2)}/kWh (US average excluding free sessions, Paren ${PUBLIC_DCFC_RATE_PERIOD}). 0% means you charge only at home.`}
        </p>
      </div>
      <details className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Custom electricity rate (optional)"
            value={customRate ?? 0}
            onChange={(v) => setCustomRate(v > 0 ? v : null)}
            min={0}
            max={100}
            step={0.1}
            unit={"\u00A2/kWh"}
            helpText="Leave at 0 to use state average"
          />
          <NumberInput
            label="Gas car you are comparing (MPG)"
            value={gasMpg}
            onChange={(v) => setGasMpg(v > 0 ? v : 28)}
            min={5}
            max={80}
            step={1}
            unit="mpg"
            helpText={`Gas at ${US_GAS_PRICE_LABEL}`}
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="EV charging cost"
      headline="YOU PAY"
      amount={results.monthlyCost}
      amountUnit="/month"
      sub={`${publicShare === 0 ? "All home charging at your state rate" : `With ${publicShare}% of your charging at public fast chargers`}: $${Math.round(results.annualCost).toLocaleString()} a year`}
      dialPercent={gasEliminatedPct}
      dialLabel="VS GAS"
    >
      <>
        <SavingsTile
          label="COST PER MILE"
          value={results.costPerMile}
          prefix="$"
          decimals={3}
          unit=" EV"
          tier="good"
        />
        <SavingsTile
          label="FULL CHARGE AT HOME"
          value={results.homeFullCharge}
          prefix="$"
          decimals={2}
          unit=" 0-100%"
          tier="mid"
        />
        <SavingsTile
          label="FAST CHARGE 10-80%"
          value={results.fastCharge10to80}
          prefix="$"
          decimals={2}
          unit=" public"
          tier="mid"
        />
        <SavingsTile
          label="VS GAS"
          value={Math.max(0, results.annualSavings)}
          prefix="$"
          unit="/yr saved"
          tier="volt"
        />
      </>
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Charging Cost Calculator"
        description="Calculate your monthly and annual EV charging costs based on your vehicle, state electricity rates, and daily driving habits."
        url="https://chargemath.com/ev-charging-cost"
      />
      <HowToSchema
        name="How to estimate your monthly EV charging cost"
        description="Work out how much your EV adds to your electric bill every month, using EPA efficiency data and your state's residential rate."
        url="https://chargemath.com/ev-charging-cost"
        totalTime="PT1M"
        steps={[
          { name: "Pick your EV", text: "Choose your vehicle. The calculator pulls its EPA efficiency in kilowatt-hours per 100 miles." },
          { name: "Pick your state", text: "Your state selector sets the residential electricity rate (EIA averages). Rates vary by roughly 3x across the country, so this matters." },
          { name: "Set daily driving miles", text: "Drag the slider to your typical daily mileage. The calculator multiplies by 365 to get annual kilowatt-hours." },
          { name: "Optionally customize the rate", text: "If you know your actual cents per kilowatt-hour from a recent bill, open Advanced inputs and enter it. On a time-of-use plan, use your off-peak rate; the TOU Optimizer shows what that saves." },
          { name: "Read the monthly bill impact", text: "The hero shows the monthly cost. The Cost Per Mile tile shows how that compares to gas. The split meter below shows your fuel budget before and after going electric." },
        ]}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "EV Charging Cost Calculator", url: "https://chargemath.com/ev-charging-cost" },
        ]}
      />
      <CalculatorShell
        eyebrow="EV charging"
        title="Cost to Charge an Electric Car Calculator"
        quickAnswer={`At ${dailyMiles} miles a day and ${(effectiveRate * 100).toFixed(2)} cents per kWh, charging this EV costs about $${results.monthlyCost.toFixed(0)} a month. Change the car, state rate or miles below and the number follows.`}
        inputs={inputs}
        hero={hero}
      >
        <div className="mb-8">
          <SavingsMeter
            leftLabel="GAS"
            leftValue={results.gasAnnualCost}
            rightLabel="GRID"
            rightValue={results.annualCost}
          />
        </div>

        {/* Contextual cross-links */}
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/gas-vs-electric"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Compare gas vs electric costs
          </Link>
          <Link
            href="/charging-time"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            How long does this charge take?
          </Link>
          <Link
            href="/bill-impact"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            See your bill impact
          </Link>
        </div>

        <EducationalContent>
          <h2>How We Calculate EV Charging Costs</h2>
          <p>
            This calculator multiplies your vehicle&apos;s EPA-rated efficiency (kWh per 100 miles) by your daily mileage to determine energy consumption, then applies your state&apos;s residential electricity rate from the U.S. Energy Information Administration (EIA). Whatever share you charge at public DC fast chargers is priced at {`$${PUBLIC_DCFC_RATE.toFixed(2)}`} per kWh, the US average paid at public fast chargers excluding free sessions (Paren, {PUBLIC_DCFC_RATE_PERIOD}). EPA efficiency is measured from the wall plug, so charging losses are already inside the kWh figure; we do not add them twice.
          </p>
          <h3>Where the Data Comes From</h3>
          <p>
            Vehicle efficiency ratings come from the EPA&apos;s FuelEconomy.gov database, which tests every EV sold in the U.S. under standardized conditions. Electricity rates are EIA state-level residential averages updated annually. Real-world efficiency varies by 10-20% from EPA ratings depending on driving conditions, temperature, and speed.
          </p>
          <h3>Tips for Accuracy</h3>
          <ul>
            <li>Check your actual electricity rate on your utility bill. It may differ from the state average, especially if you have a time-of-use plan.</li>
            <li>Public fast charging prices vary by network, location and membership plan. Check the price your network&apos;s app shows before you plug in, and set the public share slider to how often you use it.</li>
            <li>Cold weather can increase energy consumption by 30 to 40%, so winter costs may be noticeably higher.</li>
            <li>Most EV owners charge to 80% daily, not 100%. A full charge estimate assumes you occasionally need maximum range.</li>
          </ul>
        </EducationalContent>
        <FAQSection questions={chargingCostFAQ} />
        <EmailCapture source="ev-charging-cost" />
        <RelatedCalculators currentPath="/ev-charging-cost" />
      </CalculatorShell>
    </>
  );
}
