"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const roadTripFAQ = [
  {
    question: "How many charging stops will I need on an EV road trip?",
    answer:
      "The number of stops depends on your EV's range, trip distance, and how much you charge at each stop. Most drivers charge to about 80% at DC fast chargers because charging slows significantly above 80%. For a 500-mile trip in a vehicle with 270 miles of range, expect 2 to 3 charging stops of 20 to 40 minutes each.",
  },
  {
    question: "How much does it cost to road trip in an EV vs a gas car?",
    answer:
      "EV road trips using DC fast chargers typically cost 30 to 50% less than gas. At 40 cents per kWh for fast charging and 25 kWh per 100 miles, a 500-mile trip costs about $50 in an EV. The same trip in a 28 MPG gas car at $3.50 per gallon costs about $63. If you charge at home before leaving, EV costs drop further.",
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
      "Charge to 80% at DC fast chargers for the best balance of speed and range. Charging from 10% to 80% is fast because the battery accepts power at full speed. Charging from 80% to 100% can take just as long as 10% to 80% because the charger slows down to protect battery health.",
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

    // Gas comparison
    const gallonsNeeded = tripDistance / gasMpg;
    const totalGasCost = gallonsNeeded * gasPrice;

    // Savings
    const savings = totalGasCost - totalEvCost;
    const savingsPercent = totalGasCost > 0 ? (savings / totalGasCost) * 100 : 0;

    // Cost per mile
    const evCostPerMile = tripDistance > 0 ? totalEvCost / tripDistance : 0;
    const gasCostPerMile = tripDistance > 0 ? totalGasCost / tripDistance : 0;

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
      totalGasCost,
      gallonsNeeded,
      savings,
      savingsPercent,
      evCostPerMile,
      gasCostPerMile,
    };
  }, [vehicle, tripDistance, homeRate, dcfcRate, homeChargePercent, gasPrice, gasMpg]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const formatMinutes = (mins: number): string => {
    if (mins < 60) return `${Math.round(mins)} min`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <CalculatorLayout
      title="EV Road Trip Cost Planner"
      description="Estimate your EV road trip costs, charging stops, and time spent charging. Compare against gas to see your savings."
      lastUpdated="March 2026"
      intro="Planning an EV road trip? This calculator estimates your total charging cost using a mix of home and DC fast charging, calculates how many stops you'll need, and shows how much you save compared to driving a gas car. Adjust the inputs to match your route and charging preferences."
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery | ${vehicle.epaRangeMiles} mi EPA range | ${vehicle.chargerTypes.dcFastKW} kW DCFC`}
        />

        <NumberInput
          label="Trip Distance"
          value={tripDistance}
          onChange={setTripDistance}
          min={10}
          max={10000}
          step={10}
          unit="miles"
          helpText="Total one-way distance"
        />

        <NumberInput
          label="Home Electricity Rate"
          value={homeRate}
          onChange={setHomeRate}
          min={1}
          max={80}
          step={0.5}
          unit="\u00A2/kWh"
          helpText="Your residential electricity rate"
        />

        <NumberInput
          label="DC Fast Charging Rate"
          value={dcfcRate}
          onChange={setDcfcRate}
          min={10}
          max={100}
          step={1}
          unit="\u00A2/kWh"
          helpText="Average DCFC rate along your route"
        />

        <SliderInput
          label="Home Charging Before Trip"
          value={homeChargePercent}
          onChange={setHomeChargePercent}
          min={0}
          max={100}
          step={5}
          unit="%"
          showValue
        />

        <NumberInput
          label="Gas Price (comparison)"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={10}
          step={0.1}
          unit="$/gal"
          helpText="Current gas price for comparison"
        />

        <NumberInput
          label="Gas Car MPG (comparison)"
          value={gasMpg}
          onChange={setGasMpg}
          min={10}
          max={60}
          step={1}
          unit="MPG"
          helpText="Fuel economy of the gas car to compare"
        />
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Trip Cost Comparison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Total EV Trip Cost"
            value={fmt.format(results.totalEvCost)}
            unit=""
            highlight
            icon="⚡"
          />
          <ResultCard
            label="Total Gas Trip Cost"
            value={fmt.format(results.totalGasCost)}
            unit=""
            icon="⛽"
          />
          <ResultCard
            label={results.savings >= 0 ? "You Save with EV" : "Gas Car Saves"}
            value={fmt.format(Math.abs(results.savings))}
            unit={`(${Math.abs(results.savingsPercent).toFixed(0)}%)`}
            icon="💰"
          />
        </div>
      </div>

      {/* Charging Details */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Charging Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Charging Stops Needed"
            value={results.chargingStops.toString()}
            unit="stops"
            icon="🔌"
          />
          <ResultCard
            label="Total Charging Time"
            value={formatMinutes(results.totalChargingMinutes)}
            unit=""
            icon="⏱️"
          />
          <ResultCard
            label="Time Per Stop"
            value={formatMinutes(results.minutesPerStop)}
            unit="avg"
            icon="🕐"
          />
          <ResultCard
            label="Total Energy Needed"
            value={results.totalKwh.toFixed(1)}
            unit="kWh"
            icon="🔋"
          />
          <ResultCard
            label="EV Cost Per Mile"
            value={`${(results.evCostPerMile * 100).toFixed(1)}\u00A2`}
            unit="/mile"
            icon="📊"
          />
          <ResultCard
            label="Gas Cost Per Mile"
            value={`${(results.gasCostPerMile * 100).toFixed(1)}\u00A2`}
            unit="/mile"
            icon="📊"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          EV Charging Cost Breakdown
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">
                Home charging ({results.homeKwh.toFixed(1)} kWh at {homeRate}\u00A2/kWh)
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {fmt.format(results.homeCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">
                DC fast charging ({results.dcfcKwh.toFixed(1)} kWh at {dcfcRate}\u00A2/kWh)
              </span>
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {fmt.format(results.dcfcCost)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Total EV charging cost
              </span>
              <span className="text-lg font-bold text-[var(--color-text)]">
                {fmt.format(results.totalEvCost)}
              </span>
            </div>
          </div>

          {/* Visual bar */}
          {results.totalEvCost > 0 && (
            <div className="mt-4">
              <div className="flex h-6 w-full overflow-hidden rounded-full">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(results.homeCost / results.totalEvCost) * 100}%`,
                    backgroundColor: "var(--color-ev-green)",
                    minWidth: results.homeCost > 0 ? "4px" : "0",
                  }}
                  title={`Home: ${fmt.format(results.homeCost)}`}
                />
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(results.dcfcCost / results.totalEvCost) * 100}%`,
                    backgroundColor: "#f59e0b",
                    minWidth: results.dcfcCost > 0 ? "4px" : "0",
                  }}
                  title={`DCFC: ${fmt.format(results.dcfcCost)}`}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "var(--color-ev-green)" }}
                  />
                  Home ({homeChargePercent}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: "#f59e0b" }}
                  />
                  DCFC ({100 - homeChargePercent}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contextual Cross-Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          href="/range"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Check real-world range for your route &rarr;
        </Link>
        <Link
          href="/charging-time"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Calculate detailed charging times &rarr;
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Full gas vs electric comparison &rarr;
        </Link>
      </div>

      <ShareResults
        title={`EV Road Trip: ${fmt.format(results.totalEvCost)} vs ${fmt.format(results.totalGasCost)} gas`}
        text={`My ${vehicle.year} ${vehicle.make} ${vehicle.model} road trip (${tripDistance.toLocaleString()} miles) costs ${fmt.format(results.totalEvCost)} in charging vs ${fmt.format(results.totalGasCost)} for gas. That's ${fmt.format(Math.abs(results.savings))} ${results.savings >= 0 ? "saved" : "more"} with ${results.chargingStops} charging stop${results.chargingStops !== 1 ? "s" : ""} and ${formatMinutes(results.totalChargingMinutes)} of charging time.`}
      />

      <EducationalContent>
        <h2>Planning Your EV Road Trip</h2>
        <p>
          Road tripping in an EV is different from a gas car, but with a little planning it can be just as smooth and significantly cheaper. The key is understanding your vehicle&apos;s real-world range, where chargers are located, and how to minimize time spent at charging stations.
        </p>
        <h3>Charge at Home Before You Leave</h3>
        <p>
          Home electricity costs 13 to 27 cents per kWh in most states, while DC fast chargers along highways typically cost 30 to 60 cents per kWh. Starting your trip with a full battery from home charging can save 50% or more on the first leg of your journey. Always plug in the night before a road trip.
        </p>
        <h3>The 80% Rule for Fast Charging</h3>
        <p>
          DC fast chargers deliver maximum speed up to about 80% state of charge. After 80%, charging speed drops dramatically to protect battery health. On a road trip, the most time-efficient strategy is to charge from 10% to 80% at each stop rather than waiting for a full charge. This typically takes 20 to 35 minutes per stop.
        </p>
        <h3>Route Planning Tips</h3>
        <ul>
          <li>Use apps like A Better Route Planner (ABRP) or your vehicle&apos;s built-in navigation to find chargers along your route.</li>
          <li>Plan charging stops near restaurants or rest areas so you can eat or stretch while the car charges.</li>
          <li>Check charger availability and reviews before your trip. Not all chargers are reliable, and having a backup location in mind avoids stress.</li>
          <li>In cold weather, add 20 to 30% to your energy estimate. Pre-conditioning the battery before fast charging improves charging speeds.</li>
          <li>Keep your speed at 65 to 70 mph on highways to maximize range between stops. Driving at 80 mph can reduce range by 15 to 25%.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={roadTripFAQ} />
      <EmailCapture source="road-trip" />
      <RelatedCalculators currentPath="/road-trip" />
    </CalculatorLayout>
  );
}
