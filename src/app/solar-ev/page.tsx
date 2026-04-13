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
import { getDefaultStateCode } from "@/lib/useDefaultState";
import { useUrlSync } from "@/lib/useUrlState";
import {
  ELECTRICITY_RATES,
  NATIONAL_AVERAGE_RATE,
} from "@/data/electricity-rates";
import { EV_VEHICLES } from "@/data/ev-vehicles";
import { SOLAR_DATA, NATIONAL_AVG_SOLAR_PRODUCTION } from "@/data/solar-data";

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

/* ── FAQ data (inline) ── */
const solarEvFAQ = [
  {
    question: "Can solar panels fully cover my EV charging?",
    answer:
      "In most cases, yes. A typical 7 kW solar system produces 9,100-11,200 kWh per year, while the average EV driven 35 miles per day needs roughly 3,200 kWh annually. The surplus offsets your home electricity bill too. In cloudier states you may need a larger system or will cover a smaller share.",
  },
  {
    question: "What happened to the federal solar tax credit?",
    answer:
      "The residential solar Investment Tax Credit (Section 25D) was eliminated by the One Big Beautiful Bill Act, signed July 4, 2025. Homeowner-owned systems installed in 2026 and beyond no longer qualify for a federal tax credit. However, if you lease solar panels or use a Power Purchase Agreement (PPA), the installer may still claim the Section 48E commercial credit (30%) through 2027 and pass some savings to you. Many states also offer their own solar incentives, rebates, or property tax exemptions.",
  },
  {
    question: "Do I need a battery to charge my EV with solar?",
    answer:
      "Not necessarily. Most homeowners use net metering, where excess solar energy is sent to the grid during the day and you draw grid power at night to charge your EV. You get credited for the exported energy, effectively using the grid as a free battery. A home battery like the Tesla Powerwall is optional but helps if your utility has time-of-use rates or poor net metering policies.",
  },
  {
    question: "How long do solar panels last?",
    answer:
      "Modern solar panels are warrantied for 25 years and typically keep producing at 80-85% of their original capacity at that point. Many systems continue generating useful power for 30-35 years. This calculator uses a 25-year lifetime, which is the industry standard for ROI projections.",
  },
  {
    question: "Does adding an EV increase my solar payback period?",
    answer:
      "It actually shortens it. Without an EV, a solar system only offsets your home electricity bill. When you add an EV, you are displacing additional electricity that you would otherwise buy from the grid, so your total savings per year increase and the system pays for itself faster.",
  },
];

export default function SolarEVPage() {
  /* ── State ── */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [solarSizeKw, setSolarSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [taxCreditEnabled, setTaxCreditEnabled] = useState(false);
  const [dailyMiles, setDailyMiles] = useState(35);
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
      solar: String(solarSizeKw),
      cost: String(installCost),
      credit: taxCreditEnabled ? "1" : "0",
      miles: String(dailyMiles),
      bill: String(monthlyBill),
    },
    useCallback(
      (p: Record<string, string>) => {
        if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
          setVehicleId(p.vehicle);
        if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
        if (p.solar) setSolarSizeKw(Number(p.solar));
        if (p.cost) setInstallCost(Number(p.cost));
        if (p.credit) setTaxCreditEnabled(p.credit === "1");
        if (p.miles) setDailyMiles(Number(p.miles));
        if (p.bill) setMonthlyBill(Number(p.bill));
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

  const solarProductionPerKw = SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;

  /* ── Calculations ── */
  const results = useMemo(() => {
    // Solar production
    const annualSolarKwh = solarSizeKw * solarProductionPerKw;

    // EV charging need
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const annualEvKwh = dailyKwh * 365;

    // Home electricity usage (estimated from bill)
    const annualHomeKwh = (monthlyBill / electricityRate) * 12; // approximate

    // Total household electricity need
    const totalAnnualKwh = annualHomeKwh + annualEvKwh;

    // Solar coverage of EV charging specifically
    const solarCoversEvPct = Math.min(annualSolarKwh / annualEvKwh, 1);

    // Solar coverage of total household (home + EV)
    const solarCoversTotalPct = Math.min(annualSolarKwh / totalAnnualKwh, 1);

    // Annual savings: the portion of total electricity offset by solar
    const annualElectricitySavings =
      Math.min(annualSolarKwh, totalAnnualKwh) * electricityRate;

    // Net solar cost after tax credit
    const taxCredit = taxCreditEnabled ? installCost * 0.3 : 0;
    const netSolarCost = installCost - taxCredit;

    // Payback
    const paybackYears =
      annualElectricitySavings > 0
        ? netSolarCost / annualElectricitySavings
        : Infinity;

    // Monthly comparison
    const monthlyWithoutSolar =
      monthlyBill + annualEvKwh * electricityRate / 12;
    const monthlySolarSavings = annualElectricitySavings / 12;
    const monthlyWithSolar = monthlyWithoutSolar - monthlySolarSavings;

    // 25-year total savings (solar panel lifetime)
    const totalSavings25yr = annualElectricitySavings * 25 - netSolarCost;

    return {
      annualSolarKwh,
      annualEvKwh,
      annualHomeKwh,
      solarCoversEvPct,
      solarCoversTotalPct,
      annualElectricitySavings,
      netSolarCost,
      taxCredit,
      paybackYears,
      monthlyWithoutSolar,
      monthlyWithSolar,
      monthlySolarSavings,
      totalSavings25yr,
    };
  }, [
    solarSizeKw,
    solarProductionPerKw,
    dailyMiles,
    vehicle,
    monthlyBill,
    electricityRate,
    taxCreditEnabled,
    installCost,
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

  /* ── Solar coverage bar ── */
  const coveragePct = Math.min(results.solarCoversEvPct * 100, 100);

  return (
    <CalculatorLayout
      title="Solar + EV Calculator"
      description="Estimate how solar panels can offset your EV charging costs and home electricity bill."
      intro="Pairing solar panels with an EV is one of the best financial moves for EV owners. A typical 7 kW system produces enough energy to cover all EV charging for an average driver and still offset a large portion of your home electricity. Even without the federal residential tax credit (eliminated in 2025), most solar systems pay for themselves in 8-12 years and then generate free electricity for another 13-17 years."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Solar + EV Calculator"
        description="Calculate how solar panels offset EV charging costs. See solar coverage, payback period, monthly savings, and 25-year total savings."
        url="https://chargemath.com/solar-ev"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          { name: "Solar + EV Calculator", url: "https://chargemath.com/solar-ev" },
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
          helpText={`${solarProductionPerKw.toLocaleString()} kWh/kW/yr solar \u2022 ${SOLAR_DATA[stateCode]?.peakSunHours ?? 4.5} peak sun hrs/day \u2022 ${ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE}\u00a2/kWh`}
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Solar System Size"
            value={solarSizeKw}
            onChange={setSolarSizeKw}
            min={3}
            max={15}
            step={1}
            unit="kW"
            showValue
          />
        </div>

        <NumberInput
          label="Solar Installation Cost"
          value={installCost}
          onChange={setInstallCost}
          min={5000}
          max={60000}
          step={500}
          unit="$"
          helpText="Total system cost before tax credits"
        />

        <NumberInput
          label="Current Monthly Electric Bill (without EV)"
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

        {/* Tax credit checkbox */}
        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            id="tax-credit-toggle"
            checked={taxCreditEnabled}
            onChange={(e) => setTaxCreditEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] accent-[var(--color-primary)]"
          />
          <label
            htmlFor="tax-credit-toggle"
            className="text-sm font-medium text-[var(--color-text)]"
          >
            Apply 30% Tax Credit (lease/PPA via Section 48E, through 2027)
            {taxCreditEnabled && (
              <span className="ml-2 text-[var(--color-ev-green)]">
                Saving {fmtShort.format(results.taxCredit)}
              </span>
            )}
          </label>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Your Solar + EV Savings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Solar Covers EV Charging"
            value={fmtPct.format(results.solarCoversEvPct)}
            unit=""
            highlight
            icon="☀️"
          />
          <ResultCard
            label="Payback Period"
            value={formatPaybackYears(results.paybackYears)}
            unit=""
            icon="📅"
          />
          <ResultCard
            label="Monthly Savings"
            value={fmt.format(results.monthlySolarSavings)}
            unit="/month"
            icon="💰"
          />
          <ResultCard
            label="25-Year Total Savings"
            value={fmtShort.format(results.totalSavings25yr)}
            unit="net profit"
            highlight
            icon="🏆"
          />
        </div>

        {/* ── Solar Coverage Visualization ── */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Solar Coverage of EV Charging
          </h3>
          <div className="relative">
            <div className="h-6 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <div className="mt-3 flex items-start justify-between text-xs">
              <div className="text-[var(--color-text-muted)]">
                <span className="block font-semibold">EV Needs</span>
                <span>
                  {Math.round(results.annualEvKwh).toLocaleString()} kWh/yr
                </span>
              </div>
              <div className="text-right text-[var(--color-text-muted)]">
                <span className="block font-semibold">Solar Produces</span>
                <span className="font-semibold text-[var(--color-ev-green)]">
                  {Math.round(results.annualSolarKwh).toLocaleString()} kWh/yr
                </span>
              </div>
            </div>
          </div>

          {results.solarCoversEvPct >= 1 && (
            <p className="mt-4 text-center text-sm text-[var(--color-ev-green)]">
              Your solar system produces more than enough to cover all EV
              charging. The surplus ({fmtShort.format((results.annualSolarKwh - results.annualEvKwh) * electricityRate)}/yr value) offsets your home electric bill.
            </p>
          )}

          {results.solarCoversEvPct < 1 && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Your solar covers {Math.round(results.solarCoversEvPct * 100)}% of
              EV charging. Consider a larger system to cover the remaining{" "}
              {Math.round(results.annualEvKwh - results.annualSolarKwh).toLocaleString()}{" "}
              kWh/yr.
            </p>
          )}
        </div>

        {/* ── Monthly Comparison ── */}
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Monthly Cost Comparison
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                Without solar (home + EV)
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {fmt.format(results.monthlyWithoutSolar)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">
                With solar (home + EV)
              </span>
              <span className="font-semibold text-[var(--color-ev-green)]">
                {fmt.format(Math.max(results.monthlyWithSolar, 0))}/mo
              </span>
            </div>
            <hr className="border-[var(--color-border)]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                You save
              </span>
              <span className="font-bold text-[var(--color-ev-green)]">
                {fmt.format(results.monthlySolarSavings)}/mo
              </span>
            </div>
          </div>
        </div>

        {/* ── Key Numbers ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Annual Electricity Savings"
            value={fmtShort.format(results.annualElectricitySavings)}
            unit="/year"
            icon="⚡"
          />
          <ResultCard
            label="Net Solar Cost"
            value={fmtShort.format(results.netSolarCost)}
            unit={taxCreditEnabled ? "after 30% ITC" : "no tax credit"}
            icon="🔧"
          />
          <ResultCard
            label="Solar Covers Total Home"
            value={fmtPct.format(results.solarCoversTotalPct)}
            unit="of all electricity"
            icon="🏠"
          />
        </div>
      </div>

      <ShareResults
        title={`Solar + EV: ${formatPaybackYears(results.paybackYears)} payback`}
        text={`My ${solarSizeKw} kW solar system covers ${Math.round(results.solarCoversEvPct * 100)}% of EV charging and saves ${fmt.format(results.monthlySolarSavings)}/month. ${fmtShort.format(results.totalSavings25yr)} in total savings over 25 years!`}
      />

      <EducationalContent>
        <h2>How the Solar + EV Calculation Works</h2>
        <p>
          This calculator estimates annual solar energy production based on your
          system size and state. Sunny states like Arizona and Nevada produce
          roughly 1,600 kWh per installed kW per year, while cloudier states
          like Washington and Michigan produce around 1,000 kWh/kW/yr. Most
          states fall in the middle at about 1,300 kWh/kW/yr. Your EV&apos;s
          energy consumption is calculated from its EPA-rated efficiency and your
          daily driving distance.
        </p>
        <h3>Why Solar and EVs Are Better Together</h3>
        <p>
          Solar panels alone offset your home electricity bill, which provides
          moderate savings. Adding an EV dramatically increases your electricity
          consumption, which means more of your solar production displaces
          expensive grid power. This synergy makes both investments pay off
          faster. A homeowner who installs solar before buying an EV may see a
          10-year payback. That same homeowner with an EV could see a 7-year
          payback because the savings per year are higher.
        </p>
        <h3>Net Metering Makes It Work</h3>
        <p>
          Most EV owners charge overnight, but solar panels produce during the
          day. Net metering bridges this gap: your solar system exports excess
          power to the grid during the day, and you receive credits that offset
          the electricity you draw at night for EV charging. The grid acts as a
          free battery. However, net metering policies vary by state and
          utility. Some states offer full retail credit, while others offer
          reduced rates. Check with your utility for specific terms.
        </p>
        <h3>Solar Tax Credits in 2026</h3>
        <p>
          The residential solar tax credit (Section 25D) was eliminated by the
          One Big Beautiful Bill Act signed in July 2025. If you buy and own
          your solar system outright, there is no longer a federal tax credit
          available. However, third-party-owned systems (leases and Power
          Purchase Agreements) may still benefit from the Section 48E commercial
          credit at 30% through the end of 2027. Many states also offer their
          own incentives, including rebates, property tax exemptions, and
          renewable energy credits. Check your state&apos;s energy office for
          current programs.
        </p>
      </EducationalContent>

      <FAQSection questions={solarEvFAQ} />
      <EmailCapture source="solar-ev" />
      <RelatedCalculators currentPath="/solar-ev" />
    </CalculatorLayout>
  );
}
