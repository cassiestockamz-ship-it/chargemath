"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const roadTripFAQ = [
  {
    question: "How many charging stops will I need on an EV road trip?",
    answer:
      "The number of stops depends on your EV's range, trip distance, and how much you charge at each stop. Most drivers charge to about 80 percent at DC fast chargers because charging slows significantly above 80 percent. For a 500-mile trip in a vehicle with 270 miles of range, expect 2 to 3 charging stops of 20 to 40 minutes each.",
  },
  {
    question: "How much does it cost to road trip in an EV vs a gas car?",
    answer:
      "EV road trips using DC fast chargers typically cost 30 to 50 percent less than gas. At 40 cents per kWh for fast charging and 25 kWh per 100 miles, a 500-mile trip costs about $50 in an EV. The same trip in a 28 MPG gas car at $3.50 per gallon costs about $63. If you charge at home before leaving, EV costs drop further.",
  },
  {
    question: "How long does it take to charge an EV on a road trip?",
    answer:
      "DC fast chargers can add 150 to 200 miles of range in about 20 to 30 minutes for most modern EVs. A 500-mile trip typically requires 40 to 90 minutes of total charging time across all stops. Charging speed varies by vehicle, charger power, battery temperature, and state of charge.",
  },
  {
    question: "Should I charge my EV at home before a road trip?",
    answer:
      "Yes. Charging at home before departure is significantly cheaper than DC fast charging. Home electricity averages 13 to 27 cents per kWh, while DC fast chargers cost 30 to 60 cents per kWh. Starting with a full battery from home charging reduces the number of paid fast charging stops needed.",
  },
  {
    question: "What percentage should I charge to at DC fast chargers?",
    answer:
      "Charge to 80 percent at DC fast chargers for the best balance of speed and range. Charging from 10 to 80 percent is fast because the battery accepts power at full speed. Charging from 80 to 100 percent can take just as long as 10 to 80 percent because the charger slows down to protect battery health.",
  },
];

export default function RoadTripPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [tripDistance, setTripDistance] = useState(500);
  const [homeRate, setHomeRate] = useState(16);
  const [dcfcRate, setDcfcRate] = useState(40);
  const [homeChargePercent, setHomeChargePercent] = useState(20);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);

  useUrlSync(
    {
      vehicle: vehicleId,
      dist: tripDistance,
      home: homeRate,
      dcfc: dcfcRate,
      homePct: homeChargePercent,
      gas: gasPrice,
      mpg: gasMpg,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.dist) setTripDistance(Number(p.dist));
      if (p.home) setHomeRate(Number(p.home));
      if (p.dcfc) setDcfcRate(Number(p.dcfc));
      if (p.homePct) setHomeChargePercent(Number(p.homePct));
      if (p.gas) setGasPrice(Number(p.gas));
      if (p.mpg) setGasMpg(Number(p.mpg));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const efficiency = vehicle.kwhPer100Miles; // kWh per 100 miles
    const totalKwh = (tripDistance / 100) * efficiency;

    // Usable range at 80% charge (typical DCFC target)
    const usableRange = vehicle.epaRangeMiles * 0.8;

    // Home charging covers a percentage of the total energy
    const homeKwh = totalKwh * (homeChargePercent / 100);
    const dcfcKwh = totalKwh - homeKwh;

    // Costs
    const homeCost = homeKwh * (homeRate / 100);
    const dcfcCost = dcfcKwh * (dcfcRate / 100);
    const totalEvCost = homeCost + dcfcCost;

    // Charging stops: after home charge, remaining distance needs DCFC stops
    // Each stop provides ~usableRange miles (10% to 80% = 70% of battery)
    const homeRangeMiles = usableRange * (homeChargePercent / 100) * (100 / 80);
    // More precisely: home charge gives homeChargePercent% of trip energy
    // which translates to that fraction of trip distance
    const milesFromHome = tripDistance * (homeChargePercent / 100);
    const remainingMiles = Math.max(0, tripDistance - milesFromHome);

    // Each DCFC stop: charge from ~10% to 80% = 70% of battery capacity range
    const milesPerStop = vehicle.epaRangeMiles * 0.7;
    const chargingStops = remainingMiles > 0 ? Math.ceil(remainingMiles / milesPerStop) : 0;

    // Time per stop: charge 70% of battery at DCFC rate
    // kWh per stop = 70% of battery capacity
    const kwhPerStop = vehicle.batteryCapacityKwh * 0.7;
    // Average DCFC speed (accounts for taper) is roughly 70% of peak
    const avgDcfcKw = vehicle.chargerTypes.dcFastKW * 0.7;
    const hoursPerStop = avgDcfcKw > 0 ? kwhPerStop / avgDcfcKw : 0;
    const minutesPerStop = hoursPerStop * 60;
    const totalChargingMinutes = minutesPerStop * chargingStops;
    const totalChargingHours = totalChargingMinutes / 60;

    // Drive time assuming a 60 mph average highway pace
    const driveHours = tripDistance > 0 ? tripDistance / 60 : 0;
    const totalHours = driveHours + totalChargingHours;

    // Gas comparison
    const gallonsNeeded = tripDistance / gasMpg;
    const totalGasCost = gallonsNeeded * gasPrice;

    // Savings
    const savings = totalGasCost - totalEvCost;
    const savingsPercent = totalGasCost > 0 ? (savings / totalGasCost) * 100 : 0;

    // Cost per mile
    const evCostPerMile = tripDistance > 0 ? totalEvCost / tripDistance : 0;
    const gasCostPerMile = tripDistance > 0 ? totalGasCost / tripDistance : 0;

    // Share of trip that is driving (vs charging)
    const drivePct = totalHours > 0 ? (driveHours / totalHours) * 100 : 100;

    return {
      totalKwh,
      homeKwh,
      dcfcKwh,
      homeCost,
      dcfcCost,
      totalEvCost,
      chargingStops,
      minutesPerStop,
      totalChargingMinutes,
      totalChargingHours,
      driveHours,
      totalHours,
      drivePct,
      totalGasCost,
      gallonsNeeded,
      savings,
      savingsPercent,
      evCostPerMile,
      gasCostPerMile,
      homeRangeMiles,
      remainingMiles,
    };
  }, [vehicle, tripDistance, homeRate, dcfcRate, homeChargePercent, gasPrice, gasMpg]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.epaRangeMiles} mi range, ${vehicle.chargerTypes.dcFastKW} kW DCFC`}
      />
      <NumberInput
        label="Trip distance"
        value={tripDistance}
        onChange={setTripDistance}
        min={10}
        max={10000}
        step={10}
        unit="miles"
        helpText="Total one-way distance"
      />
      <SliderInput
        label="Home charge before trip"
        value={homeChargePercent}
        onChange={setHomeChargePercent}
        min={0}
        max={100}
        step={5}
        unit="%"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Road trip plan"
      headline="TOTAL TIME"
      amount={results.totalHours}
      amountPrefix=""
      amountDecimals={1}
      amountUnit=" hours"
      sub={`${tripDistance.toLocaleString()} miles with ${results.chargingStops} charging ${results.chargingStops === 1 ? "stop" : "stops"}. EV charging cost: $${results.totalEvCost.toFixed(0)} vs $${results.totalGasCost.toFixed(0)} gas.`}
      dialPercent={Math.max(0, Math.min(100, Math.round(results.drivePct)))}
      dialLabel="DRIVING"
      morphHero={false}
    >
      <SavingsTile
        label="TOTAL TIME"
        value={results.totalHours}
        prefix=""
        decimals={1}
        unit=" hrs"
        tier="brand"
        animate
      />
      <SavingsTile
        label="DRIVE TIME"
        value={results.driveHours}
        prefix=""
        decimals={1}
        unit=" hrs"
        tier="mid"
      />
      <SavingsTile
        label="CHARGE TIME"
        value={results.totalChargingHours}
        prefix=""
        decimals={1}
        unit=" hrs"
        tier="volt"
      />
      <SavingsTile
        label="STOPS"
        value={results.chargingStops}
        prefix=""
        decimals={0}
        unit={results.chargingStops === 1 ? " stop" : " stops"}
        tier="good"
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Road trip plan"
      title="EV Road Trip Planner"
      quickAnswer="A 500-mile EV trip typically needs 2 to 3 DC fast charging stops of 20 to 40 minutes each and costs 30 to 50 percent less than driving gas."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="EV Road Trip Cost Planner"
        description="Estimate EV road trip charging costs, number of stops, charging time, and compare total cost against a gas car for the same trip."
        url="https://chargemath.com/road-trip"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Road Trip Cost Planner", url: "https://chargemath.com/road-trip" },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Home electricity rate"
            value={homeRate}
            onChange={setHomeRate}
            min={1}
            max={80}
            step={0.5}
            unit={"\u00A2/kWh"}
            helpText="Your residential rate"
          />
          <NumberInput
            label="DC fast charging rate"
            value={dcfcRate}
            onChange={setDcfcRate}
            min={10}
            max={100}
            step={1}
            unit={"\u00A2/kWh"}
            helpText="Average DCFC rate along your route"
          />
          <NumberInput
            label="Gas price (comparison)"
            value={gasPrice}
            onChange={setGasPrice}
            min={1}
            max={10}
            step={0.1}
            unit="$/gal"
          />
          <NumberInput
            label="Gas car MPG (comparison)"
            value={gasMpg}
            onChange={setGasMpg}
            min={10}
            max={60}
            step={1}
            unit="MPG"
          />
        </div>
      </details>

      {/* Secondary result grid */}
      <h2 className="cm-eyebrow mt-2 mb-3">Cost and energy breakdown</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SavingsTile
          label="EV TRIP COST"
          value={results.totalEvCost}
          prefix="$"
          decimals={0}
          unit=" total"
          tier="brand"
          animate
        />
        <SavingsTile
          label="GAS TRIP COST"
          value={results.totalGasCost}
          prefix="$"
          decimals={0}
          unit=" total"
          tier="warn"
        />
        <SavingsTile
          label={results.savings >= 0 ? "YOU SAVE" : "GAS SAVES"}
          value={Math.abs(results.savings)}
          prefix="$"
          decimals={0}
          unit={` (${Math.abs(Math.round(results.savingsPercent))}%)`}
          tier="good"
          animate
        />
        <SavingsTile
          label="ENERGY NEEDED"
          value={Math.round(results.totalKwh)}
          prefix=""
          decimals={0}
          unit=" kWh"
          tier="volt"
        />
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Check real-world range for your route
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate detailed charging times
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Full gas vs electric comparison
        </Link>
      </div>

      <EducationalContent>
        <h2>Planning Your EV Road Trip</h2>
        <p>
          Road tripping in an EV is different from a gas car, but with a little planning it can be just as smooth and significantly cheaper. The key is understanding your vehicle&apos;s real-world range, where chargers are located, and how to minimize time spent at charging stations.
        </p>
        <h3>Charge at Home Before You Leave</h3>
        <p>
          Home electricity costs 13 to 27 cents per kWh in most states, while DC fast chargers along highways typically cost 30 to 60 cents per kWh. Starting your trip with a full battery from home charging can save 50 percent or more on the first leg of your trip. Always plug in the night before a road trip.
        </p>
        <h3>The 80 Percent Rule for Fast Charging</h3>
        <p>
          DC fast chargers deliver maximum speed up to about 80 percent state of charge. After 80 percent, charging speed drops dramatically to protect battery health. On a road trip, the most time-efficient strategy is to charge from 10 to 80 percent at each stop rather than waiting for a full charge. This typically takes 20 to 35 minutes per stop.
        </p>
        <h3>Route Planning Tips</h3>
        <ul>
          <li>Use apps like A Better Route Planner (ABRP) or your vehicle&apos;s built-in navigation to find chargers along your route.</li>
          <li>Plan charging stops near restaurants or rest areas so you can eat or stretch while the car charges.</li>
          <li>Check charger availability and reviews before your trip. Not all chargers are reliable, and having a backup location in mind avoids stress.</li>
          <li>In cold weather, add 20 to 30 percent to your energy estimate. Pre-conditioning the battery before fast charging improves charging speeds.</li>
          <li>Keep your speed at 65 to 70 mph on highways to maximize range between stops. Driving at 80 mph can reduce range by 15 to 25 percent.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={roadTripFAQ} />
      <EmailCapture source="road-trip" />
      <RelatedCalculators currentPath="/road-trip" />
    </CalculatorShell>
  );
}
