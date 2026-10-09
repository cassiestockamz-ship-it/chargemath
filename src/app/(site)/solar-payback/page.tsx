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
} from "@/data/solar-data";

/* FAQ */
const solarPaybackFAQ = [
  {
    question: "How long does it take for solar to pay for itself?",
    answer:
      "For most homeowners, solar payback now takes 10 to 16 years depending on system size, installation cost, local electricity rates, and sunlight availability. States with high electricity rates (like California, Massachusetts, and New York) and good sun (like Arizona and Nevada) see the fastest paybacks. The federal residential solar tax credit (Section 25D) was repealed by the One Big Beautiful Bill Act in July 2025, so homeowner-owned systems installed in 2026 and beyond rely entirely on energy savings for their ROI.",
  },
  {
    question: "Does an EV really make solar pay off faster?",
    answer:
      "Yes, often significantly. An EV driven 35 miles per day consumes roughly 3,200 to 4,500 kWh per year. That is a large block of electricity that you can displace with solar instead of buying from the grid. Because your solar system is now offsetting more expensive grid electricity, the annual savings increase and the system pays for itself sooner. In many cases an EV shortens the solar payback period by 2 to 4 years.",
  },
  {
    question: "What is utility rate escalation?",
    answer:
      "Utility rate escalation is the annual percentage increase in your electricity rate. Historically, residential electricity prices in the US have risen about 3 to 4 percent per year. Because solar panels lock in free electricity production for 25 years, every year your grid rates rise, your solar savings increase. This compounding effect is one of the strongest financial arguments for solar, especially in states where rates are already high and rising fast.",
  },
  {
    question: "How much do solar panels degrade over time?",
    answer:
      "Modern solar panels degrade at roughly 0.5 percent per year, which is the industry standard and the default in this calculator. After 25 years, your panels will still produce about 87.5 percent of their original output. Higher quality panels from major brands often degrade at 0.25 to 0.4 percent per year. Most manufacturers warrant panels to retain at least 80 to 85 percent production at year 25.",
  },
  {
    question: "Is solar still worth it without the federal tax credit?",
    answer:
      "For most homeowners, yes, though the math is tighter. The federal residential solar tax credit (Section 25D) was repealed in July 2025, which extended payback periods by roughly 2 to 3 years on average for cash or loan purchases. Electricity rates continue to rise, and a solar system still produces free electricity for decades after payback. Leased systems and Power Purchase Agreements (PPAs) may still access the Section 48E commercial credit at 30% through 2027, which installers may pass through as lower monthly payments. Many states also offer their own rebates and property tax exemptions. Pairing solar with an EV helps offset the loss of the federal credit by increasing annual savings.",
  },
];

export default function SolarPaybackPage() {
  /* State */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [systemSizeKw, setSystemSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [escalationPct, setEscalationPct] = useState(3);
  const [degradationPct, setDegradationPct] = useState(0.5);

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
      size: String(systemSizeKw),
      cost: String(installCost),
      bill: String(monthlyBill),
      miles: String(dailyMiles),
      esc: String(escalationPct),
      deg: String(degradationPct),
    },
    useCallback(
      (p: Record<string, string>) => {
        if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
          setVehicleId(p.vehicle);
        if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
        if (p.size) setSystemSizeKw(Number(p.size));
        if (p.cost) setInstallCost(Number(p.cost));
        if (p.bill) setMonthlyBill(Number(p.bill));
        if (p.miles) setDailyMiles(Number(p.miles));
        if (p.esc) setEscalationPct(Number(p.esc));
        if (p.deg) setDegradationPct(Number(p.deg));
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
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  const solarProduction =
    SOLAR_DATA[stateCode]?.kwhPerKwYear ?? NATIONAL_AVG_SOLAR_PRODUCTION;

  /* Calculations */
  const results = useMemo(() => {
    const annualSolarKwhYear1 = systemSizeKw * solarProduction;
    const annualEvKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles * 365;
    const annualHomeKwh = (monthlyBill / electricityRate) * 12;

    interface YearRow {
      year: number;
      solarKwh: number;
      rate: number;
      savingsNoEv: number;
      savingsWithEv: number;
      cumulativeNoEv: number;
      cumulativeWithEv: number;
    }

    const projection: YearRow[] = [];
    let cumNoEv = 0;
    let cumWithEv = 0;
    let paybackWithoutEv = -1;
    let paybackWithEv = -1;

    for (let i = 0; i < 25; i++) {
      const year = i + 1;
      const solarKwh =
        annualSolarKwhYear1 * Math.pow(1 - degradationPct / 100, i);
      const rate = electricityRate * Math.pow(1 + escalationPct / 100, i);

      const savingsNoEv = Math.min(solarKwh, annualHomeKwh) * rate;
      const savingsWithEv =
        Math.min(solarKwh, annualHomeKwh + annualEvKwh) * rate;

      cumNoEv += savingsNoEv;
      cumWithEv += savingsWithEv;

      if (paybackWithoutEv < 0 && cumNoEv >= installCost) {
        const prevCum = cumNoEv - savingsNoEv;
        const fractionOfYear = (installCost - prevCum) / savingsNoEv;
        paybackWithoutEv = i + fractionOfYear;
      }

      if (paybackWithEv < 0 && cumWithEv >= installCost) {
        const prevCum = cumWithEv - savingsWithEv;
        const fractionOfYear = (installCost - prevCum) / savingsWithEv;
        paybackWithEv = i + fractionOfYear;
      }

      projection.push({
        year,
        solarKwh,
        rate,
        savingsNoEv,
        savingsWithEv,
        cumulativeNoEv: cumNoEv,
        cumulativeWithEv: cumWithEv,
      });
    }

    if (paybackWithoutEv < 0) paybackWithoutEv = Infinity;
    if (paybackWithEv < 0) paybackWithEv = Infinity;

    const savings25yrWithoutEv = cumNoEv - installCost;
    const savings25yrWithEv = cumWithEv - installCost;
    const extraSavingsWithEv = savings25yrWithEv - savings25yrWithoutEv;
    const yearsSaved =
      isFinite(paybackWithoutEv) && isFinite(paybackWithEv)
        ? paybackWithoutEv - paybackWithEv
        : 0;
    const annualEvChargingValue = annualEvKwh * electricityRate;

    // First-year annual savings with EV (approximate)
    const annualSavingsYear1 = projection[0]?.savingsWithEv ?? 0;

    // Recovered by year 10: cumulative year-10 savings (with EV) as share of 25-year total savings
    const cumWithEvYear10 = projection[9]?.cumulativeWithEv ?? 0;
    const recoveredByYr10Pct =
      cumWithEv > 0 ? (cumWithEvYear10 / cumWithEv) * 100 : 0;

    return {
      annualSolarKwhYear1,
      annualEvKwh,
      annualHomeKwh,
      paybackWithoutEv,
      paybackWithEv,
      savings25yrWithoutEv,
      savings25yrWithEv,
      extraSavingsWithEv,
      yearsSaved,
      annualEvChargingValue,
      annualSavingsYear1,
      recoveredByYr10Pct,
      projection,
    };
  }, [
    systemSizeKw,
    solarProduction,
    dailyMiles,
    vehicle,
    monthlyBill,
    electricityRate,
    installCost,
    escalationPct,
    degradationPct,
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
  const paybackYearsWithEv = isFinite(results.paybackWithEv)
    ? results.paybackWithEv
    : 25;
  const paybackDisplay = isFinite(results.paybackWithEv)
    ? results.paybackWithEv
    : 25;

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
        label="Solar system size"
        value={systemSizeKw}
        onChange={setSystemSizeKw}
        min={3}
        max={15}
        step={1}
        unit="kW"
        showValue
      />
      <details className="sm:col-span-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Solar installation cost"
            value={installCost}
            onChange={setInstallCost}
            min={5000}
            max={60000}
            step={500}
            unit="$"
            helpText="Total system cost. Section 25D residential credit repealed July 2025."
          />
          <NumberInput
            label="Monthly electric bill (without EV)"
            value={monthlyBill}
            onChange={setMonthlyBill}
            min={0}
            max={1000}
            step={10}
            unit="$"
            helpText="Your home bill before adding EV charging"
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
          <SliderInput
            label="Utility rate escalation"
            value={escalationPct}
            onChange={setEscalationPct}
            min={0}
            max={8}
            step={0.5}
            unit="%/yr"
            showValue
          />
          <SliderInput
            label="Panel degradation"
            value={degradationPct}
            onChange={setDegradationPct}
            min={0}
            max={2}
            step={0.1}
            unit="%/yr"
            showValue
          />
        </div>
      </details>
    </div>
  );

  const hero = (
    <SavingsVerdict
      eyebrow="Solar payback"
      headline="PAYS OFF IN"
      amount={paybackDisplay}
      amountPrefix=""
      amountDecimals={1}
      amountUnit=" years"
      sub={`A ${systemSizeKw} kW system in ${stateName} paired with ${dailyMiles} EV miles per day. With Section 25D repealed, this is pure energy-savings math, no federal tax credit.`}
      dialPercent={Math.min(100, Math.max(0, results.recoveredByYr10Pct))}
      dialLabel="RECOVERED BY YR 10"
    >
      <SavingsTile
        label="ANNUAL SAVINGS"
        value={Math.round(results.annualSavingsYear1)}
        prefix="$"
        unit="/yr"
        tier="good"
      />
      <SavingsTile
        label="25 YR SAVINGS"
        value={Math.round(results.savings25yrWithEv)}
        prefix="$"
        unit=" net"
        tier="volt"
      />
      <SavingsTile
        label="SYSTEM COST"
        value={Math.round(installCost)}
        prefix="$"
        unit=" total"
        tier="mid"
      />
      <SavingsTile
        label="PAYBACK"
        value={paybackYearsWithEv}
        decimals={1}
        unit=" yr"
        tier="brand"
      />
    </SavingsVerdict>
  );

  return (
    <>
      <CalculatorSchema
        name="Solar Payback Calculator: With vs Without an EV"
        description="Compare solar payback periods with and without EV ownership. Year-by-year projection with utility rate escalation and panel degradation. Post-Section-25D-repeal math."
        url="https://chargemath.com/solar-payback"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "Solar Payback Calculator",
            url: "https://chargemath.com/solar-payback",
          },
        ]}
      />
      <CalculatorShell
        eyebrow="Solar payback"
        title="Solar Payback Calculator"
        quickAnswer="With Section 25D repealed, most homeowner-owned solar systems now pay off in 10 to 16 years through pure energy savings."
        inputs={inputs}
        hero={hero}
      >
        <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-warn-soft)] p-4 text-sm text-[var(--color-ink-2)]">
          <strong className="text-[var(--color-ink)]">Heads up on federal credits.</strong>{" "}
          The One Big Beautiful Bill Act signed July 4, 2025 repealed the Section 25D
          residential solar tax credit. Homeowner-owned systems installed in 2026 and
          beyond get zero federal credit. Leased systems and Power Purchase Agreements
          may still claim the Section 48E commercial credit (30%) through 2027, and the
          installer may pass savings through your monthly payment. All math on this
          page assumes no federal credit.
        </div>

        <EducationalContent>
          <h2>Why EVs Accelerate Solar Payback</h2>
          <p>
            A solar panel system only generates savings by displacing electricity
            you would otherwise buy from the grid. Without an EV, your system
            offsets your home electricity bill, which is typically 800 to 1,200
            kWh per month for an average American household. With an EV, you add
            another 250 to 400 kWh per month of electricity demand that solar can
            offset instead of purchasing from the utility. That is a meaningful
            increase in annual savings that directly shortens the payback period.
          </p>
          <p>
            Consider a 7 kW system in California costing $20,000. Without an EV,
            it might generate $1,800 in annual savings, producing a 12-year
            payback (post-25D). With an EV driven 35 miles per day, savings jump
            to roughly $2,400 per year, cutting payback to about 9 years. Over 25
            years, the difference in cumulative profit can exceed $15,000.
          </p>
          <h3>The Rate Escalation Factor</h3>
          <p>
            Utility electricity rates have risen an average of 3 to 4 percent per
            year in the United States over the past two decades. Because your
            solar panels are locked in at zero fuel cost, every year the grid
            gets more expensive, your solar savings increase. This compounding
            effect is especially powerful when combined with EV ownership. In year
            one you might save $2,400. By year 10, with 3 percent escalation, the
            same solar production displaces electricity that would cost over $3,200
            annually.
          </p>
          <h3>Panel Degradation Is Minimal</h3>
          <p>
            Modern solar panels degrade at about 0.5 percent per year, which
            means after 25 years your system still produces 87.5 percent of its
            original output. This is almost negligible compared to the rate
            escalation benefit. The math strongly favors solar owners over time,
            especially those who maximize usage through EV charging.
          </p>
          <h3>What Replaced the Federal Credit</h3>
          <p>
            The Section 25D credit ended for homeowner-owned systems in 2026. If you
            want federal help on the cost, you need a lease or PPA, where the installer
            owns the panels and claims the Section 48E commercial credit (30% through
            2027) on their side. Many installers pass some of that savings through as
            lower monthly lease or PPA payments. Beyond federal, several states still
            offer rebates, property tax exemptions, or net metering programs. Check
            your state energy office for what applies.
          </p>
        </EducationalContent>

        <FAQSection questions={solarPaybackFAQ} />
        <EmailCapture source="solar-payback" />
        <RelatedCalculators currentPath="/solar-payback" />
      </CalculatorShell>
    </>
  );
}
