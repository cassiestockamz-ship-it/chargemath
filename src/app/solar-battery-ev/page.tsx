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
import EcoFlowCard, { ECOFLOW_PRODUCTS } from "@/components/EcoFlowCard";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";
import {
  SOLAR_DATA,
  NATIONAL_AVG_SOLAR_PRODUCTION,
  HOME_BATTERIES,
} from "@/data/solar-data";

const CJ_BASE = "https://www.tkqlhce.com/click-101714807-15735883";

/** Only EcoFlow products have affiliate links — other batteries are installer-only (not sold online) */
const BATTERY_LINKS: Record<string, string> = {
  "EcoFlow DELTA Pro Ultra X": `${CJ_BASE}?url=${encodeURIComponent("https://us.ecoflow.com/products/delta-pro-ultra-x")}&sid=solar-battery-ev-table`,
  "EcoFlow DELTA Pro Ultra": `${CJ_BASE}?url=${encodeURIComponent("https://us.ecoflow.com/products/delta-pro-ultra")}&sid=solar-battery-ev-table`,
};

/* ── Formatters ── */
const fmtShort = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/* ── FAQ data (inline) ── */
const solarBatteryEvFAQ = [
  {
    question: "Can I charge my EV from a home battery?",
    answer:
      "Yes. A home battery stores electricity (whether from solar panels or the grid) and can be used to charge your EV overnight via your Level 2 home charger. The key is that your battery must hold enough usable energy to cover both your EV charging need and any overnight home consumption. This calculator sizes the battery for that exact scenario.",
  },
  {
    question: "How many Powerwalls do I need to charge my EV?",
    answer:
      "It depends on your EV and daily driving. Each Tesla Powerwall 3 holds 13.5 kWh of nominal capacity. A typical EV driven 35 miles per day uses about 8-10 kWh for charging. Adding 10 kWh of overnight home usage, you need roughly 18-20 kWh of usable capacity. At 90% depth of discharge, one Powerwall 3 (13.5 kWh usable at 90% = 12.2 kWh) is not quite enough for the combined load; two units give you comfortable headroom. This calculator handles those exact numbers for your specific vehicle and driving habits.",
  },
  {
    question: "What is depth of discharge and why does it matter?",
    answer:
      "Depth of discharge (DoD) is the percentage of a battery's total capacity that you actually use before recharging it. Manufacturers like Tesla and Enphase recommend not fully depleting the battery to prolong its lifespan. At 90% DoD, a 13.5 kWh battery provides 12.15 kWh of usable energy. Repeatedly discharging to 100% can reduce the battery's cycle life by 30-50%. This calculator uses DoD to compute true usable capacity, not just the nameplate number.",
  },
  {
    question: "Is a home battery worth it for EV charging?",
    answer:
      "A battery makes financial sense in specific situations: if your utility has time-of-use (TOU) rates where nighttime electricity costs more than daytime solar export credits, if your utility has weak net metering policies, or if you want backup power during outages. In states with full retail net metering, the grid already acts as a free battery, making an add-on battery harder to justify on cost alone. Use this calculator's payback estimate to evaluate your specific situation.",
  },
  {
    question: "What size solar system do I need to fill a home battery daily?",
    answer:
      "To fill a battery each day, your solar system must produce at least as much energy as the battery stores (plus round-trip efficiency losses). For example, if your battery needs 20 kWh of usable storage and your location gets 5 peak sun hours per day, you need at least 20 / 5 / 0.95 (efficiency) = 4.2 kW of solar panels to refill it every day. This calculator computes the exact solar system size needed alongside the battery recommendation.",
  },
];

export default function SolarBatteryEvPage() {
  /* ── State ── */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [overnightHomeKwh, setOvernightHomeKwh] = useState(10);
  const [depthOfDischarge, setDepthOfDischarge] = useState(90);
  const [roundTripEfficiency, setRoundTripEfficiency] = useState(95);
  const [daysOfAutonomy, setDaysOfAutonomy] = useState("1");

  /* ── Auto-detect state ── */
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  /* ── URL sync ── */
  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      miles: String(dailyMiles),
      home: String(overnightHomeKwh),
      dod: String(depthOfDischarge),
      rte: String(roundTripEfficiency),
      days: daysOfAutonomy,
    },
    useCallback(
      (p: Record<string, string>) => {
        if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
          setVehicleId(p.vehicle);
        if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
        if (p.miles) setDailyMiles(Number(p.miles));
        if (p.home) setOvernightHomeKwh(Number(p.home));
        if (p.dod) setDepthOfDischarge(Number(p.dod));
        if (p.rte) setRoundTripEfficiency(Number(p.rte));
        if (p.days && ["1", "2", "3"].includes(p.days)) setDaysOfAutonomy(p.days);
      },
      []
    )
  );

  /* ── Derived ── */
  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const electricityRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100; // $/kWh
  }, [stateCode]);

  /* ── Calculations ── */
  const results = useMemo(() => {
    const dod = depthOfDischarge / 100;
    const rte = roundTripEfficiency / 100;
    const autonomyDays = Number(daysOfAutonomy);

    // Daily EV energy need
    const dailyEvKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;

    // Total nightly load: EV + home overnight
    const totalNightlyKwh = dailyEvKwh + overnightHomeKwh;

    // Usable capacity needed (accounting for multiple days of backup)
    const usableCapacityNeeded = totalNightlyKwh * autonomyDays;

    // Nominal battery capacity needed (accounting for DoD and round-trip efficiency losses)
    const nominalCapacity = usableCapacityNeeded / dod / rte;

    // Match against HOME_BATTERIES: how many units of each are needed
    const batteryOptions = HOME_BATTERIES.map((battery) => {
      const unitsNeeded = Math.ceil(nominalCapacity / battery.capacityKwh);
      const totalCost = unitsNeeded * battery.costEstimate;
      return {
        ...battery,
        unitsNeeded,
        totalCost,
      };
    });

    // Find cheapest option (fewest cost)
    const recommended = batteryOptions.reduce((best, current) =>
      current.totalCost < best.totalCost ? current : best
    );

    // Solar sizing: energy needed from panels each day (accounting for round-trip losses)
    const solarToFillDaily = totalNightlyKwh / rte;

    // State-level solar production
    const solarProduction =
      SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;
    const dailySolarPerKw = solarProduction / 365;
    const solarSizeNeeded = solarToFillDaily / dailySolarPerKw;

    // Cost estimates
    const totalBatteryCost = recommended.totalCost;
    const solarCostPerWatt =
      SOLAR_DATA[stateCode]?.avgInstallCostPerWatt ?? 2.8;
    const solarCost = solarSizeNeeded * 1000 * solarCostPerWatt;
    const totalSystemCost = totalBatteryCost + solarCost;

    // Savings and payback
    const annualGridCostAvoided = totalNightlyKwh * 365 * electricityRate;
    const paybackYears =
      annualGridCostAvoided > 0 ? totalSystemCost / annualGridCostAvoided : Infinity;

    return {
      dailyEvKwh,
      totalNightlyKwh,
      usableCapacityNeeded,
      nominalCapacity,
      batteryOptions,
      recommended,
      solarSizeNeeded,
      totalBatteryCost,
      solarCost,
      totalSystemCost,
      annualGridCostAvoided,
      paybackYears,
    };
  }, [
    dailyMiles,
    vehicle,
    overnightHomeKwh,
    depthOfDischarge,
    roundTripEfficiency,
    daysOfAutonomy,
    stateCode,
    electricityRate,
  ]);

  /* ── Helpers ── */
  const formatPaybackYears = (years: number): string => {
    if (!isFinite(years) || years <= 0) return "N/A";
    if (years < 1) {
      const months = Math.ceil(years * 12);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    const wholeYears = Math.floor(years);
    const remainingMonths = Math.round((years - wholeYears) * 12);
    if (remainingMonths === 0)
      return `${wholeYears} year${wholeYears > 1 ? "s" : ""}`;
    return `${wholeYears} yr${wholeYears > 1 ? "s" : ""}, ${remainingMonths} mo`;
  };

  /* ── Options ── */
  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}\u00a2/kWh)`,
    }));

  const autonomyOptions = [
    { value: "1", label: "1 day (standard)" },
    { value: "2", label: "2 days (extra backup)" },
    { value: "3", label: "3 days (off-grid ready)" },
  ];

  return (
    <CalculatorLayout
      title="Solar Battery Size Calculator for EV Charging"
      description="Find the right home battery size to charge your EV from solar energy overnight."
      intro="Pairing a home battery with solar panels lets you store daytime energy and use it to charge your EV at night, without touching the grid. This calculator figures out exactly how large a battery you need based on your vehicle, daily driving, overnight home usage, and location. It then recommends real battery products and tells you how much solar capacity you need to refill the battery each day."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Solar Battery Size Calculator for EV Charging"
        description="Calculate the right home battery size to charge your EV from solar overnight. See required capacity, equivalent products, solar system size, and cost estimates."
        url="https://chargemath.com/solar-battery-ev"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Solar Battery Size Calculator",
            url: "https://chargemath.com/solar-battery-ev",
          },
        ]}
      />

      {/* ── Inputs ── */}
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
          helpText={`${(SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION).toLocaleString()} kWh/kW/yr solar \u2022 ${ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE}\u00a2/kWh`}
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

        <NumberInput
          label="Overnight Home Usage"
          value={overnightHomeKwh}
          onChange={setOvernightHomeKwh}
          min={2}
          max={30}
          step={1}
          unit="kWh"
          helpText="Typical home uses 8-12 kWh overnight"
        />

        <SelectInput
          label="Days of Autonomy"
          value={daysOfAutonomy}
          onChange={setDaysOfAutonomy}
          options={autonomyOptions}
          helpText="Days of backup without sun"
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Battery Depth of Discharge"
            value={depthOfDischarge}
            onChange={setDepthOfDischarge}
            min={50}
            max={100}
            step={5}
            unit="%"
            showValue
          />
        </div>

        <div className="sm:col-span-2">
          <SliderInput
            label="Round-Trip Efficiency"
            value={roundTripEfficiency}
            onChange={setRoundTripEfficiency}
            min={85}
            max={100}
            step={1}
            unit="%"
            showValue
          />
        </div>
      </div>

      {/* ── Primary Results ── */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Battery and Solar Sizing Results
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Battery Capacity Needed"
            value={`${results.nominalCapacity.toFixed(1)} kWh`}
            unit="nominal"
            highlight
            icon="🔋"
          />
          <ResultCard
            label="Usable Storage"
            value={`${results.usableCapacityNeeded.toFixed(1)} kWh`}
            unit="at full DoD"
            icon="⚡"
          />
          <ResultCard
            label="Solar System Size"
            value={`${results.solarSizeNeeded.toFixed(1)} kW`}
            unit="to refill daily"
            icon="☀️"
          />
          <ResultCard
            label="System Payback"
            value={formatPaybackYears(results.paybackYears)}
            unit=""
            icon="📅"
          />
        </div>
      </div>

      {/* ── Battery Comparison Table ── */}
      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
          Battery Product Comparison
        </h3>
        <p className="mb-4 text-xs text-[var(--color-text-muted)]">
          Based on {results.nominalCapacity.toFixed(1)} kWh nominal capacity needed. Green border indicates the most cost-effective option.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="pb-2 text-left font-semibold text-[var(--color-text)]">
                  Battery
                </th>
                <th className="pb-2 text-right font-semibold text-[var(--color-text)]">
                  Capacity
                </th>
                <th className="pb-2 text-right font-semibold text-[var(--color-text)]">
                  Units
                </th>
                <th className="pb-2 text-right font-semibold text-[var(--color-text)]">
                  Est. Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {results.batteryOptions.map((battery) => {
                const isRecommended =
                  battery.name === results.recommended.name;
                return (
                  <tr
                    key={battery.name}
                    className={
                      isRecommended
                        ? "rounded-lg bg-[var(--color-surface)] outline outline-2 outline-[var(--color-ev-green)]"
                        : ""
                    }
                  >
                    <td className="py-2 pr-4">
                      {BATTERY_LINKS[battery.name] ? (
                        <a
                          href={BATTERY_LINKS[battery.name]}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className={`underline decoration-dotted underline-offset-2 hover:decoration-solid ${
                            isRecommended
                              ? "font-semibold text-[var(--color-ev-green)]"
                              : "text-[var(--color-text)] hover:text-[var(--color-primary)]"
                          }`}
                        >
                          {battery.name}
                        </a>
                      ) : (
                        <span
                          className={
                            isRecommended
                              ? "font-semibold text-[var(--color-ev-green)]"
                              : "text-[var(--color-text)]"
                          }
                        >
                          {battery.name}
                        </span>
                      )}
                      {isRecommended && (
                        <span className="ml-2 rounded-full bg-[var(--color-ev-green)] px-2 py-0.5 text-xs font-bold text-white">
                          Best Value
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right text-[var(--color-text-muted)]">
                      {battery.capacityKwh} kWh
                    </td>
                    <td className="py-2 text-right font-semibold text-[var(--color-text)]">
                      {battery.unitsNeeded}
                    </td>
                    <td className="py-2 text-right font-semibold text-[var(--color-text)]">
                      {fmtShort.format(battery.totalCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Costs are installed price estimates and vary by region and installer. Get 3+ quotes before purchasing.
        </p>
      </div>

      {/* ── Cost Breakdown ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ResultCard
          label="Total Battery Cost"
          value={fmtShort.format(results.totalBatteryCost)}
          unit={`${results.recommended.unitsNeeded}x ${results.recommended.name}`}
          icon="🔋"
        />
        <ResultCard
          label="Total Solar Cost"
          value={fmtShort.format(results.solarCost)}
          unit={`${results.solarSizeNeeded.toFixed(1)} kW installed`}
          icon="☀️"
        />
        <ResultCard
          label="Annual Grid Savings"
          value={`${fmtShort.format(results.annualGridCostAvoided)}/yr`}
          unit="vs. grid charging"
          icon="💰"
        />
      </div>

      {/* ── Nightly Load Breakdown ── */}
      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
          Nightly Load Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">
              EV charging ({dailyMiles} miles in {vehicle.year} {vehicle.make} {vehicle.model})
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {results.dailyEvKwh.toFixed(1)} kWh
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">
              Overnight home usage
            </span>
            <span className="font-semibold text-[var(--color-text)]">
              {overnightHomeKwh.toFixed(1)} kWh
            </span>
          </div>
          <hr className="border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Total nightly load
            </span>
            <span className="font-bold text-[var(--color-text)]">
              {results.totalNightlyKwh.toFixed(1)} kWh
            </span>
          </div>
          {Number(daysOfAutonomy) > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Usable capacity needed ({daysOfAutonomy} days)
              </span>
              <span className="font-bold text-[var(--color-ev-green)]">
                {results.usableCapacityNeeded.toFixed(1)} kWh
              </span>
            </div>
          )}
        </div>
      </div>

      <ShareResults
        title={`Battery sizing: ${results.nominalCapacity.toFixed(1)} kWh for EV charging`}
        text={`I need a ${results.nominalCapacity.toFixed(1)} kWh home battery and ${results.solarSizeNeeded.toFixed(1)} kW of solar to charge my ${vehicle.make} ${vehicle.model} overnight. System payback: ${formatPaybackYears(results.paybackYears)}.`}
      />

      {/* EcoFlow Product Recommendations */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Home Battery Systems Worth Considering
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EcoFlowCard product={ECOFLOW_PRODUCTS.deltaProUltraX} sid="solar-battery-ev" />
          <EcoFlowCard product={ECOFLOW_PRODUCTS.deltaProUltra} sid="solar-battery-ev" />
          <EcoFlowCard product={ECOFLOW_PRODUCTS.deltaPro3} sid="solar-battery-ev" />
        </div>
      </div>

      <EducationalContent>
        <h2>Why Pair a Home Battery with Solar and an EV?</h2>
        <p>
          Solar panels produce electricity during the day, but most EV owners charge at night. Without a battery, you rely on net metering to credit your daytime export against your nighttime draw. A home battery changes that equation by storing the solar energy directly, so you use your own electrons when the sun goes down instead of buying them back from the grid.
        </p>
        <p>
          This matters most in states with time-of-use (TOU) electricity rates, where the cost per kWh is higher during evening peak hours (typically 4 to 9 PM) when people arrive home and plug in their EVs. Storing solar in a battery and discharging during those peak hours can save significantly more than a flat-rate net metering credit.
        </p>
        <h2>Understanding Battery Capacity Specs</h2>
        <p>
          Battery manufacturers advertise two numbers: nominal capacity and usable capacity. Nominal capacity is the total amount of energy the battery can hold. Usable capacity is the amount you can actually draw before the battery management system stops discharging to protect the cells.
        </p>
        <p>
          Depth of discharge (DoD) is the ratio of usable to nominal capacity. A battery with 13.5 kWh nominal at 90% DoD provides 12.15 kWh of usable energy per cycle. Round-trip efficiency accounts for losses during the charge and discharge cycle. At 95% round-trip efficiency, you need to put in roughly 1.05 kWh to get 1 kWh back out. This calculator applies both factors so you get a realistic system size.
        </p>
        <h2>Do You Really Need a Battery?</h2>
        <p>
          In states with strong full-retail net metering policies, the grid already acts as a free battery. Your solar system exports during the day, the utility credits you at the full retail rate, and you draw that credit back at night for EV charging. Adding a physical battery on top of full-retail net metering is harder to justify on cost alone and typically adds 10 or more years to the payback period.
        </p>
        <p>
          Batteries make more economic sense when: your utility offers only avoided-cost net metering (paying you wholesale rather than retail for exports), you are on TOU rates with high evening peaks, you want backup power for outages, or your utility is considering eliminating net metering. In California (NEM 3.0) and several other states, the economics now favor battery storage alongside solar for new installations.
        </p>
      </EducationalContent>

      <FAQSection questions={solarBatteryEvFAQ} />
      <EmailCapture source="solar-battery-ev" />
      <RelatedCalculators currentPath="/solar-battery-ev" />
    </CalculatorLayout>
  );
}
