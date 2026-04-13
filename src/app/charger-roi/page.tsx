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
import Link from "next/link";
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import { chargerRoiFAQ } from "@/data/faq-data";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";

type PublicSplit = "100" | "75_25" | "50_50";

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

export default function ChargerROIPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [chargerCost, setChargerCost] = useState(500);
  const [installCost, setInstallCost] = useState(800);
  const [publicRate, setPublicRate] = useState(0.35);
  const [publicSplit, setPublicSplit] = useState<PublicSplit>("100");

  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  useUrlSync(
    { vehicle: vehicleId, state: stateCode, miles: dailyMiles, charger: chargerCost, install: installCost },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.miles) setDailyMiles(Number(p.miles));
      if (p.charger) setChargerCost(Number(p.charger));
      if (p.install) setInstallCost(Number(p.install));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const homeRate = useMemo(() => {
    if (customRate !== null && customRate > 0) return customRate / 100;
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [customRate, stateCode]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;

    const totalUpfront = chargerCost + installCost;
    const monthlyHomeCost = monthlyKwh * homeRate;

    // Monthly cost without a home charger (public + Level 1 mix)
    let monthlyWithoutHome: number;
    if (publicSplit === "100") {
      monthlyWithoutHome = monthlyKwh * publicRate;
    } else if (publicSplit === "75_25") {
      monthlyWithoutHome =
        0.75 * monthlyKwh * publicRate + 0.25 * monthlyKwh * homeRate;
    } else {
      monthlyWithoutHome =
        0.5 * monthlyKwh * publicRate + 0.5 * monthlyKwh * homeRate;
    }

    const monthlySavings = monthlyWithoutHome - monthlyHomeCost;
    const paybackMonths =
      monthlySavings > 0 ? totalUpfront / monthlySavings : Infinity;
    const fiveYearNet = monthlySavings * 60 - totalUpfront;

    // Time savings: Level 2 ~30 mi/hr vs Level 1 ~4 mi/hr
    const weeklyMiles = dailyMiles * 7;
    const weeklyHoursL1 = weeklyMiles / 4;
    const weeklyHoursL2 = weeklyMiles / 30;
    const weeklyTimeSaved = weeklyHoursL1 - weeklyHoursL2;

    return {
      monthlyKwh,
      totalUpfront,
      monthlyHomeCost,
      monthlyWithoutHome,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      paybackMonths,
      fiveYearNet,
      weeklyTimeSaved,
    };
  }, [
    dailyMiles,
    vehicle,
    homeRate,
    chargerCost,
    installCost,
    publicRate,
    publicSplit,
  ]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  const stateOptions = Object.entries(ELECTRICITY_RATES)
    .sort((a, b) => a[1].state.localeCompare(b[1].state))
    .map(([code, data]) => ({
      value: code,
      label: `${data.state} (${data.residential}¢/kWh)`,
    }));

  const publicSplitOptions: { value: PublicSplit; label: string }[] = [
    { value: "100", label: "100% public charging" },
    { value: "75_25", label: "75% public / 25% Level 1" },
    { value: "50_50", label: "50% public / 50% Level 1" },
  ];

  const formatPayback = (months: number): string => {
    if (!isFinite(months) || months <= 0) return "N/A";
    const roundedMonths = Math.ceil(months);
    if (roundedMonths < 12) return `${roundedMonths} months`;
    const years = Math.floor(roundedMonths / 12);
    const remaining = roundedMonths % 12;
    if (remaining === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""}, ${remaining} month${remaining > 1 ? "s" : ""}`;
  };

  // Break-even timeline calculations
  const paybackCapped = Math.min(results.paybackMonths, 60);
  const paybackPct = isFinite(results.paybackMonths)
    ? (paybackCapped / 60) * 100
    : 100;

  return (
    <CalculatorLayout
      title="Home EV Charger ROI Calculator"
      description="Find out how quickly a Level 2 home charger pays for itself compared to public charging or Level 1 charging."
      intro="A Level 2 home EV charger costs $500-2,000 installed but typically pays for itself in 12-24 months through savings versus public charging. Home electricity costs 12-16¢/kWh on average, while public DC fast chargers run 30-60¢/kWh, saving $50-150+ per month for daily drivers."
      lastUpdated="March 2026"
    >
      <CalculatorSchema name="Home EV Charger ROI Calculator" description="Calculate the payback period for installing a Level 2 home EV charger compared to public charging or Level 1 charging." url="https://chargemath.com/charger-roi" />
      <BreadcrumbSchema items={[{name: "Home", url: "https://chargemath.com"}, {name: "Home Charger ROI", url: "https://chargemath.com/charger-roi"}]} />
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

        <NumberInput
          label="Custom Electricity Rate (optional)"
          value={customRate ?? 0}
          onChange={(v) => setCustomRate(v > 0 ? v : null)}
          min={0}
          max={100}
          step={0.1}
          unit={"¢/kWh"}
          helpText="Leave at 0 to use your state's average rate"
        />

        <NumberInput
          label="Home Charger Cost"
          value={chargerCost}
          onChange={setChargerCost}
          min={0}
          max={5000}
          step={50}
          unit={"$"}
        />

        <NumberInput
          label="Installation Cost"
          value={installCost}
          onChange={setInstallCost}
          min={0}
          max={10000}
          step={50}
          unit={"$"}
          helpText="Includes electrician + panel upgrade if needed"
        />

        <NumberInput
          label="Public Charging Rate"
          value={publicRate}
          onChange={setPublicRate}
          min={0}
          max={2}
          step={0.01}
          unit={"$/kWh"}
          helpText="Average DC fast charging rate"
        />

        <SelectInput
          label="Without Home Charger, You'd Use..."
          value={publicSplit}
          onChange={(v) => setPublicSplit(v as PublicSplit)}
          options={publicSplitOptions}
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
          Your ROI Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard
            label="Payback Period"
            value={formatPayback(results.paybackMonths)}
            unit=""
            highlight
            icon="📅"
          />
          <ResultCard
            label="Monthly Savings"
            value={fmt.format(results.monthlySavings)}
            unit="/month"
            icon="💰"
          />
          <ResultCard
            label="Annual Savings"
            value={fmtShort.format(results.annualSavings)}
            unit="/year"
            icon="📈"
          />
          <ResultCard
            label="5-Year Net Savings"
            value={fmtShort.format(results.fiveYearNet)}
            unit="after equipment cost"
            highlight
            icon="🏆"
          />
          <ResultCard
            label="Weekly Time Saved vs Level 1"
            value={`${results.weeklyTimeSaved.toFixed(1)}`}
            unit="hours"
            icon="⏱️"
          />
          <ResultCard
            label="Total Investment"
            value={fmtShort.format(results.totalUpfront)}
            unit="upfront"
            icon="🔌"
          />
        </div>

        {/* Break-Even Timeline */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Break-Even Timeline
          </h3>
          <div className="relative">
            {/* Track */}
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              {/* Payback segment */}
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${paybackPct}%` }}
              />
            </div>

            {/* Labels */}
            <div className="mt-3 flex items-start justify-between text-xs">
              <div className="text-[var(--color-text-muted)]">
                <span className="block font-semibold">Today</span>
                <span>{fmtShort.format(results.totalUpfront)} invested</span>
              </div>

              {isFinite(results.paybackMonths) && results.paybackMonths <= 60 && (
                <div
                  className="absolute text-center"
                  style={{
                    left: `${paybackPct}%`,
                    transform: "translateX(-50%)",
                    top: "2.25rem",
                  }}
                >
                  <span className="block font-semibold text-[var(--color-ev-green)]">
                    Break Even
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    Month {Math.ceil(results.paybackMonths)}
                  </span>
                </div>
              )}

              <div className="text-right text-[var(--color-text-muted)]">
                <span className="block font-semibold">5 Years</span>
                <span className="font-semibold text-[var(--color-ev-green)]">
                  {fmtShort.format(results.fiveYearNet)} saved
                </span>
              </div>
            </div>
          </div>

          {!isFinite(results.paybackMonths) && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Home charging is not cheaper with current settings. Adjust your
              public charging rate or electricity rate.
            </p>
          )}

          {isFinite(results.paybackMonths) && results.paybackMonths > 60 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Payback period exceeds 5 years ({formatPayback(results.paybackMonths)}).
              Consider a lower-cost charger or higher public charging rate.
            </p>
          )}
        </div>
        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/charging-time" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Check your charging time →
          </Link>
          <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Calculate monthly charging cost →
          </Link>
          <Link href="/tax-credits" className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5">
            Get a charger installation credit →
          </Link>
        </div>
      </div>

      <ShareResults
        title={`Charger ROI: ${formatPayback(results.paybackMonths)} payback`}
        text={`A home charger pays for itself in ${formatPayback(results.paybackMonths)} with ${fmt.format(results.monthlySavings)}/month in savings vs public charging. ${fmtShort.format(results.totalUpfront)} upfront → ${fmtShort.format(results.fiveYearNet)} net savings over 5 years!`}
      />

      <EducationalContent>
        <h2>How the Charger ROI Calculation Works</h2>
        <p>
          The payback period divides your total upfront cost (charger + installation) by the monthly savings from charging at home versus your current mix of public and Level 1 charging. Home electricity rates come from EIA state averages. Public charging rates default to $0.35/kWh, which reflects the 2026 average across major networks like Electrify America and ChargePoint.
        </p>
        <h3>Installation Costs: What to Expect</h3>
        <p>
          The charger unit itself typically costs $300-600. Installation costs vary more: a simple NEMA 14-50 outlet install runs $200-500 if your panel is nearby and has capacity. Panel upgrades add $1,000-3,000. Running new wire from a distant panel adds $500-1,500. Get three quotes from licensed electricians. Prices vary significantly by region.
        </p>
        <h3>Factors That Improve Your ROI</h3>
        <ul>
          <li>High daily mileage: the more you drive, the faster a home charger pays off. Commuters driving 50+ miles/day typically break even in under a year.</li>
          <li>Time-of-use electricity plans: many utilities offer overnight rates 30-50% below standard rates, making home charging even cheaper.</li>
          <li>The federal 30C charger tax credit covers 30% of equipment and installation costs (up to $1,000), effectively reducing your payback period by nearly a third.</li>
          <li>Home chargers increase property value: a 2024 Zillow study found homes with EV chargers sold for 3.3% more on average.</li>
        </ul>
      </EducationalContent>
      <FAQSection questions={chargerRoiFAQ} />
      <EmailCapture source="charger-roi" />
      <RelatedCalculators currentPath="/charger-roi" />
    </CalculatorLayout>
  );
}
