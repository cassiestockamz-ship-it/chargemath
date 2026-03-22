"use client";

import { useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import SelectInput from "@/components/SelectInput";
import NumberInput from "@/components/NumberInput";
import SliderInput from "@/components/SliderInput";
import ResultCard from "@/components/ResultCard";
import AffiliateCard from "@/components/AffiliateCard";
import RelatedCalculators from "@/components/RelatedCalculators";
import CalculatorSchema from "@/components/CalculatorSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import FAQSection from "@/components/FAQSection";
import ShareResults from "@/components/ShareResults";
import { gasVsElectricFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const AMAZON_TAG = "kawaiiguy0f-cm-20";
const CO2_GRAMS_PER_GALLON = 8887;
const CO2_LBS_PER_KWH = 0.86;
const LBS_CO2_PER_TREE_PER_YEAR = 48;

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmtNum = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export default function GasVsElectricPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [gasPrice, setGasPrice] = useState(3.5);
  const [gasMpg, setGasMpg] = useState(28);
  const [years, setYears] = useState("5");

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const rate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    return (ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const periodYears = Number(years);

  const results = useMemo(() => {
    const annualMiles = dailyMiles * 365;
    const annualKwh = (annualMiles / 100) * vehicle.kwhPer100Miles;

    const evAnnualCost = annualKwh * rate;
    const gasAnnualCost = (annualMiles / gasMpg) * gasPrice;
    const annualSavings = gasAnnualCost - evAnnualCost;
    const totalSavings = annualSavings * periodYears;

    const evCostPerMile = rate * (vehicle.kwhPer100Miles / 100);
    const gasCostPerMile = gasPrice / gasMpg;

    // CO2 calculations
    const gasGallonsPerYear = annualMiles / gasMpg;
    const gasCO2LbsPerYear = (gasGallonsPerYear * CO2_GRAMS_PER_GALLON) / 453.592;
    const evCO2LbsPerYear = annualKwh * CO2_LBS_PER_KWH;
    const co2SavingsLbsPerYear = gasCO2LbsPerYear - evCO2LbsPerYear;
    const equivalentTrees = co2SavingsLbsPerYear / LBS_CO2_PER_TREE_PER_YEAR;

    return {
      annualMiles,
      evAnnualCost,
      gasAnnualCost,
      annualSavings,
      totalSavings,
      evCostPerMile,
      gasCostPerMile,
      gasCO2LbsPerYear,
      evCO2LbsPerYear,
      co2SavingsLbsPerYear,
      equivalentTrees,
    };
  }, [dailyMiles, vehicle, rate, gasMpg, gasPrice, periodYears]);

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

  const periodOptions = [
    { value: "1", label: "1 Year" },
    { value: "3", label: "3 Years" },
    { value: "5", label: "5 Years" },
    { value: "10", label: "10 Years" },
  ];

  return (
    <CalculatorLayout
      title="Gas vs Electric Cost Comparison"
      description="Compare the true fuel costs of driving electric vs gas, and see your potential savings and environmental impact."
      lastUpdated="March 2026"
      intro="Electric vehicles cost 60-70% less to fuel than gas cars. The average EV driver saves $800-1,200 per year on fuel, with additional savings on maintenance. Use this calculator to see your exact savings based on your specific vehicles and local rates."
    >
      <CalculatorSchema name="Gas vs Electric Cost Comparison" description="Compare the true fuel costs of driving electric vs gas with side-by-side savings and CO2 analysis." url="https://chargemath.com/gas-vs-electric" />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "Gas vs Electric Comparison", url: "https://chargemath.com/gas-vs-electric"}]} />
      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select an EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.kwhPer100Miles} kWh/100mi \u2022 ${vehicle.epaRangeMiles} mi range`}
        />

        <SelectInput
          label="Your State"
          value={stateCode}
          onChange={setStateCode}
          options={stateOptions}
        />

        <NumberInput
          label="Custom Electricity Rate (optional)"
          value={customRate ?? 0}
          onChange={(v) => setCustomRate(v > 0 ? v : null)}
          min={0}
          max={100}
          step={0.1}
          unit={"¢/kWh"}
          helpText="Leave at 0 to use state average"
        />

        <SelectInput
          label="Comparison Period"
          value={years}
          onChange={setYears}
          options={periodOptions}
        />

        <NumberInput
          label="Current Gas Price"
          value={gasPrice}
          onChange={setGasPrice}
          min={1}
          max={10}
          step={0.1}
          unit="$/gal"
        />

        <NumberInput
          label="Current Gas Car MPG"
          value={gasMpg}
          onChange={setGasMpg}
          min={10}
          max={60}
          step={1}
          unit="MPG"
          helpText="Average US car: 28 MPG"
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
      </div>

      {/* Results */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Cost Comparison
        </h2>

        {/* Side-by-side */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* EV Column */}
          <div className="rounded-xl border-2 border-[var(--color-ev-green)]/30 bg-[var(--color-ev-green)]/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--color-ev-green)]">
              <span>🔋</span> Electric (EV)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Annual Fuel Cost
                </span>
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {fmt.format(results.evAnnualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Cost Per Mile
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  ${results.evCostPerMile.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  CO2/Year
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtNum.format(results.evCO2LbsPerYear)} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {periodYears}-Year Fuel Cost
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtWhole.format(results.evAnnualCost * periodYears)}
                </span>
              </div>
            </div>
          </div>

          {/* Gas Column */}
          <div className="rounded-xl border-2 border-[var(--color-gas-red)]/30 bg-[var(--color-gas-red)]/5 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--color-gas-red)]">
              <span>⛽</span> Gas
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Annual Fuel Cost
                </span>
                <span className="text-lg font-bold text-[var(--color-text)]">
                  {fmt.format(results.gasAnnualCost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  Cost Per Mile
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  ${results.gasCostPerMile.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  CO2/Year
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtNum.format(results.gasCO2LbsPerYear)} lbs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {periodYears}-Year Fuel Cost
                </span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {fmtWhole.format(results.gasAnnualCost * periodYears)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Big savings number */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label={`Total Savings (${periodYears} yr)`}
            value={fmtWhole.format(results.totalSavings)}
            unit="saved"
            highlight
            icon="💰"
          />
          <ResultCard
            label="Annual Savings"
            value={fmtWhole.format(results.annualSavings)}
            unit="/year"
            highlight
            icon="📅"
          />
          <ResultCard
            label="CO2 Savings"
            value={fmtNum.format(results.co2SavingsLbsPerYear)}
            unit="lbs/year"
            icon="🌍"
          />
          <ResultCard
            label="Equivalent Trees Planted"
            value={fmtNum.format(results.equivalentTrees)}
            unit="trees/year"
            icon="🌳"
          />
        </div>
      </div>

      <ShareResults
        title={`Gas vs Electric: Save ${fmtWhole.format(results.annualSavings)}/year`}
        text={`Switching from gas to electric saves me ${fmtWhole.format(results.annualSavings)}/year on fuel. My ${vehicle.year} ${vehicle.make} ${vehicle.model} costs ${fmt.format(results.evCostPerMile)}/mile vs ${fmt.format(results.gasCostPerMile)}/mile for gas — ${fmtWhole.format(results.totalSavings)} total savings over ${periodYears} years!`}
      />

      {/* Affiliate Cards */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Recommended Products
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AffiliateCard
            title="Level 2 EV Home Charger"
            description="Charge your EV overnight at home with a fast Level 2 charger. Smart WiFi features included."
            priceRange="$250 - $600"
            amazonTag={AMAZON_TAG}
            searchQuery="level 2 ev home charger"
            imageAlt="Level 2 EV home charger on Amazon"
            slug="gas-vs-electric"
          />
          <AffiliateCard
            title="Smart Energy Monitor"
            description="Track your home electricity usage in real time to optimize your EV charging schedule and save money."
            priceRange="$30 - $80"
            amazonTag={AMAZON_TAG}
            searchQuery="home energy monitor electricity usage"
            imageAlt="Smart home energy monitor on Amazon"
            slug="gas-vs-electric"
          />
        </div>
      </div>
      <FAQSection questions={gasVsElectricFAQ} />
      <RelatedCalculators currentPath="/gas-vs-electric" />
    </CalculatorLayout>
  );
}
