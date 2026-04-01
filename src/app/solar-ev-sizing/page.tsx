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
  NATIONAL_AVG_COST_PER_WATT,
} from "@/data/solar-data";

/* ── Formatters ── */
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

const fmtPct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

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

/* ── Panel wattage options ── */
const PANEL_WATTAGE_OPTIONS = [
  { value: "350", label: "350W (standard)" },
  { value: "400", label: "400W (common)" },
  { value: "450", label: "450W (high efficiency)" },
  { value: "500", label: "500W (premium)" },
];

/* ── FAQ data ── */
const solarEvSizingFAQ = [
  {
    question: "How many solar panels does it take to charge a Tesla?",
    answer:
      "A Tesla Model 3 driven 35 miles per day needs roughly 3,500 kWh per year for charging. In an average US location producing about 1,300 kWh per kW of solar per year, you would need a 2.7 kW system just for the car. Using 400W panels, that is 7 panels. A Tesla Model Y or Model X needs more energy per mile, so expect 9 to 12 panels depending on your driving habits and state.",
  },
  {
    question: "Can I charge my EV entirely from solar?",
    answer:
      "Yes, in most cases you can design a system that produces enough energy annually to cover all EV charging. The key is net metering: your solar panels produce excess power during the day, which flows to the grid and earns you credits. You then draw that stored credit back at night when charging. As long as your utility offers net metering, the grid acts as your battery and you can fully offset EV charging costs with solar.",
  },
  {
    question: "What size solar system do I need for an EV?",
    answer:
      "For a typical EV driven 35 miles per day (about 3,200 kWh/year), you need roughly 2.5 to 3.5 kW of additional solar capacity, depending on your state. However, most homeowners size their system to cover both the EV and their existing home electricity use. A combined system for an average home plus an EV typically runs 8 to 12 kW, using 20 to 30 panels.",
  },
  {
    question: "Does my roof orientation affect how many panels I need?",
    answer:
      "Yes, significantly. A south-facing roof at a 30-degree tilt captures the most sunlight in the US, achieving close to the theoretical maximum production. An east or west-facing roof produces about 15 to 20 percent less energy. A north-facing roof can lose 30 percent or more. This calculator uses state-average production figures, which assume an acceptable orientation. If your roof faces east or west, add 15 to 20 percent more panels to reach your target output.",
  },
  {
    question: "Should I size my solar system for just my EV or my whole home?",
    answer:
      "Sizing for both your home and EV together almost always makes financial sense. The marginal cost of additional panels is low compared to fixed installation costs (permits, labor, inverter), so adding more capacity to cover home use is cost-efficient. A larger system also maximizes the value of any net metering credit you receive and gives you more flexibility if you add a second EV or increase driving in the future. The slider in this calculator lets you choose any combination from EV-only to full home offset.",
  },
];

export default function SolarEvSizingPage() {
  /* ── State ── */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [panelWattage, setPanelWattage] = useState("400");
  const [homeOffset, setHomeOffset] = useState(50);
  const [monthlyBill, setMonthlyBill] = useState(150);

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
      watts: panelWattage,
      offset: String(homeOffset),
      bill: String(monthlyBill),
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.watts && ["350", "400", "450", "500"].includes(p.watts))
        setPanelWattage(p.watts);
      if (p.offset) setHomeOffset(Number(p.offset));
      if (p.bill) setMonthlyBill(Number(p.bill));
    }, [])
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

  const solarProductionPerKw =
    SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;

  /* ── Calculations ── */
  const results = useMemo(() => {
    const panelW = Number(panelWattage);

    // EV energy need
    const dailyEvKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const annualEvKwh = dailyEvKwh * 365;

    // Home energy need
    const annualHomeKwh = (monthlyBill / electricityRate) * 12;
    const homeOffsetKwh = annualHomeKwh * (homeOffset / 100);

    // Total system target
    const totalKwhNeeded = annualEvKwh + homeOffsetKwh;

    // Panel count and system size
    const systemSizeKw = totalKwhNeeded / solarProductionPerKw;
    const numberOfPanels = Math.ceil((systemSizeKw * 1000) / panelW);
    const actualSystemKw = (numberOfPanels * panelW) / 1000;
    const actualAnnualKwh = actualSystemKw * solarProductionPerKw;

    // Physical footprint
    const roofAreaSqFt = numberOfPanels * 18;

    // Cost
    const costPerWatt =
      SOLAR_DATA[stateCode]?.avgInstallCostPerWatt ?? NATIONAL_AVG_COST_PER_WATT;
    const estimatedCost = actualSystemKw * 1000 * costPerWatt;

    // Financial
    const annualSavings =
      Math.min(actualAnnualKwh, annualEvKwh + annualHomeKwh) * electricityRate;
    const paybackYears =
      annualSavings > 0 ? estimatedCost / annualSavings : Infinity;

    // Coverage
    const evChargingCoveredPct = Math.min(actualAnnualKwh / annualEvKwh, 1);

    return {
      dailyEvKwh,
      annualEvKwh,
      annualHomeKwh,
      homeOffsetKwh,
      totalKwhNeeded,
      numberOfPanels,
      actualSystemKw,
      actualAnnualKwh,
      roofAreaSqFt,
      estimatedCost,
      annualSavings,
      paybackYears,
      evChargingCoveredPct,
    };
  }, [
    dailyMiles,
    vehicle,
    monthlyBill,
    electricityRate,
    homeOffset,
    panelWattage,
    solarProductionPerKw,
    stateCode,
  ]);

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

  return (
    <CalculatorLayout
      title="Solar Panel Sizing for EV Charging"
      description="Calculate exactly how many solar panels you need to charge your electric vehicle and offset your home electricity."
      intro="Wondering how many solar panels you actually need to power your EV? The answer depends on your vehicle, how much you drive, your state's solar output, and whether you want to cover just EV charging or your whole home. This calculator runs the real math using EPA vehicle data and state-level solar production figures, so you get a result specific to your situation."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Solar Panel Sizing for EV Charging Calculator"
        description="Calculate how many solar panels you need to charge your EV. See panel count, system size in kW, roof area needed, estimated cost, and payback period."
        url="https://chargemath.com/solar-ev-sizing"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Solar Panel Sizing for EV Charging",
            url: "https://chargemath.com/solar-ev-sizing",
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
          helpText={`${solarProductionPerKw.toLocaleString()} kWh/kW/yr solar production \u2022 ${SOLAR_DATA[stateCode]?.peakSunHours ?? 4.5} peak sun hrs/day`}
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

        <SelectInput
          label="Solar Panel Wattage"
          value={panelWattage}
          onChange={setPanelWattage}
          options={PANEL_WATTAGE_OPTIONS}
          helpText="Higher wattage panels produce more power per panel and need less roof space"
        />

        <NumberInput
          label="Current Monthly Electric Bill"
          value={monthlyBill}
          onChange={setMonthlyBill}
          min={0}
          max={1000}
          step={10}
          unit="$"
          helpText="Your home electricity bill before adding EV charging"
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Home Electricity Offset — how much of your home usage (in addition to EV) to cover with solar"
            value={homeOffset}
            onChange={setHomeOffset}
            min={0}
            max={100}
            step={10}
            unit="%"
            showValue
          />
        </div>
      </div>

      {/* ── Primary Results ── */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your Solar Panel Requirements
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Panels Needed"
            value={String(results.numberOfPanels)}
            unit=""
            highlight
            icon="🔢"
          />
          <ResultCard
            label="System Size"
            value={`${results.actualSystemKw.toFixed(1)} kW`}
            unit=""
            icon="☀️"
          />
          <ResultCard
            label="Roof Area Needed"
            value={`${results.roofAreaSqFt} sq ft`}
            unit=""
            icon="🏠"
          />
          <ResultCard
            label="Estimated Cost"
            value={fmtShort.format(results.estimatedCost)}
            unit="before incentives"
            icon="💰"
          />
        </div>

        {/* ── Secondary Results ── */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Annual Production"
            value={`${Math.round(results.actualAnnualKwh).toLocaleString()} kWh/yr`}
            unit=""
            icon="⚡"
          />
          <ResultCard
            label="EV Charging Covered"
            value={fmtPct.format(results.evChargingCoveredPct)}
            unit=""
            highlight
            icon="🚗"
          />
          <ResultCard
            label="Payback Period"
            value={formatPaybackYears(results.paybackYears)}
            unit=""
            icon="📅"
          />
        </div>

        {/* ── Energy breakdown ── */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Your Annual Energy Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                EV charging (
                {Math.round(results.dailyEvKwh * 10) / 10} kWh/day)
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {Math.round(results.annualEvKwh).toLocaleString()} kWh/yr
              </span>
            </div>
            {homeOffset > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Home offset ({homeOffset}% of{" "}
                  {Math.round(results.annualHomeKwh).toLocaleString()} kWh/yr)
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {Math.round(results.homeOffsetKwh).toLocaleString()} kWh/yr
                </span>
              </div>
            )}
            <hr className="border-[var(--color-border)]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                Total solar target
              </span>
              <span className="font-bold text-[var(--color-text)]">
                {Math.round(results.totalKwhNeeded).toLocaleString()} kWh/yr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-ev-green)]">
                Your system will produce
              </span>
              <span className="font-bold text-[var(--color-ev-green)]">
                {Math.round(results.actualAnnualKwh).toLocaleString()} kWh/yr
              </span>
            </div>
          </div>
        </div>

        {/* ── Cost summary ── */}
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Cost and Savings Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                Estimated system cost (
                {SOLAR_DATA[stateCode]?.avgInstallCostPerWatt ??
                  NATIONAL_AVG_COST_PER_WATT}
                /W installed)
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {fmtShort.format(results.estimatedCost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                Annual electricity savings
              </span>
              <span className="font-semibold text-[var(--color-ev-green)]">
                {fmtShort.format(results.annualSavings)}/yr
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                Estimated payback period
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {formatPaybackYears(results.paybackYears)}
              </span>
            </div>
            <hr className="border-[var(--color-border)]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                25-year net savings
              </span>
              <span className="font-bold text-[var(--color-ev-green)]">
                {fmtShort.format(results.annualSavings * 25 - results.estimatedCost)}
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Note: The residential solar tax credit (Section 25D) was eliminated
            in July 2025. Costs shown are before any state or utility incentives,
            which vary by location.
          </p>
        </div>
      </div>

      <ShareResults
        title={`Solar sizing: ${results.numberOfPanels} panels to charge my EV`}
        text={`I need ${results.numberOfPanels} solar panels (${results.actualSystemKw.toFixed(1)} kW) to charge my EV in ${ELECTRICITY_RATES[stateCode]?.state ?? stateCode}. Estimated cost: ${fmtShort.format(results.estimatedCost)}, payback in ${formatPaybackYears(results.paybackYears)}.`}
      />

      {/* EcoFlow Product Recommendations */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Solar Panels for EV Charging
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EcoFlowCard product={ECOFLOW_PRODUCTS.solarPanel400W} sid="solar-ev-sizing" />
          <EcoFlowCard product={ECOFLOW_PRODUCTS.solarPanel220WBifacial} sid="solar-ev-sizing" />
          <EcoFlowCard product={ECOFLOW_PRODUCTS.deltaPro3} sid="solar-ev-sizing" />
        </div>
      </div>

      <EducationalContent>
        <h2>How We Calculate Your Solar Panel Count</h2>
        <p>
          The calculation starts with your annual electricity need. We take your
          EV&apos;s EPA-rated efficiency (kWh per 100 miles) and multiply it by
          your daily mileage to get daily kWh, then scale to a full year. If you
          want solar to cover a portion of your home electricity, we estimate
          that from your monthly bill and your state&apos;s electricity rate.
        </p>
        <p>
          Next, we look up your state&apos;s solar production factor: how many
          kWh a 1 kW system produces in a year. Arizona produces around 1,700
          kWh/kW/yr while Washington produces closer to 1,000 kWh/kW/yr.
          Dividing total kWh needed by this production factor gives the system
          size in kW. We then divide by your chosen panel wattage and round up
          to get a whole panel count.
        </p>
        <p>
          The formula: panels needed = ceil((annual kWh needed / state
          production factor) * 1000 / panel wattage). Because we round up to
          whole panels, your actual system will typically produce slightly more
          than your target.
        </p>

        <h3>Panel Wattage Matters</h3>
        <p>
          A higher-wattage panel produces more power from the same physical
          space. If you have limited roof area, choosing 450W or 500W panels
          instead of 350W panels can reduce your panel count by 20 to 30
          percent while achieving the same annual output. The trade-off is
          cost: premium panels cost more per unit, though the difference is
          shrinking as manufacturing improves. For most homeowners, 400W panels
          strike the best balance of cost and efficiency. If roof space is a
          constraint, go higher. If budget is the priority, 350W panels from a
          reputable manufacturer work just as well per dollar of system cost.
        </p>

        <h3>Factors That Affect Your Real-World Results</h3>
        <p>
          Several factors can cause your real-world panel count to differ from
          this estimate. Shading from trees, chimneys, or neighboring buildings
          can reduce output by 10 to 40 percent depending on severity. Roof
          orientation matters too: south-facing roofs in the US capture the
          most sun, while east and west-facing roofs lose 15 to 20 percent.
          Panel degradation is also a consideration: modern panels lose about
          0.5 percent of output per year, so after 25 years they produce
          roughly 87 percent of their original capacity. For a conservative
          estimate, add 10 percent to the panel count this calculator suggests.
          Finally, inverter efficiency (typically 96 to 98 percent) and wiring
          losses reduce the total system output slightly. Installers typically
          account for these losses when designing your system.
        </p>
      </EducationalContent>

      <FAQSection questions={solarEvSizingFAQ} />
      <EmailCapture source="solar-ev-sizing" />
      <RelatedCalculators currentPath="/solar-ev-sizing" />
    </CalculatorLayout>
  );
}
