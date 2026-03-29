"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
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

  const evBarWidth = Math.min(
    100,
    (results.monthlyEvCost / Math.max(results.monthlyEvCost, results.monthlyGasCost)) * 100
  );
  const gasBarWidth = Math.min(
    100,
    (results.monthlyGasCost / Math.max(results.monthlyEvCost, results.monthlyGasCost)) * 100
  );

  return (
    <CalculatorLayout
      title="EV Commute Cost Calculator"
      description="Compare your daily commute costs between an EV and a gas car. Factor in electricity rates, gas prices, parking, and tolls."
      lastUpdated="March 2026"
      intro="The average American commutes 27 miles each way to work. For an EV driver, that round-trip costs about $2-3 in electricity compared to $7-9 in gas. Over a full work year, switching to an EV for commuting alone can save $1,000-2,000 depending on your vehicle and local rates."
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

        <div className="sm:col-span-2">
          <SliderInput
            label="One-Way Commute Distance"
            value={oneWayMiles}
            onChange={setOneWayMiles}
            min={5}
            max={100}
            step={1}
            unit="miles"
            showValue
          />
        </div>

        <SelectInput
          label="Work Days Per Week"
          value={String(workDaysPerWeek)}
          onChange={(v) => setWorkDaysPerWeek(Number(v))}
          options={workDayOptions}
        />

        <NumberInput
          label="Weeks Worked Per Year"
          value={weeksPerYear}
          onChange={setWeeksPerYear}
          min={1}
          max={52}
          step={1}
          helpText="Typically 48-50 after vacation"
        />

        <NumberInput
          label="Gas Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={10}
          step={0.1}
          unit="$/gal"
          helpText="Current price at your local station"
        />

        <NumberInput
          label="Gas Car MPG"
          value={gasMpg}
          onChange={setGasMpg}
          min={10}
          max={60}
          step={1}
          unit="MPG"
          helpText="Combined city/highway for your gas car"
        />

        <NumberInput
          label="Parking Cost Per Day"
          value={parkingCostPerDay}
          onChange={setParkingCostPerDay}
          min={0}
          max={100}
          step={1}
          unit="$/day"
          helpText="Leave at 0 if parking is free"
        />

        <NumberInput
          label="Tolls Per Day"
          value={tollsPerDay}
          onChange={setTollsPerDay}
          min={0}
          max={50}
          step={0.5}
          unit="$/day"
          helpText="Round-trip toll costs"
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your Commute Cost Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Daily Cost (EV)"
            value={fmt.format(results.dailyEvCost)}
            unit="/day"
            highlight
            icon="⚡"
          />
          <ResultCard
            label="Daily Cost (Gas)"
            value={fmt.format(results.dailyGasCost)}
            unit="/day"
            icon="⛽"
          />
          <ResultCard
            label="Monthly Savings"
            value={fmt.format(results.monthlySavings)}
            unit="/month"
            highlight
            icon="💰"
          />
          <ResultCard
            label="Range Used Per Day"
            value={`${results.rangeUsedPercent.toFixed(1)}%`}
            unit={`of ${vehicle.epaRangeMiles} mi`}
            icon="🔋"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Annual Savings"
            value={fmtShort.format(results.annualSavings)}
            unit="/year"
            highlight
            icon="📅"
          />
          <ResultCard
            label="5-Year Commute Savings"
            value={fmtShort.format(results.fiveYearSavings)}
            unit="over 5 years"
            icon="🏦"
          />
          <ResultCard
            label="Annual Commute Miles"
            value={results.annualCommuteMiles.toLocaleString()}
            unit="miles/year"
            icon="🛣️"
          />
        </div>

        {/* Comparison Bar */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Commute Fuel Cost Comparison
          </h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-ev-green)]">
                  EV (Electric)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.monthlyEvCost)}
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
                  Gas ({gasMpg} MPG @ ${gasPrice.toFixed(2)}/gal)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {fmt.format(results.monthlyGasCost)}
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
              You save {fmt.format(results.monthlySavings)}/month commuting with an EV
            </p>
          ) : (
            <p className="mt-4 text-center text-sm font-semibold text-amber-600">
              Gas is cheaper by {fmt.format(Math.abs(results.monthlySavings))}/month for this commute
            </p>
          )}
          {results.dailyFixedCost > 0 && (
            <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
              Plus {fmt.format(results.dailyFixedCost)}/day in parking and tolls (same for both)
            </p>
          )}
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            For a full side-by-side breakdown, try our{" "}
            <Link href="/gas-vs-electric" className="text-[var(--color-primary)] hover:underline">
              Gas vs Electric calculator
            </Link>.
          </p>
        </div>

        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Total charging cost breakdown →
          </Link>
          <Link href="/bill-impact" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            See your electricity bill impact →
          </Link>
          <Link href="/charging-time" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            How long to charge after commuting? →
          </Link>
        </div>

        <ShareResults
          title={`EV Commute Savings: ${fmtShort.format(results.annualSavings)}/year`}
          text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.dailyEvCost)}/day to commute (${oneWayMiles} mi each way) vs ${fmt.format(results.dailyGasCost)} for gas. That's ${fmtShort.format(results.annualSavings)}/year in savings!`}
        />
      </div>

      <EducationalContent>
        <h2>How We Calculate Commute Costs</h2>
        <p>
          This calculator takes your one-way commute distance, doubles it for the round trip, then multiplies by your work schedule to get monthly and annual commute miles. For the EV side, we use your selected vehicle&apos;s EPA-rated efficiency (kWh per 100 miles) and your state&apos;s residential electricity rate to calculate electricity costs. For gas, we divide commute miles by your car&apos;s MPG and multiply by the gas price.
        </p>
        <h3>Why EV Commuting Is Cheaper</h3>
        <p>
          Electric motors are roughly 3-4 times more efficient than internal combustion engines at converting energy into motion. At the national average electricity rate of 16.11 cents/kWh, most EVs cost between $0.03-0.05 per mile. A gas car averaging 28 MPG at $3.50/gallon costs about $0.13 per mile. That efficiency gap adds up quickly over 250+ commute days per year.
        </p>
        <h3>Factors That Affect Your Real Commute Cost</h3>
        <ul>
          <li>Highway vs city driving: EVs are more efficient at lower speeds, while gas cars often get better highway MPG. Stop-and-go commutes favor EVs even more due to regenerative braking.</li>
          <li>Temperature: Cold weather increases EV energy use by 20-40%. Pre-conditioning while plugged in helps offset this.</li>
          <li>Time-of-use rates: Many utilities charge less at night. Charging off-peak can reduce your commute electricity cost by 30-50%.</li>
          <li>Workplace charging: Free or subsidized workplace charging can eliminate commute fuel costs entirely.</li>
        </ul>
      </EducationalContent>

      <FAQSection questions={commuteFAQ} />
      <EmailCapture source="commute-cost" />
      <RelatedCalculators currentPath="/commute-cost" />
    </CalculatorLayout>
  );
}
