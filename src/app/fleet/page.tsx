"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsMeter from "@/components/SavingsMeter";
import SavingsTile from "@/components/SavingsTile";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import EducationalContent from "@/components/EducationalContent";
import EmailCapture from "@/components/EmailCapture";
import { useUrlSync } from "@/lib/useUrlState";

const CO2_LBS_PER_GALLON = 19.6;

const fleetFAQ = [
  {
    question: "How accurate is this fleet electrification estimate?",
    answer:
      "This calculator provides a solid directional estimate based on the inputs you provide. Real-world results vary based on driving patterns, route types, climate, charging infrastructure availability, and vehicle-specific efficiency. For fleets over 25 vehicles, we recommend a formal fleet assessment that accounts for route telemetry and local utility rate structures.",
  },
  {
    question: "What maintenance costs are lower with electric fleet vehicles?",
    answer:
      "EVs eliminate oil changes, transmission servicing, exhaust system repairs, and brake pad replacements (regenerative braking extends pad life 2 to 3 times). Fleet EVs typically cost $400 to $600 per year in maintenance versus $1,000 to $1,400 per year for gas equivalents. The biggest savings come from avoiding engine and drivetrain repairs, which account for roughly 40 percent of gas vehicle maintenance spending.",
  },
  {
    question: "Should I switch my entire fleet at once or phase it in?",
    answer:
      "Most fleet managers recommend a phased approach. Start with 10 to 20 percent of vehicles to build charging infrastructure and operational experience. Prioritize vehicles with predictable daily routes under 200 miles, fixed overnight parking locations, and high daily mileage (which maximizes fuel savings). Full fleet transitions typically take 3 to 5 years.",
  },
  {
    question: "What charging infrastructure do I need for a fleet?",
    answer:
      "For overnight depot charging, plan one Level 2 charger (7 to 19 kW) per vehicle. A 10-vehicle fleet typically needs a 100 to 200 kW electrical service upgrade costing $15,000 to $50,000 depending on existing infrastructure. DC fast chargers ($30,000 to $100,000 each) are useful for midday top-ups on high-mileage routes but are not required for most fleets that return to base nightly.",
  },
  {
    question: "Are there tax incentives for fleet electrification?",
    answer:
      "Yes. The federal Commercial Clean Vehicle Credit (Section 45W) offers up to $7,500 per light-duty EV or $40,000 per heavy-duty EV with no manufacturer cap. The Alternative Fuel Vehicle Refueling Property Credit (30C) covers 30 percent of charging equipment costs up to $100,000 per location. Many states offer additional fleet incentives, grants, and utility rate discounts for commercial EV charging.",
  },
];

export default function FleetElectrificationPage() {
  const [fleetSize, setFleetSize] = useState(10);
  const [dailyMiles, setDailyMiles] = useState(80);
  const [gasMpg, setGasMpg] = useState(22);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [evEfficiency, setEvEfficiency] = useState(30);
  const [electricityRate, setElectricityRate] = useState(16);
  const [evPrice, setEvPrice] = useState(45000);
  const [gasVehiclePrice, setGasVehiclePrice] = useState(35000);
  const [gasMaintenanceAnnual, setGasMaintenanceAnnual] = useState(1200);
  const [evMaintenanceAnnual, setEvMaintenanceAnnual] = useState(400);
  const [ownershipYears, setOwnershipYears] = useState(7);

  useUrlSync(
    {
      fleet: fleetSize,
      miles: dailyMiles,
      mpg: gasMpg,
      gas: gasPrice,
      eff: evEfficiency,
      elec: electricityRate,
      evp: evPrice,
      gvp: gasVehiclePrice,
      gm: gasMaintenanceAnnual,
      em: evMaintenanceAnnual,
      years: ownershipYears,
    },
    useCallback((p: Record<string, string>) => {
      if (p.fleet) setFleetSize(Number(p.fleet));
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.mpg) setGasMpg(Number(p.mpg));
      if (p.gas) setGasPrice(Number(p.gas));
      if (p.eff) setEvEfficiency(Number(p.eff));
      if (p.elec) setElectricityRate(Number(p.elec));
      if (p.evp) setEvPrice(Number(p.evp));
      if (p.gvp) setGasVehiclePrice(Number(p.gvp));
      if (p.gm) setGasMaintenanceAnnual(Number(p.gm));
      if (p.em) setEvMaintenanceAnnual(Number(p.em));
      if (p.years) setOwnershipYears(Number(p.years));
    }, [])
  );

  const results = useMemo(() => {
    const annualMilesPerVehicle = dailyMiles * 365;
    const fleetAnnualMiles = annualMilesPerVehicle * fleetSize;

    // Fuel costs
    const annualGasFuelPerVehicle =
      (annualMilesPerVehicle / gasMpg) * gasPrice;
    const annualEvFuelPerVehicle =
      (annualMilesPerVehicle / 100) * evEfficiency * (electricityRate / 100);

    const annualGasFuelFleet = annualGasFuelPerVehicle * fleetSize;
    const annualEvFuelFleet = annualEvFuelPerVehicle * fleetSize;
    const annualFuelSavings = annualGasFuelFleet - annualEvFuelFleet;

    // Maintenance
    const annualGasMaintenanceFleet = gasMaintenanceAnnual * fleetSize;
    const annualEvMaintenanceFleet = evMaintenanceAnnual * fleetSize;
    const annualMaintenanceSavings =
      annualGasMaintenanceFleet - annualEvMaintenanceFleet;

    // Purchase costs
    const totalEvPurchase = evPrice * fleetSize;
    const totalGasPurchase = gasVehiclePrice * fleetSize;
    const purchaseCostDifference = totalEvPurchase - totalGasPurchase;

    // TCO over ownership period
    const gasTCO =
      totalGasPurchase +
      annualGasFuelFleet * ownershipYears +
      annualGasMaintenanceFleet * ownershipYears;
    const evTCO =
      totalEvPurchase +
      annualEvFuelFleet * ownershipYears +
      annualEvMaintenanceFleet * ownershipYears;

    const totalSavings = gasTCO - evTCO;

    // Annual combined savings (fuel + maintenance)
    const annualTotalSavings = annualFuelSavings + annualMaintenanceSavings;

    // Per vehicle annual savings
    const perVehicleAnnual = fleetSize > 0 ? annualTotalSavings / fleetSize : 0;

    // TCO delta per vehicle
    const tcoDeltaPerVehicle = fleetSize > 0 ? totalSavings / fleetSize : 0;

    // Breakeven: months, not years, for more useful display on this card
    let breakevenMonths: number;
    if (purchaseCostDifference <= 0) {
      breakevenMonths = 0;
    } else if (annualTotalSavings <= 0) {
      breakevenMonths = Infinity;
    } else {
      breakevenMonths = (purchaseCostDifference / annualTotalSavings) * 12;
    }

    // Share of fuel cost eliminated
    const fuelCutPercent =
      annualGasFuelFleet > 0
        ? Math.max(0, Math.min(100, (annualFuelSavings / annualGasFuelFleet) * 100))
        : 0;

    // CO2 reduction
    const annualGallonsFleet = fleetAnnualMiles / gasMpg;
    const annualCO2ReductionLbs = annualGallonsFleet * CO2_LBS_PER_GALLON;
    const annualCO2ReductionTons = annualCO2ReductionLbs / 2000;

    return {
      annualGasFuelFleet,
      annualEvFuelFleet,
      annualFuelSavings,
      annualMaintenanceSavings,
      annualTotalSavings,
      perVehicleAnnual,
      tcoDeltaPerVehicle,
      purchaseCostDifference,
      gasTCO,
      evTCO,
      totalSavings,
      breakevenMonths,
      fuelCutPercent,
      annualCO2ReductionLbs,
      annualCO2ReductionTons,
    };
  }, [
    fleetSize,
    dailyMiles,
    gasMpg,
    gasPrice,
    evEfficiency,
    electricityRate,
    evPrice,
    gasVehiclePrice,
    gasMaintenanceAnnual,
    evMaintenanceAnnual,
    ownershipYears,
  ]);

  const breakevenDisplay = !isFinite(results.breakevenMonths)
    ? 0
    : Math.round(results.breakevenMonths);
  const breakevenUnit = !isFinite(results.breakevenMonths)
    ? " never"
    : results.breakevenMonths === 0
      ? " day 1"
      : " months";

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SliderInput
        label="Fleet size"
        value={fleetSize}
        onChange={setFleetSize}
        min={2}
        max={100}
        step={1}
        unit="vehicles"
        showValue
      />
      <SliderInput
        label="Daily miles per vehicle"
        value={dailyMiles}
        onChange={setDailyMiles}
        min={20}
        max={200}
        step={5}
        unit="mi"
        showValue
      />
      <NumberInput
        label="Current fleet MPG"
        value={gasMpg}
        onChange={setGasMpg}
        min={8}
        max={50}
        step={1}
        unit="MPG"
        helpText="Average fuel economy of your current fleet"
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="FLEET SAVES"
      amount={Math.max(0, results.annualTotalSavings)}
      amountUnit="/year"
      sub={
        <>
          Across {fleetSize} vehicles on fuel plus maintenance. Over {ownershipYears} years that totals ${Math.max(0, Math.round(results.totalSavings)).toLocaleString()} versus a gas fleet.
        </>
      }
      dialPercent={Math.round(results.fuelCutPercent)}
      dialLabel="FUEL CUT"
    >
      <SavingsTile
        label="ANNUAL SAVINGS"
        value={Math.max(0, results.annualTotalSavings)}
        prefix="$"
        decimals={0}
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="PER VEHICLE"
        value={Math.max(0, results.perVehicleAnnual)}
        prefix="$"
        decimals={0}
        unit="/yr"
        tier="brand"
        animate
      />
      <SavingsTile
        label="TCO DELTA"
        value={Math.max(0, results.tcoDeltaPerVehicle)}
        prefix="$"
        decimals={0}
        unit="/veh"
        tier="volt"
        animate
      />
      <SavingsTile
        label="BREAK-EVEN MONTH"
        value={breakevenDisplay}
        prefix=""
        decimals={0}
        unit={breakevenUnit}
        tier={!isFinite(results.breakevenMonths) ? "warn" : "mid"}
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Fleet electrification"
      title="Fleet Electrification Calculator"
      quickAnswer="Commercial fleets typically see a 2 to 4 year payback on EV price premium and 30 to 50 percent lower TCO over 7 years."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema
        name="Fleet Electrification Calculator"
        description="Estimate the cost of switching a vehicle fleet to EVs. Compare fuel costs, maintenance, TCO, breakeven timeline, and CO2 reduction."
        url="https://chargemath.com/fleet"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Fleet Electrification",
            url: "https://chargemath.com/fleet",
          },
        ]}
      />

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Gas price"
            value={gasPrice}
            onChange={setGasPrice}
            min={1}
            max={8}
            step={0.1}
            unit="$/gallon"
          />
          <NumberInput
            label="EV efficiency"
            value={evEfficiency}
            onChange={setEvEfficiency}
            min={15}
            max={60}
            step={1}
            unit="kWh/100mi"
            helpText="30 for sedans, 40 to 50 for vans"
          />
          <NumberInput
            label="Electricity rate"
            value={electricityRate}
            onChange={setElectricityRate}
            min={5}
            max={50}
            step={1}
            unit="cents/kWh"
            helpText="Your commercial rate"
          />
          <SliderInput
            label="Ownership period"
            value={ownershipYears}
            onChange={setOwnershipYears}
            min={3}
            max={10}
            step={1}
            unit="years"
            showValue
          />
          <NumberInput
            label="EV purchase price (per vehicle)"
            value={evPrice}
            onChange={setEvPrice}
            min={20000}
            max={150000}
            step={1000}
            unit="$"
          />
          <NumberInput
            label="Gas vehicle price (per vehicle)"
            value={gasVehiclePrice}
            onChange={setGasVehiclePrice}
            min={15000}
            max={120000}
            step={1000}
            unit="$"
          />
          <NumberInput
            label="Annual maintenance (gas vehicle)"
            value={gasMaintenanceAnnual}
            onChange={setGasMaintenanceAnnual}
            min={200}
            max={5000}
            step={100}
            unit="$/year"
          />
          <NumberInput
            label="Annual maintenance (EV)"
            value={evMaintenanceAnnual}
            onChange={setEvMaintenanceAnnual}
            min={100}
            max={3000}
            step={50}
            unit="$/year"
          />
        </div>
      </details>

      {/* Signature split-column live meter: fleet gas vs fleet EV annual operating cost */}
      <SavingsMeter
        leftLabel="FLEET GAS"
        leftValue={results.annualGasFuelFleet + gasMaintenanceAnnual * fleetSize}
        rightLabel="FLEET EV"
        rightValue={results.annualEvFuelFleet + evMaintenanceAnnual * fleetSize}
      />

      <h2 className="cm-eyebrow mt-8 mb-3">Fleet impact</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SavingsTile
          label="FUEL SAVINGS"
          value={Math.max(0, results.annualFuelSavings)}
          prefix="$"
          decimals={0}
          unit="/yr"
          tier="good"
        />
        <SavingsTile
          label="MAINT SAVINGS"
          value={Math.max(0, results.annualMaintenanceSavings)}
          prefix="$"
          decimals={0}
          unit="/yr"
          tier="brand"
        />
        <SavingsTile
          label={`${ownershipYears} YEAR TOTAL`}
          value={Math.max(0, results.totalSavings)}
          prefix="$"
          decimals={0}
          unit=" saved"
          tier="volt"
          animate
        />
        <SavingsTile
          label="CO2 CUT"
          value={Math.round(results.annualCO2ReductionTons)}
          prefix=""
          decimals={0}
          unit=" tons/yr"
          tier="good"
        />
      </div>

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/total-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Per-vehicle total cost of ownership
        </Link>
        <Link
          href="/gas-vs-electric"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Side by side fuel cost comparison
        </Link>
        <Link
          href="/charger-roi"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Home and depot charger ROI
        </Link>
      </div>

      <EducationalContent>
        <h2>Understanding Fleet Electrification Economics</h2>
        <p>
          Fleet electrification is one of the strongest business cases for EVs. Commercial fleets drive more miles than personal vehicles, which means fuel and maintenance savings compound faster. The higher the daily mileage, the faster the EV price premium is recovered through lower operating costs.
        </p>
        <h3>Fuel Cost Advantage</h3>
        <p>
          Electricity costs roughly $0.04 to $0.06 per mile for a typical EV, compared to $0.12 to $0.20 per mile for a gas vehicle at $3.50 per gallon. For a 10-vehicle fleet driving 80 miles per day each, that difference adds up to $15,000 to $25,000 in annual fuel savings alone. Commercial electricity rates are often lower than residential rates, and many utilities offer special EV fleet charging programs with off-peak discounts.
        </p>
        <h3>Maintenance Savings Add Up</h3>
        <p>
          EVs have roughly 60 percent fewer moving parts than gas vehicles. No oil changes, no transmission fluid, no spark plugs, no exhaust system repairs. Regenerative braking extends brake pad life by 2 to 3 times. Fleet managers typically report 40 to 60 percent lower maintenance costs per vehicle after switching to EVs, which for a 10-vehicle fleet means $6,000 to $10,000 in annual savings.
        </p>
        <h3>Key Considerations for Fleet Managers</h3>
        <ul>
          <li>Charging infrastructure is the biggest upfront cost beyond vehicles. Budget $2,000 to $5,000 per Level 2 charging station plus electrical panel upgrades if needed.</li>
          <li>Route planning matters. EVs with 250+ mile range cover most fleet use cases, but vehicles running 200+ miles per day may need midday charging or DC fast chargers.</li>
          <li>Resale values for fleet EVs are still developing. Battery degradation is minimal for modern EVs (typically 85 to 90 percent capacity after 200,000 miles), which supports strong residual values.</li>
          <li>Federal tax credits (Section 45W) can offset $7,500 per light-duty vehicle with no manufacturer cap for commercial buyers, significantly reducing the purchase premium.</li>
          <li>Driver training is minimal since EVs are simpler to operate, but fleet managers should train staff on charging procedures and range management.</li>
        </ul>
      </EducationalContent>

      <FAQSection questions={fleetFAQ} />
      <EmailCapture source="fleet" />
      <RelatedCalculators currentPath="/fleet" />
    </CalculatorShell>
  );
}
