"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsTile from "@/components/SavingsTile";
import SavingsMeter from "@/components/SavingsMeter";
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
import { SOLAR_DATA, NATIONAL_AVG_SOLAR_PRODUCTION } from "@/data/solar-data";

/* FAQ data (inline) */
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
  /* State */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [solarSizeKw, setSolarSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [taxCreditEnabled, setTaxCreditEnabled] = useState(false);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [monthlyBill, setMonthlyBill] = useState(150);

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

  /* Derived */
  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const electricityRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100; // $/kWh
  }, [stateCode]);

  const solarProductionPerKw = SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;

  /* Calculations */
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

    // Miles powered per day by solar (for hero amount)
    const solarKwhPerDay = annualSolarKwh / 365;
    const milesPerKwh =
      vehicle.kwhPer100Miles > 0 ? 100 / vehicle.kwhPer100Miles : 0;
    const milesPoweredPerDay = solarKwhPerDay * milesPerKwh;

    // Annual grid vs solar totals for the savings meter
    const gridAnnual = totalAnnualKwh * electricityRate;
    const solarAnnualCost = Math.max(
      0,
      gridAnnual - annualElectricitySavings
    );

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
      milesPoweredPerDay,
      gridAnnual,
      solarAnnualCost,
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

  const stateName = ELECTRICITY_RATES[stateCode]?.state ?? stateCode;
  const solarCoveragePct = Math.round(results.solarCoversEvPct * 100);
  const annualSavingsRounded = Math.round(results.annualElectricitySavings);
  const paybackYears = isFinite(results.paybackYears) ? results.paybackYears : 0;
  const totalSavings25yrRounded = Math.round(results.totalSavings25yr);

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
          <SliderInput
            label="Solar system size"
            value={solarSizeKw}
            onChange={setSolarSizeKw}
            min={3}
            max={15}
            step={1}
            unit="kW"
            showValue
          />
          <NumberInput
            label="Install cost"
            value={installCost}
            onChange={setInstallCost}
            min={5000}
            max={60000}
            step={500}
            unit="$"
            helpText="Total system cost before credits"
          />
          <NumberInput
            label="Current monthly electric bill"
            value={monthlyBill}
            onChange={setMonthlyBill}
            min={0}
            max={1000}
            step={10}
            unit="$"
            helpText="Home bill before adding EV charging"
          />
          <div className="flex items-center gap-3">
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
              Apply 30% tax credit (lease or PPA via Section 48E through 2027)
            </label>
          </div>
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Solar + EV"
      headline="SOLAR POWERS"
      amount={Math.round(results.milesPoweredPerDay)}
      amountUnit=" miles/day"
      sub={`From a ${solarSizeKw} kW array in ${stateName}. That is about $${annualSavingsRounded.toLocaleString()} saved versus grid charging each year.`}
      dialPercent={Math.min(100, Math.max(0, solarCoveragePct))}
      dialLabel="COVERED"
      morphHero={false}
    >
      <SavingsTile
        label="ANNUAL SAVINGS VS GRID"
        value={annualSavingsRounded}
        prefix="$"
        unit="/yr"
        tier="good"
      />
      <SavingsTile
        label="SOLAR COVERAGE"
        value={solarCoveragePct}
        unit="% of driving"
        tier="brand"
      />
      <SavingsTile
        label="PAYBACK"
        value={paybackYears}
        decimals={1}
        unit=" yr"
        tier="mid"
      />
      <SavingsTile
        label="25 YR SAVINGS"
        value={totalSavings25yrRounded}
        prefix="$"
        unit=" total"
        tier="volt"
      />
    </SavingsVerdict>
  );

  return (
    <>
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
      <CalculatorShell
        eyebrow="Solar + EV"
        title="Solar Charging Your EV"
        quickAnswer="A 4 to 6 kW solar array typically covers a daily driver EV in most of the country."
        inputs={inputs}
        hero={hero}
      >
        {/* Live savings meter: grid vs solar annual cost */}
        <div className="mb-8">
          <SavingsMeter
            leftLabel="GRID"
            leftValue={Math.round(results.gridAnnual)}
            rightLabel="SOLAR"
            rightValue={Math.round(results.solarAnnualCost)}
          />
        </div>

        {/* Cross-link chips */}
        <div className="mt-2 mb-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/solar-payback"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Solar payback calculator
          </Link>
          <Link
            href="/solar-battery-ev"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Add a home battery
          </Link>
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Grid charging cost
          </Link>
        </div>

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
      </CalculatorShell>
    </>
  );
}
