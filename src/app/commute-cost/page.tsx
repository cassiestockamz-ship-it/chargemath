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
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const commuteFAQ = [
  {
    question: "How much does it cost to commute with an EV?",
    answer:
      "The average EV commuter with a 25-mile one-way trip spends roughly $30-50 per month on electricity for commuting, compared to $100-150 for a gas car. Your actual cost depends on your vehicle's efficiency, local electricity rate, and commute distance.",
  },
  {
    question: "Should I charge my EV at home or at work for commuting?",
    answer:
      "Home charging on a Level 2 charger is typically the most cost-effective option, especially if your utility offers off-peak rates. Workplace charging can be even cheaper if your employer provides free or subsidized charging. Public DC fast chargers cost 2-3x more than home charging and should be reserved for road trips.",
  },
  {
    question: "How much of my EV range does a typical commute use?",
    answer:
      "A 25-mile one-way commute (50 miles round trip) uses about 15-20% of a typical EV's range. Most modern EVs have 250-350 miles of range, so daily commuting rarely requires more than a partial overnight charge. You generally only need to plug in every 2-3 days for short commutes.",
  },
  {
    question: "Does cold weather affect EV commuting costs?",
    answer:
      "Yes, cold weather can increase EV energy consumption by 20-40% due to cabin heating and reduced battery efficiency. A commute that costs $1.50 in summer might cost $2.00-2.10 in winter. However, preconditioning your car while plugged in can reduce this impact significantly.",
  },
  {
    question: "Are tolls and parking included in commute cost calculations?",
    answer:
      "This calculator lets you add daily toll and parking costs to get a complete picture of your commute expenses. These fixed costs apply equally to EVs and gas cars, but many cities offer reduced tolls or free parking for electric vehicles, which can increase your total savings.",
  },
];

export default function CommuteCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [oneWayMiles, setOneWayMiles] = useState(25);
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState(5);
  const [weeksPerYear, setWeeksPerYear] = useState(50);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);
  const [parkingCostPerDay, setParkingCostPerDay] = useState(0);
  const [tollsPerDay, setTollsPerDay] = useState(0);

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
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: oneWayMiles,
      days: workDaysPerWeek,
      weeks: weeksPerYear,
      gas: gasPrice,
      mpg: gasMpg,
      parking: parkingCostPerDay,
      tolls: tollsPerDay,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setOneWayMiles(Number(p.miles));
      if (p.days) setWorkDaysPerWeek(Number(p.days));
      if (p.weeks) setWeeksPerYear(Number(p.weeks));
      if (p.gas) setGasPrice(Number(p.gas));
      if (p.mpg) setGasMpg(Number(p.mpg));
      if (p.parking) setParkingCostPerDay(Number(p.parking));
      if (p.tolls) setTollsPerDay(Number(p.tolls));
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
    const dailyCommuteMiles = oneWayMiles * 2;
    const workDaysPerYear = workDaysPerWeek * weeksPerYear;
    const monthlyCommuteMiles = (dailyCommuteMiles * workDaysPerYear) / 12;
    const annualCommuteMiles = dailyCommuteMiles * workDaysPerYear;

    // EV costs
    const dailyKwh = (dailyCommuteMiles / 100) * vehicle.kwhPer100Miles;
    const dailyEvCost = dailyKwh * rate;
    const monthlyEvCost = (monthlyCommuteMiles / 100) * vehicle.kwhPer100Miles * rate;
    const annualEvCost = (annualCommuteMiles / 100) * vehicle.kwhPer100Miles * rate;

    // Gas costs
    const dailyGasCost = (dailyCommuteMiles / gasMpg) * gasPrice;
    const monthlyGasCost = (monthlyCommuteMiles / gasMpg) * gasPrice;
    const annualGasCost = (annualCommuteMiles / gasMpg) * gasPrice;

    // Fixed commute costs (parking + tolls)
    const dailyFixedCost = parkingCostPerDay + tollsPerDay;
    const monthlyFixedCost = (dailyFixedCost * workDaysPerYear) / 12;
    const annualFixedCost = dailyFixedCost * workDaysPerYear;

    // Total costs including fixed
    const dailyEvTotal = dailyEvCost + dailyFixedCost;
    const dailyGasTotal = dailyGasCost + dailyFixedCost;
    const monthlyEvTotal = monthlyEvCost + monthlyFixedCost;
    const monthlyGasTotal = monthlyGasCost + monthlyFixedCost;
    const annualEvTotal = annualEvCost + annualFixedCost;
    const annualGasTotal = annualGasCost + annualFixedCost;

    // Savings (fuel only, since fixed costs are same for both)
    const monthlySavings = monthlyGasCost - monthlyEvCost;
    const annualSavings = annualGasCost - annualEvCost;
    const fiveYearSavings = annualSavings * 5;

    // Range used per commute day
    const rangeUsedPercent = (dailyCommuteMiles / vehicle.epaRangeMiles) * 100;

    return {
      dailyCommuteMiles,
      monthlyCommuteMiles: Math.round(monthlyCommuteMiles),
      annualCommuteMiles,
      dailyEvCost,
      dailyGasCost,
      dailyEvTotal,
      dailyGasTotal,
      monthlyEvCost,
      monthlyGasCost,
      monthlyEvTotal,
      monthlyGasTotal,
      annualEvCost,
      annualGasCost,
      annualEvTotal,
      annualGasTotal,
      monthlySavings,
      annualSavings,
      fiveYearSavings,
      rangeUsedPercent,
      dailyFixedCost,
    };
  }, [oneWayMiles, workDaysPerWeek, weeksPerYear, vehicle, rate, gasPrice, gasMpg, parkingCostPerDay, tollsPerDay]);

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

  const workDayOptions = [
    { value: "3", label: "3 days/week" },
    { value: "4", label: "4 days/week" },
    { value: "5", label: "5 days/week" },
    { value: "6", label: "6 days/week" },
  ];

  const dialPercent =
    results.monthlyGasCost > 0
      ? Math.max(0, Math.min(100, (results.monthlySavings / results.monthlyGasCost) * 100))
      : 0;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.epaRangeMiles} mi range, ${vehicle.kwhPer100Miles} kWh/100mi`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <SliderInput
        label="One-way commute"
        value={oneWayMiles}
        onChange={setOneWayMiles}
        min={5}
        max={100}
        step={1}
        unit="mi"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="COMMUTE COSTS"
      amount={results.monthlyEvCost}
      amountUnit="/month"
      sub={
        <>
          {results.dailyCommuteMiles} miles round trip, {workDaysPerWeek} days a week. Driving a
          gas car instead would cost {`$${results.monthlyGasCost.toFixed(0)}`}/month, so EV saves
          you {`$${results.monthlySavings.toFixed(0)}`}/month.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="FUEL CUT"
    >
      <SavingsTile
        label="PER TRIP"
        value={results.dailyEvCost}
        prefix="$"
        decimals={2}
        unit="/day"
        tier="brand"
        animate
      />
      <SavingsTile
        label="MONTHLY"
        value={results.monthlyEvCost}
        prefix="$"
        unit="/mo"
        tier="volt"
        animate
      />
      <SavingsTile
        label="ANNUAL"
        value={results.annualEvCost}
        prefix="$"
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="5 YEAR"
        value={results.annualEvCost * 5}
        prefix="$"
        unit=" total"
        tier="mid"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Commute cost"
      title="EV Commute Cost"
      quickAnswer="A 25-mile one-way EV commute typically costs $30 to $50 per month in electricity, compared to $100 to $150 for a gas car."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Commute Cost Calculator"
        description="Calculate and compare daily commute costs for an EV vs gas car based on your vehicle, commute distance, and local electricity rates."
        url="https://chargemath.com/commute-cost"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Commute Cost Calculator", url: "https://chargemath.com/commute-cost" },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SelectInput
            label="Work days per week"
            value={String(workDaysPerWeek)}
            onChange={(v) => setWorkDaysPerWeek(Number(v))}
            options={workDayOptions}
          />
          <NumberInput
            label="Weeks worked per year"
            value={weeksPerYear}
            onChange={setWeeksPerYear}
            min={1}
            max={52}
            step={1}
            helpText="Typically 48 to 50 after vacation"
          />
          <NumberInput
            label="Gas price"
            value={gasPrice}
            onChange={setGasPrice}
            min={1}
            max={10}
            step={0.1}
            unit="$/gal"
          />
          <NumberInput
            label="Gas car MPG"
            value={gasMpg}
            onChange={setGasMpg}
            min={10}
            max={60}
            step={1}
            unit="MPG"
          />
          <NumberInput
            label="Parking cost per day"
            value={parkingCostPerDay}
            onChange={setParkingCostPerDay}
            min={0}
            max={100}
            step={1}
            unit="$/day"
            helpText="Leave at 0 if parking is free"
          />
          <NumberInput
            label="Tolls per day"
            value={tollsPerDay}
            onChange={setTollsPerDay}
            min={0}
            max={50}
            step={0.5}
            unit="$/day"
            helpText="Round-trip toll costs"
          />
        </div>
      </details>

      {/* Signature split-column live meter: GAS vs EV monthly commute */}
      <SavingsMeter
        leftLabel="GAS"
        leftValue={results.monthlyGasCost}
        rightLabel="EV"
        rightValue={results.monthlyEvCost}
        period="/mo"
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Commute stats</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SavingsTile
          label="MONTHLY SAVINGS"
          value={Math.max(0, results.monthlySavings)}
          prefix="$"
          unit="/mo"
          tier="good"
          animate
        />
        <SavingsTile
          label="ANNUAL SAVINGS"
          value={Math.max(0, results.annualSavings)}
          prefix="$"
          unit="/yr"
          tier="good"
          animate
        />
        <SavingsTile
          label="RANGE USED/DAY"
          value={results.rangeUsedPercent}
          decimals={1}
          unit={`% of ${vehicle.epaRangeMiles}mi`}
          tier="brand"
          animate
        />
        <SavingsTile
          label="ANNUAL MILES"
          value={results.annualCommuteMiles}
          unit=" mi/yr"
          tier="mid"
          animate
        />
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Total charging cost breakdown
        </Link>
        <Link
          href="/bill-impact"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          See your electricity bill impact
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          How long to charge after commuting?
        </Link>
      </div>

      <EducationalContent>
        <h2>How we calculate commute costs</h2>
        <p>
          This calculator takes your one-way commute distance, doubles it for the round trip, then multiplies by your work schedule to get monthly and annual commute miles. For the EV side, we use your selected vehicle&apos;s EPA-rated efficiency (kWh per 100 miles) and your state&apos;s residential electricity rate to calculate electricity costs. For gas, we divide commute miles by your car&apos;s MPG and multiply by the gas price.
        </p>
        <h3>Why EV commuting is cheaper</h3>
        <p>
          Electric motors are roughly 3 to 4 times more efficient than internal combustion engines at converting energy into motion. At the national average electricity rate of 16.11 cents/kWh, most EVs cost between $0.03 and $0.05 per mile. A gas car averaging 28 MPG at $3.50/gallon costs about $0.13 per mile. That efficiency gap adds up quickly over 250+ commute days per year.
        </p>
        <h3>Factors that affect your real commute cost</h3>
        <ul>
          <li>Highway vs city driving: EVs are more efficient at lower speeds, while gas cars often get better highway MPG. Stop-and-go commutes favor EVs even more due to regenerative braking.</li>
          <li>Temperature: Cold weather increases EV energy use by 20 to 40%. Pre-conditioning while plugged in helps offset this.</li>
          <li>Time-of-use rates: Many utilities charge less at night. Charging off-peak can reduce your commute electricity cost by 30 to 50%.</li>
          <li>Workplace charging: Free or subsidized workplace charging can eliminate commute fuel costs entirely.</li>
        </ul>
      </EducationalContent>

      <FAQSection questions={commuteFAQ} />
      <EmailCapture source="commute-cost" />
      <RelatedCalculators currentPath="/commute-cost" />
    </CalculatorShell>
  );
}
