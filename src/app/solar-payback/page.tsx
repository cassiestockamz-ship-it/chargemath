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

void fmt;
void fmtPct;
void NATIONAL_AVG_COST_PER_WATT;

/* ── formatPaybackYears ── */
function formatPaybackYears(years: number): string {
  if (!isFinite(years) || years <= 0) return "N/A";
  if (years > 25) return ">25 yrs";
  if (years < 1) {
    const months = Math.ceil(years * 12);
    return `${months} month${months > 1 ? "s" : ""}`;
  }
  const wholeYears = Math.floor(years);
  const remainingMonths = Math.round((years - wholeYears) * 12);
  if (remainingMonths === 0)
    return `${wholeYears} year${wholeYears > 1 ? "s" : ""}`;
  return `${wholeYears} yr${wholeYears > 1 ? "s" : ""}, ${remainingMonths} mo`;
}

/* ── FAQ ── */
const solarPaybackFAQ = [
  {
    question: "How long does it take for solar to pay for itself?",
    answer:
      "For most homeowners, solar payback takes 8 to 14 years depending on system size, installation cost, local electricity rates, and sunlight availability. States with high electricity rates (like California, Massachusetts, and New York) and good sun (like Arizona and Nevada) see the fastest paybacks. Without the federal residential tax credit (eliminated in 2025), the payback math relies entirely on energy savings.",
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
      "Modern solar panels degrade at roughly 0.5 percent per year, which is the industry standard and the default in this calculator. After 25 years, your panels will still produce about 87.5 percent of their original output. Higher quality panels from major brands (LG, SunPower, Panasonic) often degrade at 0.25 to 0.4 percent per year. Budget panels may degrade at 0.7 to 1 percent per year. Most manufacturers warrant panels to retain at least 80 to 85 percent production at year 25.",
  },
  {
    question: "Is solar still worth it without the federal tax credit?",
    answer:
      "For most homeowners, yes. The federal residential solar tax credit (Section 25D) was eliminated in 2025, which extended payback periods by roughly 2 to 3 years on average. However, electricity rates continue to rise, and a solar system still produces free electricity for decades after payback. Many states also offer their own rebates, property tax exemptions, and net metering programs that improve the economics. If you pair solar with an EV, the increased annual savings help offset the loss of the federal credit.",
  },
];

export default function SolarPaybackPage() {
  /* ── State ── */
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [systemSizeKw, setSystemSizeKw] = useState(7);
  const [installCost, setInstallCost] = useState(20000);
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [dailyMiles, setDailyMiles] = useState(35);
  const [escalationPct, setEscalationPct] = useState(3);
  const [degradationPct, setDegradationPct] = useState(0.5);

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

  /* ── Derived ── */
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

  /* ── Calculations ── */
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
        // Interpolate the fraction of the year
        const prevCum = cumNoEv - savingsNoEv;
        const fractionOfYear = (installCost - prevCum) / savingsNoEv;
        paybackWithoutEv = (i) + fractionOfYear;
      }

      if (paybackWithEv < 0 && cumWithEv >= installCost) {
        const prevCum = cumWithEv - savingsWithEv;
        const fractionOfYear = (installCost - prevCum) / savingsWithEv;
        paybackWithEv = (i) + fractionOfYear;
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

  /* ── Payback bar widths ── */
  const maxBarYears = 25;
  const barWidthNoEv = isFinite(results.paybackWithoutEv)
    ? Math.min((results.paybackWithoutEv / maxBarYears) * 100, 100)
    : 100;
  const barWidthWithEv = isFinite(results.paybackWithEv)
    ? Math.min((results.paybackWithEv / maxBarYears) * 100, 100)
    : 100;

  /* ── Table snapshot years ── */
  const tableYears = [1, 5, 10, 15, 20, 25];
  const tableRows = results.projection.filter((r) =>
    tableYears.includes(r.year)
  );

  return (
    <CalculatorLayout
      title="Solar Payback Calculator: With vs Without an EV"
      description="Compare how long solar takes to pay for itself with and without EV ownership. See the year-by-year cumulative savings for both scenarios."
      intro="Adding an EV to a solar-powered home is one of the fastest ways to shorten your solar payback period. Instead of only offsetting your home electricity bill, the panels now displace thousands of dollars of EV charging each year. With utility rates rising 3 to 4 percent annually, every additional kWh of solar offset is worth more with each passing year. This calculator runs a full 25-year projection for both scenarios so you can see exactly how much faster solar pays for itself when you own an EV."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Solar Payback Calculator: With vs Without an EV"
        description="Compare solar payback periods with and without EV ownership. Year-by-year projection with utility rate escalation and panel degradation."
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
          helpText={`${solarProduction.toLocaleString()} kWh/kW/yr solar \u2022 ${SOLAR_DATA[stateCode]?.peakSunHours ?? 4.5} peak sun hrs/day \u2022 ${ELECTRICITY_RATES[stateCode]?.residential ?? NATIONAL_AVERAGE_RATE}\u00a2/kWh`}
        />

        <div className="sm:col-span-2">
          <SliderInput
            label="Solar System Size"
            value={systemSizeKw}
            onChange={setSystemSizeKw}
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
          helpText="Total system cost before incentives (no federal tax credit in 2026)"
        />

        <NumberInput
          label="Monthly Electric Bill (without EV)"
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

        <SliderInput
          label="Utility Rate Escalation"
          value={escalationPct}
          onChange={setEscalationPct}
          min={0}
          max={8}
          step={0.5}
          unit="%/yr"
          showValue
        />

        <SliderInput
          label="Panel Degradation"
          value={degradationPct}
          onChange={setDegradationPct}
          min={0}
          max={2}
          step={0.1}
          unit="%/yr"
          showValue
        />
      </div>

      {/* ── Results Row 1 ── */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Payback Comparison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Payback Without EV"
            value={formatPaybackYears(results.paybackWithoutEv)}
            unit=""
            icon="🏠"
          />
          <ResultCard
            label="Payback With EV"
            value={formatPaybackYears(results.paybackWithEv)}
            unit=""
            highlight
            icon="🚗"
          />
          <ResultCard
            label="Years Saved by EV"
            value={
              results.yearsSaved > 0
                ? `${results.yearsSaved.toFixed(1)} yr${results.yearsSaved !== 1 ? "s" : ""}`
                : "N/A"
            }
            unit=""
            highlight
            icon="⚡"
          />
          <ResultCard
            label="Extra Savings With EV"
            value={fmtShort.format(results.extraSavingsWithEv)}
            unit="over 25 yrs"
            icon="💰"
          />
        </div>

        {/* ── Payback Timeline Bars ── */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-5 text-sm font-semibold text-[var(--color-text)]">
            Payback Timeline (25-year horizon)
          </h3>

          {/* Without EV bar */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text-muted)]">
                Without EV
              </span>
              <span className="font-semibold text-[var(--color-text)]">
                {formatPaybackYears(results.paybackWithoutEv)}
              </span>
            </div>
            <div className="relative h-8 w-full overflow-hidden rounded-lg bg-[var(--color-border)]">
              <div
                className="flex h-full items-center rounded-lg bg-[var(--color-text-muted)] transition-all duration-500"
                style={{ width: `${barWidthNoEv}%` }}
              >
                {barWidthNoEv > 15 && (
                  <span className="ml-3 text-xs font-semibold text-white">
                    {formatPaybackYears(results.paybackWithoutEv)}
                  </span>
                )}
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
                25 yr
              </div>
            </div>
          </div>

          {/* With EV bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--color-text-muted)]">
                With EV
              </span>
              <span className="font-semibold text-[var(--color-primary)]">
                {formatPaybackYears(results.paybackWithEv)}
              </span>
            </div>
            <div className="relative h-8 w-full overflow-hidden rounded-lg bg-[var(--color-border)]">
              <div
                className="flex h-full items-center rounded-lg bg-[var(--color-primary)] transition-all duration-500"
                style={{ width: `${barWidthWithEv}%` }}
              >
                {barWidthWithEv > 15 && (
                  <span className="ml-3 text-xs font-semibold text-white">
                    {formatPaybackYears(results.paybackWithEv)}
                  </span>
                )}
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
                25 yr
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
            Shorter bar = faster payback. Both bars scaled to 25 years.
          </p>
        </div>

        {/* ── Results Row 2 ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="25-Year Savings (No EV)"
            value={fmtShort.format(results.savings25yrWithoutEv)}
            unit="net profit"
            icon="📋"
          />
          <ResultCard
            label="25-Year Savings (With EV)"
            value={fmtShort.format(results.savings25yrWithEv)}
            unit="net profit"
            icon="🏆"
          />
          <ResultCard
            label="Annual EV Charging Value"
            value={fmtShort.format(results.annualEvChargingValue)}
            unit="/year (yr 1)"
            icon="🔌"
          />
        </div>

        {/* ── Year-by-Year Table ── */}
        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)] text-left text-xs font-semibold text-[var(--color-text-muted)]">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Solar Output</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Savings (No EV)</th>
                <th className="px-4 py-3">Savings (With EV)</th>
                <th className="px-4 py-3">Cumulative (No EV)</th>
                <th className="px-4 py-3 text-[var(--color-primary)]">
                  Cumulative (With EV)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tableRows.map((row) => {
                const noEvPaidOff =
                  isFinite(results.paybackWithoutEv) &&
                  row.year >= Math.ceil(results.paybackWithoutEv);
                const withEvPaidOff =
                  isFinite(results.paybackWithEv) &&
                  row.year >= Math.ceil(results.paybackWithEv);
                return (
                  <tr
                    key={row.year}
                    className="bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-surface-alt)]"
                  >
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                      {row.year}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {Math.round(row.solarKwh).toLocaleString()} kWh
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {(row.rate * 100).toFixed(1)}&cent;
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {fmtShort.format(row.savingsNoEv)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-primary)]">
                      {fmtShort.format(row.savingsWithEv)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${noEvPaidOff ? "text-[var(--color-ev-green)]" : "text-[var(--color-text)]"}`}
                    >
                      {fmtShort.format(row.cumulativeNoEv)}
                      {noEvPaidOff && (
                        <span className="ml-1 text-xs font-normal text-[var(--color-ev-green)]">
                          paid off
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${withEvPaidOff ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}
                    >
                      {fmtShort.format(row.cumulativeWithEv)}
                      {withEvPaidOff && (
                        <span className="ml-1 text-xs font-normal text-[var(--color-primary)]">
                          paid off
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Showing years 1, 5, 10, 15, 20, 25. Rate escalation and panel
          degradation applied annually. No federal tax credit included.
        </p>
      </div>

      <ShareResults
        title={`Solar payback ${formatPaybackYears(results.paybackWithEv)} with EV vs ${formatPaybackYears(results.paybackWithoutEv)} without`}
        text={`My ${systemSizeKw} kW solar system pays off in ${formatPaybackYears(results.paybackWithEv)} with an EV, vs ${formatPaybackYears(results.paybackWithoutEv)} without. That is ${results.yearsSaved.toFixed(1)} years saved and ${fmtShort.format(results.extraSavingsWithEv)} in extra profit over 25 years.`}
      />

      {/* EcoFlow Product Recommendations */}
      <div className="mt-10">
        <h2 className="mb-5 text-lg font-bold text-[var(--color-text)]">
          Solar + Battery Solutions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EcoFlowCard product={ECOFLOW_PRODUCTS.deltaProUltraX} sid="solar-payback" />
          <EcoFlowCard product={ECOFLOW_PRODUCTS.solarPanel400W} sid="solar-payback" />
        </div>
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
          it might generate $1,800 in annual savings, producing an 11-year
          payback. With an EV driven 35 miles per day, savings jump to roughly
          $2,400 per year, cutting payback to about 8 years. Over 25 years, the
          difference in cumulative profit can exceed $15,000.
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
          annually. Over a 25-year system life, rate escalation can add tens of
          thousands of dollars to total lifetime savings.
        </p>
        <p>
          Historically, states like California, New York, and Massachusetts have
          seen rates rise faster than average (4 to 6 percent per year), while
          states with regulated utilities or heavy coal generation have seen
          slower increases. Use the escalation slider to model conservative (2
          percent) or aggressive (5 percent) scenarios.
        </p>
        <h3>Panel Degradation Is Minimal</h3>
        <p>
          Modern solar panels degrade at about 0.5 percent per year, which
          means after 25 years your system still produces 87.5 percent of its
          original output. This is almost negligible compared to the rate
          escalation benefit. Even in a pessimistic scenario with 1 percent
          annual degradation, year 25 production is 77.8 percent of year 1
          output while the grid rate has risen 109 percent (at 3 percent
          escalation). The math strongly favors solar owners over time,
          especially those who maximize usage through EV charging.
        </p>
      </EducationalContent>

      <FAQSection questions={solarPaybackFAQ} />
      <EmailCapture source="solar-payback" />
      <RelatedCalculators currentPath="/solar-payback" />
    </CalculatorLayout>
  );
}
