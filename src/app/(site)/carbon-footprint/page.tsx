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
import { ELECTRICITY_RATES } from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

/** CO2 emitted per gallon of gasoline burned (lbs) */
const CO2_LBS_PER_GALLON = 19.6;

/** CO2 absorbed by one tree per year (lbs) */
const LBS_CO2_PER_TREE_PER_YEAR = 48;

/**
 * Grid carbon intensity by state in lbs CO2 per MWh.
 */
const CLEAN_STATES = ["WA", "OR", "VT", "ID", "ME", "NH", "SD", "NE"];
const DIRTY_STATES = ["WV", "WY", "ND", "MO", "KY", "IN", "UT", "OH"];

const GRID_INTENSITY: Record<string, number> = Object.fromEntries(
  Object.keys(ELECTRICITY_RATES).map((code) => {
    if (CLEAN_STATES.includes(code)) return [code, 200];
    if (DIRTY_STATES.includes(code)) return [code, 1400];
    return [code, 800];
  })
);

const carbonFootprintFAQ = [
  {
    question: "How much CO2 does a typical gas car produce per year?",
    answer:
      "The average gas car driven 12,775 miles per year at 28 MPG produces about 8,940 lbs of CO2 annually. That is roughly 4.5 metric tons. Higher-mileage drivers or less efficient vehicles produce significantly more.",
  },
  {
    question: "Do EVs produce zero emissions?",
    answer:
      "EVs produce zero tailpipe emissions, but they do have indirect emissions from the electricity used to charge them. The amount depends on your state's electricity grid mix. In states with clean grids (hydro, nuclear, wind), EV emissions are extremely low. Even in coal-heavy states, EVs typically produce 50 to 70 percent less CO2 than gas cars due to the superior efficiency of electric motors.",
  },
  {
    question: "What is grid carbon intensity and why does it matter?",
    answer:
      "Grid carbon intensity measures how much CO2 is emitted to generate one unit of electricity, typically expressed in lbs CO2 per MWh. States that rely heavily on coal (like West Virginia or Wyoming) have high grid intensity around 1,400 lbs/MWh, while states with hydropower or nuclear (like Washington or Vermont) can be as low as 200 lbs/MWh. This directly affects how clean your EV really is.",
  },
  {
    question: "How many trees would I need to plant to offset a gas car?",
    answer:
      "A single mature tree absorbs about 48 lbs of CO2 per year. To offset the average gas car producing around 8,900 lbs of CO2 annually, you would need roughly 186 trees. Switching to an EV in a clean-grid state can be equivalent to planting 150+ trees every year.",
  },
  {
    question: "Does the EV carbon footprint include manufacturing?",
    answer:
      "This calculator focuses on operational emissions (fuel and electricity use). EV manufacturing does produce more CO2 than gas car manufacturing, primarily due to battery production. However, most lifecycle analyses show that EVs break even on total emissions within 1 to 3 years of driving and produce 50 to 70 percent less lifetime CO2 than equivalent gas vehicles.",
  },
];

export default function CarbonFootprintPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasMpg, setGasMpg] = useState(28);

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, mpg: gasMpg },
    useCallback(
      (p: Record<string, string>) => {
        if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
          setVehicleId(p.vehicle);
        if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
        if (p.miles) setDailyMiles(Number(p.miles));
        if (p.mpg) setGasMpg(Number(p.mpg));
      },
      []
    )
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${GRID_INTENSITY[code]} lbs CO2/MWh)`,
    }));

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;

    // Gas car CO2
    const annualGallons = annualMiles / gasMpg;
    const gasCO2Lbs = annualGallons * CO2_LBS_PER_GALLON;

    // EV CO2 from grid
    const gridIntensity = GRID_INTENSITY[stateCode] ?? 800;
    const evCO2Lbs = (annualKwh * gridIntensity) / 1000;

    // Savings
    const annualSavingsLbs = gasCO2Lbs - evCO2Lbs;
    const lifetimeSavingsLbs = annualSavingsLbs * 10;
    const lifetimeSavingsTons = lifetimeSavingsLbs / 2000;
    const equivalentTrees = annualSavingsLbs / LBS_CO2_PER_TREE_PER_YEAR;
    const gallonsSaved = annualGallons;
    const percentReduction =
      gasCO2Lbs > 0 ? (annualSavingsLbs / gasCO2Lbs) * 100 : 0;

    return {
      annualMiles,
      annualKwh,
      gasCO2Lbs,
      evCO2Lbs,
      annualSavingsLbs,
      lifetimeSavingsLbs,
      lifetimeSavingsTons,
      equivalentTrees,
      gallonsSaved,
      percentReduction,
      gridIntensity,
    };
  }, [dailyMiles, vehicle, gasMpg, stateCode]);

  const gridLabel = CLEAN_STATES.includes(stateCode)
    ? "Clean Grid"
    : DIRTY_STATES.includes(stateCode)
      ? "High-Carbon Grid"
      : "Average Grid";

  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? stateCode;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Select an EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi, ${vehicle.epaRangeMiles} mi range`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
        helpText={`${gridLabel} (${GRID_INTENSITY[stateCode]} lbs CO2/MWh)`}
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
            label="Gas car MPG"
            value={gasMpg}
            onChange={setGasMpg}
            min={10}
            max={60}
            step={1}
            unit="MPG"
            helpText="Average US car: 28 MPG"
          />
          <div className="flex items-end text-sm text-[var(--color-ink-3)]">
            <p>
              CO2 per gallon of gas: {CO2_LBS_PER_GALLON} lbs (EPA standard)
            </p>
          </div>
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Carbon footprint"
      headline="CO2 CUT"
      amount={Math.round(Math.max(0, results.annualSavingsLbs))}
      amountPrefix=""
      amountDecimals={0}
      amountUnit=" lbs/yr"
      sub={`Your ${vehicle.year} ${vehicle.make} ${vehicle.model} on the ${stateName} grid vs a ${gasMpg} MPG gas car. That is like planting ${Math.round(results.equivalentTrees)} trees every year.`}
      dialPercent={Math.min(100, Math.max(0, results.percentReduction))}
      dialLabel="CO2 CUT"
    >
      <SavingsTile
        label="CO2 CUT"
        value={Math.round(Math.max(0, results.annualSavingsLbs))}
        unit=" lbs/yr"
        tier="good"
      />
      <SavingsTile
        label="EQUIVALENT TREES"
        value={Math.round(results.equivalentTrees)}
        unit=" trees/yr"
        tier="brand"
      />
      <SavingsTile
        label="LIFETIME TONS"
        value={results.lifetimeSavingsTons}
        decimals={1}
        unit=" tons"
        tier="volt"
      />
      <SavingsTile
        label="VS GAS"
        value={Math.round(results.percentReduction)}
        unit="% less"
        tier="mid"
      />
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="EV Carbon Footprint Savings Calculator"
        description="Calculate CO2 savings from driving an EV vs a gas car using real vehicle data and state-level grid carbon intensity."
        url="https://chargemath.com/carbon-footprint"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Carbon Footprint Savings",
            url: "https://chargemath.com/carbon-footprint",
          },
        ]}
      />
      <CalculatorShell
        eyebrow="Carbon footprint"
        title="Carbon Footprint Savings"
        quickAnswer="EVs produce less CO2 than gas cars in all 50 states. In clean-grid states the reduction tops 90 percent."
        inputs={inputs}
        hero={hero}
      >
        <EducationalContent>
          <h2>Understanding EV Carbon Footprint Savings</h2>
          <p>
            When comparing the environmental impact of EVs versus gas cars, the
            key factors are tailpipe emissions and grid emissions. A gas car
            burns fuel directly, emitting about 19.6 lbs of CO2 per gallon. An
            EV produces zero tailpipe emissions but draws electricity that may
            come from fossil fuel power plants.
          </p>
          <h3>Why EVs Win in Every State</h3>
          <p>
            Electric motors are 3 to 4 times more efficient than combustion
            engines. Even when electricity comes entirely from coal, the power
            plant operates at higher efficiency than a car engine, and much of
            the U.S. grid uses cleaner sources like natural gas, nuclear, wind,
            and solar. The result: EVs produce less CO2 per mile in all 50
            states.
          </p>
          <h3>Grid Mix Matters</h3>
          <p>
            Your state&apos;s electricity sources have a major impact on your
            EV&apos;s carbon footprint. Washington and Oregon get most of their
            electricity from hydropower, making EVs there nearly zero-emission
            vehicles. States like West Virginia and Wyoming rely heavily on
            coal, so EVs there still produce meaningful grid emissions, though
            significantly less than gas cars.
          </p>
          <h3>The Grid Is Getting Cleaner</h3>
          <p>
            U.S. grid carbon intensity has dropped about 40 percent since 2005
            and continues to decline as coal plants retire and renewable energy
            expands. This means your EV gets cleaner every year without you
            doing anything. A gas car&apos;s emissions stay the same for its
            entire life.
          </p>
          <h3>Beyond Tailpipe Emissions</h3>
          <ul>
            <li>
              Manufacturing emissions: EV battery production adds roughly
              10,000 to 20,000 lbs of extra CO2 at manufacturing time. This is
              typically offset within 1 to 3 years of driving.
            </li>
            <li>
              Upstream emissions: Gas extraction, refining, and transport add
              roughly 25 percent more CO2 on top of tailpipe emissions (not
              included in this calculator).
            </li>
            <li>
              Charging timing: If you charge during off-peak hours (overnight),
              you may use a cleaner grid mix since renewable sources like wind
              often peak at night.
            </li>
          </ul>
        </EducationalContent>

        <FAQSection questions={carbonFootprintFAQ} />
        <EmailCapture source="carbon-footprint" />
        <RelatedCalculators currentPath="/carbon-footprint" />
      </CalculatorShell>
    </>
  );
}
