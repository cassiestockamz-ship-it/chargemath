"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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

/* FAQ data (inline) */
const solarBatteryEvFAQ = [
  {
    question: "Can I charge my EV from a home battery?",
    answer:
      "Yes. A home battery stores electricity (whether from solar panels or the grid) and can be used to charge your EV overnight via your Level 2 home charger. The key is that your battery must hold enough usable energy to cover both your EV charging need and any overnight home consumption. This calculator sizes the battery for that exact scenario.",
  },
  {
    question: "How many Powerwalls do I need to charge my EV?",
    answer:
      "It depends on your EV and daily driving. Each Tesla Powerwall 3 holds 13.5 kWh of nominal capacity. A typical EV driven 35 miles per day uses about 8 to 10 kWh for charging. Adding 10 kWh of overnight home usage, you need roughly 18 to 20 kWh of usable capacity. At 90% depth of discharge, one Powerwall 3 is not quite enough for the combined load; two units give you comfortable headroom. This calculator handles those exact numbers for your specific vehicle and driving habits.",
  },
  {
    question: "What is depth of discharge and why does it matter?",
    answer:
      "Depth of discharge (DoD) is the percentage of a battery's total capacity that you actually use before recharging it. Manufacturers like Tesla and Enphase recommend not fully depleting the battery to prolong its lifespan. At 90% DoD, a 13.5 kWh battery provides 12.15 kWh of usable energy. Repeatedly discharging to 100% can reduce the battery's cycle life by 30 to 50%. This calculator uses DoD to compute true usable capacity, not just the nameplate number.",
  },
  {
    question: "Is a home battery worth it for EV charging?",
    answer:
      "A battery makes financial sense in specific situations: if your utility has time-of-use (TOU) rates where nighttime electricity costs more than daytime solar export credits, if your utility has weak net metering policies, or if you want backup power during outages. In states with full retail net metering, the grid already acts as a free battery, making an add-on battery harder to justify on cost alone.",
  },
  {
    question: "What size solar system do I need to fill a home battery daily?",
    answer:
      "To fill a battery each day, your solar system must produce at least as much energy as the battery stores (plus round-trip efficiency losses). For example, if your battery needs 20 kWh of usable storage and your location gets 5 peak sun hours per day, you need at least 4.2 kW of solar panels to refill it every day. This calculator computes the exact solar system size needed alongside the battery recommendation.",
  },
];

export default function SolarBatteryEvPage() {
  /* State */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [overnightHomeKwh, setOvernightHomeKwh] = useState(10);
  const [depthOfDischarge, setDepthOfDischarge] = useState(90);
  const [roundTripEfficiency, setRoundTripEfficiency] = useState(95);
  const [daysOfAutonomy, setDaysOfAutonomy] = useState("1");

  /* Auto-detect state */
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  /* URL sync */
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

  /* Derived */
  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const electricityRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100; // $/kWh
  }, [stateCode]);

  /* Calculations */
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

    // Find cheapest option
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

    // Backup hours: approximate backup duration at the nightly load rate (hours per 24h window)
    // If autonomy = 1 day, assume backup supports 12 overnight hours of load.
    const backupHours = autonomyDays * 12;

    // Self-consumption share: EV portion of total nightly load
    const selfUsePct =
      totalNightlyKwh > 0 ? Math.round((dailyEvKwh / totalNightlyKwh) * 100) : 0;

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
      backupHours,
      selfUsePct,
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

  /* Options */
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

  const nightChargingLabel = `${results.dailyEvKwh.toFixed(1)} kWh/night`;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <SliderInput
        label="Daily miles driven"
        value={dailyMiles}
        onChange={setDailyMiles}
        min={10}
        max={150}
        step={5}
        unit="mi"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Overnight home usage"
            value={overnightHomeKwh}
            onChange={setOvernightHomeKwh}
            min={2}
            max={30}
            step={1}
            unit="kWh"
            helpText="Typical home uses 8 to 12 kWh overnight"
          />
          <SelectInput
            label="Days of autonomy"
            value={daysOfAutonomy}
            onChange={setDaysOfAutonomy}
            options={autonomyOptions}
            helpText="Days of backup without sun"
          />
          <SliderInput
            label="Battery depth of discharge"
            value={depthOfDischarge}
            onChange={setDepthOfDischarge}
            min={50}
            max={100}
            step={5}
            unit="%"
            showValue
          />
          <SliderInput
            label="Round-trip efficiency"
            value={roundTripEfficiency}
            onChange={setRoundTripEfficiency}
            min={85}
            max={100}
            step={1}
            unit="%"
            showValue
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Battery sizing"
      headline="BATTERY SIZE"
      amount={Math.round(results.nominalCapacity)}
      amountPrefix=""
      amountDecimals={0}
      amountUnit=" kWh"
      sub={`Nominal capacity to cover ${results.dailyEvKwh.toFixed(1)} kWh of EV charging plus ${overnightHomeKwh} kWh of overnight home usage. Recommended: ${results.recommended.unitsNeeded} x ${results.recommended.name}.`}
      dialPercent={Math.min(100, Math.max(0, results.selfUsePct))}
      dialLabel="EV SHARE"
    >
      <SavingsTile
        label="BATTERY KWH"
        value={results.nominalCapacity}
        decimals={1}
        unit=" kWh"
        tier="volt"
      />
      <SavingsTile
        label="BACKUP HOURS"
        value={results.backupHours}
        unit=" hrs"
        tier="brand"
      />
      <SavingsTile
        label="SOLAR SELF-USE"
        value={results.selfUsePct}
        unit="% EV"
        tier="good"
      />
      <SavingsTile
        label="NIGHT CHARGING"
        value={Math.round(results.dailyEvKwh * 10) / 10}
        decimals={1}
        unit=" kWh"
        sub={nightChargingLabel}
        tier="mid"
      />
    </SavingsVerdict>
  );

  return (
    <>
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
      <CalculatorShell
        eyebrow="Battery sizing"
        title="Solar Battery Size for EV Charging"
        quickAnswer="For a daily-driver EV plus normal overnight home loads, plan on 18 to 25 kWh of nominal battery capacity."
        inputs={inputs}
        hero={hero}
      >
        <EducationalContent>
          <h2>Why Pair a Home Battery with Solar and an EV?</h2>
          <p>
            Solar panels produce electricity during the day, but most EV owners
            charge at night. Without a battery, you rely on net metering to
            credit your daytime export against your nighttime draw. A home
            battery changes that equation by storing the solar energy directly,
            so you use your own electrons when the sun goes down instead of
            buying them back from the grid.
          </p>
          <p>
            This matters most in states with time-of-use (TOU) electricity
            rates, where the cost per kWh is higher during evening peak hours
            (typically 4 to 9 PM) when people arrive home and plug in their EVs.
            Storing solar in a battery and discharging during those peak hours
            can save significantly more than a flat-rate net metering credit.
          </p>
          <h2>Understanding Battery Capacity Specs</h2>
          <p>
            Battery manufacturers advertise two numbers: nominal capacity and
            usable capacity. Nominal capacity is the total amount of energy the
            battery can hold. Usable capacity is the amount you can actually
            draw before the battery management system stops discharging to
            protect the cells.
          </p>
          <p>
            Depth of discharge (DoD) is the ratio of usable to nominal capacity.
            A battery with 13.5 kWh nominal at 90% DoD provides 12.15 kWh of
            usable energy per cycle. Round-trip efficiency accounts for losses
            during the charge and discharge cycle. This calculator applies both
            factors so you get a realistic system size.
          </p>
          <h2>Do You Really Need a Battery?</h2>
          <p>
            In states with strong full-retail net metering policies, the grid
            already acts as a free battery. Your solar system exports during the
            day, the utility credits you at the full retail rate, and you draw
            that credit back at night for EV charging. Adding a physical battery
            on top of full-retail net metering is harder to justify on cost alone.
          </p>
          <p>
            Batteries make more economic sense when your utility offers only
            avoided-cost net metering (paying you wholesale rather than retail
            for exports), you are on TOU rates with high evening peaks, you want
            backup power for outages, or your utility is considering eliminating
            net metering. In California (NEM 3.0) and several other states, the
            economics now favor battery storage alongside solar for new
            installations.
          </p>
        </EducationalContent>

        <FAQSection questions={solarBatteryEvFAQ} />
        <EmailCapture source="solar-battery-ev" />
        <RelatedCalculators currentPath="/solar-battery-ev" />
      </CalculatorShell>
    </>
  );
}
