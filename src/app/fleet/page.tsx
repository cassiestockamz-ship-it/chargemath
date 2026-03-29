"use client";

import { useState, useMemo, useCallback } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
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

const fmtNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

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
      "EVs eliminate oil changes, transmission servicing, exhaust system repairs, and brake pad replacements (regenerative braking extends pad life 2-3x). Fleet EVs typically cost $400-600/year in maintenance versus $1,000-1,400/year for gas equivalents. The biggest savings come from avoiding engine and drivetrain repairs, which account for roughly 40% of gas vehicle maintenance spending.",
  },
  {
    question: "Should I switch my entire fleet at once or phase it in?",
    answer:
      "Most fleet managers recommend a phased approach. Start with 10-20% of vehicles to build charging infrastructure and operational experience. Prioritize vehicles with predictable daily routes under 200 miles, fixed overnight parking locations, and high daily mileage (which maximizes fuel savings). Full fleet transitions typically take 3-5 years.",
  },
  {
    question: "What charging infrastructure do I need for a fleet?",
    answer:
      "For overnight depot charging, plan one Level 2 charger (7-19 kW) per vehicle. A 10-vehicle fleet typically needs a 100-200 kW electrical service upgrade costing $15,000-50,000 depending on existing infrastructure. DC fast chargers ($30,000-100,000 each) are useful for midday top-ups on high-mileage routes but are not required for most fleets that return to base nightly.",
  },
  {
    question: "Are there tax incentives for fleet electrification?",
    answer:
      "Yes. The federal Commercial Clean Vehicle Credit (Section 45W) offers up to $7,500 per light-duty EV or $40,000 per heavy-duty EV with no manufacturer cap. The Alternative Fuel Vehicle Refueling Property Credit (30C) covers 30% of charging equipment costs up to $100,000 per location. Many states offer additional fleet incentives, grants, and utility rate discounts for commercial EV charging.",
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

    // Breakeven year: when cumulative savings offset purchase premium
    let breakevenYear: number;
    if (purchaseCostDifference <= 0) {
      // EVs are cheaper to buy, breakeven is immediate
      breakevenYear = 0;
    } else if (annualTotalSavings <= 0) {
      breakevenYear = Infinity;
    } else {
      breakevenYear = purchaseCostDifference / annualTotalSavings;
    }

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
      purchaseCostDifference,
      gasTCO,
      evTCO,
      totalSavings,
      breakevenYear,
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

  const formatBreakeven = (years: number): string => {
    if (years <= 0) return "Immediate";
    if (!isFinite(years)) return "N/A";
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    if (wholeYears === 0) return `${months} month${months !== 1 ? "s" : ""}`;
    if (months === 0)
      return `${wholeYears} year${wholeYears !== 1 ? "s" : ""}`;
    return `${wholeYears}y ${months}m`;
  };

  // TCO comparison bar calculations
  const maxTCO = Math.max(results.gasTCO, results.evTCO);
  const gasTCOPct = maxTCO > 0 ? (results.gasTCO / maxTCO) * 100 : 0;
  const evTCOPct = maxTCO > 0 ? (results.evTCO / maxTCO) * 100 : 0;

  return (
    <CalculatorLayout
      title="Fleet Electrification Calculator"
      description="Estimate the total cost of switching your business vehicle fleet from gas to electric. Compare fuel, maintenance, and total cost of ownership."
      intro="Switching a fleet to EVs involves higher upfront vehicle costs but significantly lower fuel and maintenance expenses. Most commercial fleets see a 2-4 year payback on the EV price premium, with 30-50% lower total cost of ownership over a 7-year period. This calculator helps you model the numbers for your specific fleet."
      lastUpdated="March 2026"
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

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <SliderInput
            label="Fleet Size"
            value={fleetSize}
            onChange={setFleetSize}
            min={2}
            max={100}
            step={1}
            unit="vehicles"
            showValue
          />
        </div>

        <div className="sm:col-span-2">
          <SliderInput
            label="Average Daily Miles per Vehicle"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={20}
            max={200}
            step={5}
            unit="miles"
            showValue
          />
        </div>

        <NumberInput
          label="Current Fleet MPG"
          value={gasMpg}
          onChange={setGasMpg}
          min={8}
          max={50}
          step={1}
          unit="MPG"
          helpText="Average fuel economy of your current gas/diesel fleet"
        />

        <NumberInput
          label="Gas Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={8}
          step={0.1}
          unit="$/gallon"
        />

        <NumberInput
          label="EV Efficiency"
          value={evEfficiency}
          onChange={setEvEfficiency}
          min={15}
          max={60}
          step={1}
          unit="kWh/100mi"
          helpText="30 kWh/100mi is typical for sedans; vans use 40-50"
        />

        <NumberInput
          label="Electricity Rate"
          value={electricityRate}
          onChange={setElectricityRate}
          min={5}
          max={50}
          step={1}
          unit="cents/kWh"
          helpText="Your commercial electricity rate"
        />

        <NumberInput
          label="EV Purchase Price (per vehicle)"
          value={evPrice}
          onChange={setEvPrice}
          min={20000}
          max={150000}
          step={1000}
          unit="$"
        />

        <NumberInput
          label="Gas Vehicle Price (per vehicle)"
          value={gasVehiclePrice}
          onChange={setGasVehiclePrice}
          min={15000}
          max={120000}
          step={1000}
          unit="$"
        />

        <NumberInput
          label="Annual Maintenance (Gas Vehicle)"
          value={gasMaintenanceAnnual}
          onChange={setGasMaintenanceAnnual}
          min={200}
          max={5000}
          step={100}
          unit="$/year"
        />

        <NumberInput
          label="Annual Maintenance (EV)"
          value={evMaintenanceAnnual}
          onChange={setEvMaintenanceAnnual}
          min={100}
          max={3000}
          step={50}
          unit="$/year"
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Ownership Period"
            value={ownershipYears}
            onChange={setOwnershipYears}
            min={3}
            max={10}
            step={1}
            unit="years"
            showValue
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Fleet Electrification Results
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Annual Fuel Savings"
            value={fmtShort.format(results.annualFuelSavings)}
            unit="/year"
            icon="⛽"
          />
          <ResultCard
            label="Annual Maintenance Savings"
            value={fmtShort.format(results.annualMaintenanceSavings)}
            unit="/year"
            icon="🔧"
          />
          <ResultCard
            label={`Total Fleet Savings (${ownershipYears}yr)`}
            value={fmtShort.format(results.totalSavings)}
            unit="over gas fleet"
            highlight
            icon="💰"
          />
          <ResultCard
            label="Breakeven Year"
            value={formatBreakeven(results.breakevenYear)}
            unit=""
            highlight
            icon="📅"
          />
          <ResultCard
            label="CO2 Reduced Annually"
            value={`${fmtNumber.format(Math.round(results.annualCO2ReductionTons))}`}
            unit="tons/year"
            icon="🌱"
          />
          <ResultCard
            label="Purchase Price Premium"
            value={fmtShort.format(results.purchaseCostDifference)}
            unit="total fleet"
            icon="🏷️"
          />
        </div>

        {/* TCO Comparison */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            {ownershipYears}-Year Total Cost of Ownership
          </h3>

          {/* Gas Fleet Bar */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">
                Gas Fleet
              </span>
              <span className="font-semibold text-[var(--color-text-muted)]">
                {fmtShort.format(results.gasTCO)}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-red-400/70 transition-all duration-500"
                style={{ width: `${gasTCOPct}%` }}
              />
            </div>
          </div>

          {/* EV Fleet Bar */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--color-text)]">
                EV Fleet
              </span>
              <span className="font-semibold text-[var(--color-ev-green)]">
                {fmtShort.format(results.evTCO)}
              </span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-ev-green)] transition-all duration-500"
                style={{ width: `${evTCOPct}%` }}
              />
            </div>
          </div>

          {/* Summary line */}
          <div className="mt-3 text-center text-sm">
            {results.totalSavings > 0 ? (
              <span className="font-semibold text-[var(--color-ev-green)]">
                EV fleet saves {fmtShort.format(results.totalSavings)} over{" "}
                {ownershipYears} years ({fmtShort.format(results.totalSavings / fleetSize)}/vehicle)
              </span>
            ) : (
              <span className="text-[var(--color-text-muted)]">
                Gas fleet is {fmtShort.format(Math.abs(results.totalSavings))}{" "}
                cheaper over {ownershipYears} years with current settings.
                Consider adjusting fuel prices or ownership period.
              </span>
            )}
          </div>
        </div>

        {/* Annual Cost Breakdown */}
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
            Annual Fleet Operating Costs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 text-right font-medium">Gas Fleet</th>
                  <th className="pb-2 text-right font-medium">EV Fleet</th>
                  <th className="pb-2 text-right font-medium">Savings</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text)]">
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">Fuel / Electricity</td>
                  <td className="py-2 text-right">
                    {fmtShort.format(results.annualGasFuelFleet)}
                  </td>
                  <td className="py-2 text-right">
                    {fmtShort.format(results.annualEvFuelFleet)}
                  </td>
                  <td className="py-2 text-right font-semibold text-[var(--color-ev-green)]">
                    {fmtShort.format(results.annualFuelSavings)}
                  </td>
                </tr>
                <tr className="border-b border-[var(--color-border)]/50">
                  <td className="py-2">Maintenance</td>
                  <td className="py-2 text-right">
                    {fmtShort.format(gasMaintenanceAnnual * fleetSize)}
                  </td>
                  <td className="py-2 text-right">
                    {fmtShort.format(evMaintenanceAnnual * fleetSize)}
                  </td>
                  <td className="py-2 text-right font-semibold text-[var(--color-ev-green)]">
                    {fmtShort.format(results.annualMaintenanceSavings)}
                  </td>
                </tr>
                <tr>
                  <td className="pt-2 font-semibold">Total Annual</td>
                  <td className="pt-2 text-right font-semibold">
                    {fmtShort.format(
                      results.annualGasFuelFleet +
                        gasMaintenanceAnnual * fleetSize
                    )}
                  </td>
                  <td className="pt-2 text-right font-semibold">
                    {fmtShort.format(
                      results.annualEvFuelFleet +
                        evMaintenanceAnnual * fleetSize
                    )}
                  </td>
                  <td className="pt-2 text-right font-bold text-[var(--color-ev-green)]">
                    {fmtShort.format(results.annualTotalSavings)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ShareResults
        title={`Fleet EV Savings: ${fmtShort.format(results.totalSavings)} over ${ownershipYears} years`}
        text={`Switching ${fleetSize} vehicles to EV saves ${fmtShort.format(results.annualFuelSavings)}/year in fuel and ${fmtShort.format(results.annualMaintenanceSavings)}/year in maintenance. Breakeven in ${formatBreakeven(results.breakevenYear)}. Total ${ownershipYears}-year savings: ${fmtShort.format(results.totalSavings)}. CO2 reduced: ${fmtNumber.format(Math.round(results.annualCO2ReductionTons))} tons/year.`}
      />

      <EducationalContent>
        <h2>Understanding Fleet Electrification Economics</h2>
        <p>
          Fleet electrification is one of the strongest business cases for EVs. Commercial fleets drive more miles than personal vehicles, which means fuel and maintenance savings compound faster. The higher the daily mileage, the faster the EV price premium is recovered through lower operating costs.
        </p>
        <h3>Fuel Cost Advantage</h3>
        <p>
          Electricity costs roughly $0.04-0.06 per mile for a typical EV, compared to $0.12-0.20 per mile for a gas vehicle at $3.50/gallon. For a 10-vehicle fleet driving 80 miles/day each, that difference adds up to $15,000-25,000 in annual fuel savings alone. Commercial electricity rates are often lower than residential rates, and many utilities offer special EV fleet charging programs with off-peak discounts.
        </p>
        <h3>Maintenance Savings Add Up</h3>
        <p>
          EVs have roughly 60% fewer moving parts than gas vehicles. No oil changes, no transmission fluid, no spark plugs, no exhaust system repairs. Regenerative braking extends brake pad life by 2-3x. Fleet managers typically report 40-60% lower maintenance costs per vehicle after switching to EVs, which for a 10-vehicle fleet means $6,000-10,000 in annual savings.
        </p>
        <h3>Key Considerations for Fleet Managers</h3>
        <ul>
          <li>Charging infrastructure is the biggest upfront cost beyond vehicles. Budget $2,000-5,000 per Level 2 charging station plus electrical panel upgrades if needed.</li>
          <li>Route planning matters: EVs with 250+ mile range cover most fleet use cases, but vehicles running 200+ miles/day may need midday charging or DC fast chargers.</li>
          <li>Resale values for fleet EVs are still developing. Battery degradation is minimal for modern EVs (typically 85-90% capacity after 200,000 miles), which supports strong residual values.</li>
          <li>Federal tax credits (Section 45W) can offset $7,500 per light-duty vehicle with no manufacturer cap for commercial buyers, significantly reducing the purchase premium.</li>
          <li>Driver training is minimal since EVs are simpler to operate, but fleet managers should train staff on charging procedures and range management.</li>
        </ul>
      </EducationalContent>

      <FAQSection questions={fleetFAQ} />
      <EmailCapture source="fleet" />
      <RelatedCalculators currentPath="/fleet" />
    </CalculatorLayout>
  );
}
