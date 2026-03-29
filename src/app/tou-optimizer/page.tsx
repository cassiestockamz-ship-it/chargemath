"use client";

import { useState, useMemo, useCallback } from "react";
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
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtAnnual = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: formatHour(i),
}));

const touFAQ = [
  {
    question: "What is a Time-of-Use (TOU) electricity plan?",
    answer:
      "A TOU plan charges different rates depending on the time of day. Peak hours (typically afternoon and early evening) have the highest rates, while off-peak and super-off-peak hours (overnight and early morning) offer significantly lower rates. Utilities use these plans to encourage shifting electricity usage away from high-demand periods.",
  },
  {
    question: "When is the cheapest time to charge an EV?",
    answer:
      "On most TOU plans, the cheapest time to charge is during super-off-peak hours, which typically fall between 11 PM and 6 AM. Some utilities also offer lower mid-day rates when solar generation is high. Check your specific utility plan for exact windows. Most smart chargers and EVs can be programmed to start charging automatically at the cheapest time.",
  },
  {
    question: "How much can I save by charging during off-peak hours?",
    answer:
      "Savings vary by utility, but most EV owners save 40-60% on charging costs by switching from peak to off-peak hours. In states like California, the difference between peak and off-peak rates can be 20-30 cents per kWh, which adds up to $500-$1,500 per year depending on how much you drive.",
  },
  {
    question: "Do I need a special charger to use TOU rates?",
    answer:
      "You do not need a special charger, but a smart charger or your EV's built-in charge scheduling makes it much easier. Most modern EVs (Tesla, Ford, Chevy, etc.) let you set a charging schedule directly in the car. Smart Level 2 chargers like the ChargePoint Home Flex or Emporia also support scheduling through their apps.",
  },
  {
    question: "Is a TOU plan worth it if I work from home?",
    answer:
      "It depends on your overall electricity usage patterns. If you can shift laundry, dishwashing, and EV charging to off-peak hours, a TOU plan can still save money even if you use more power during the day. Run the numbers with your utility's rate comparison tool. For most EV owners, the charging savings alone make TOU plans worthwhile.",
  },
];

export default function TOUOptimizerPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [peakRate, setPeakRate] = useState(35);
  const [offPeakRate, setOffPeakRate] = useState(12);
  const [superOffPeakRate, setSuperOffPeakRate] = useState(8);
  const [peakStart, setPeakStart] = useState("16");
  const [peakEnd, setPeakEnd] = useState("21");
  const [dailyMiles, setDailyMiles] = useState(35);

  useUrlSync(
    {
      vehicle: vehicleId,
      peak: peakRate,
      offpeak: offPeakRate,
      superoff: superOffPeakRate,
      pstart: peakStart,
      pend: peakEnd,
      miles: dailyMiles,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle))
        setVehicleId(p.vehicle);
      if (p.peak) setPeakRate(Number(p.peak));
      if (p.offpeak) setOffPeakRate(Number(p.offpeak));
      if (p.superoff) setSuperOffPeakRate(Number(p.superoff));
      if (p.pstart) setPeakStart(p.pstart);
      if (p.pend) setPeakEnd(p.pend);
      if (p.miles) setDailyMiles(Number(p.miles));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;

    // Cost per full charge at each tier (cents to dollars)
    const fullChargeKwh = vehicle.batteryCapacityKwh;
    const costFullPeak = (fullChargeKwh * peakRate) / 100;
    const costFullOffPeak = (fullChargeKwh * offPeakRate) / 100;
    const costFullSuperOff = (fullChargeKwh * superOffPeakRate) / 100;

    // Monthly cost at each tier
    const monthlyPeak = (monthlyKwh * peakRate) / 100;
    const monthlyOffPeak = (monthlyKwh * offPeakRate) / 100;
    const monthlySuperOff = (monthlyKwh * superOffPeakRate) / 100;

    // Annual savings vs peak
    const annualSavingsOffPeak = (monthlyPeak - monthlyOffPeak) * 12;
    const annualSavingsSuperOff = (monthlyPeak - monthlySuperOff) * 12;

    // Percentage savings
    const pctSavingsOffPeak =
      monthlyPeak > 0
        ? ((monthlyPeak - monthlyOffPeak) / monthlyPeak) * 100
        : 0;
    const pctSavingsSuperOff =
      monthlyPeak > 0
        ? ((monthlyPeak - monthlySuperOff) / monthlyPeak) * 100
        : 0;

    return {
      dailyKwh,
      monthlyKwh,
      costFullPeak,
      costFullOffPeak,
      costFullSuperOff,
      monthlyPeak,
      monthlyOffPeak,
      monthlySuperOff,
      annualSavingsOffPeak,
      annualSavingsSuperOff,
      pctSavingsOffPeak,
      pctSavingsSuperOff,
    };
  }, [vehicle, peakRate, offPeakRate, superOffPeakRate, dailyMiles]);

  const vehicleOptions = EV_VEHICLES.map((v) => ({
    value: v.id,
    label: `${v.year} ${v.make} ${v.model}`,
  }));

  // Build the 24-hour schedule visual
  const peakStartNum = Number(peakStart);
  const peakEndNum = Number(peakEnd);

  function getHourTier(hour: number): "peak" | "off-peak" | "super-off-peak" {
    // Peak: peakStart to peakEnd
    const inPeak =
      peakStartNum <= peakEndNum
        ? hour >= peakStartNum && hour < peakEndNum
        : hour >= peakStartNum || hour < peakEndNum;
    if (inPeak) return "peak";

    // Super-off-peak: 11 PM to 6 AM (23-6)
    if (hour >= 23 || hour < 6) return "super-off-peak";

    return "off-peak";
  }

  const tierColors = {
    peak: "bg-red-500/80",
    "off-peak": "bg-blue-500/80",
    "super-off-peak": "bg-emerald-500/80",
  };

  const tierLabels = {
    peak: "Peak",
    "off-peak": "Off-Peak",
    "super-off-peak": "Super Off-Peak",
  };

  return (
    <CalculatorLayout
      title="Time-of-Use Optimizer Calculator"
      description="Find the cheapest time to charge your EV on a Time-of-Use electricity plan. Compare peak, off-peak, and super-off-peak costs side by side."
      intro="Time-of-Use (TOU) electricity plans charge different rates depending on when you use power. By charging your EV during off-peak or super-off-peak hours, you can cut charging costs by 50-75%. Most utilities define peak hours as 4-9 PM, with the cheapest rates available overnight."
      lastUpdated="March 2026"
    >
      <CalculatorSchema
        name="Time-of-Use Optimizer Calculator"
        description="Find the cheapest time to charge your EV on a Time-of-Use electricity plan. Compare peak, off-peak, and super-off-peak charging costs."
        url="https://chargemath.com/tou-optimizer"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chargemath.com" },
          {
            name: "TOU Optimizer Calculator",
            url: "https://chargemath.com/tou-optimizer",
          },
        ]}
      />

      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SelectInput
          label="Select Your EV"
          value={vehicleId}
          onChange={setVehicleId}
          options={vehicleOptions}
          helpText={`${vehicle.batteryCapacityKwh} kWh battery, ${vehicle.kwhPer100Miles} kWh/100mi`}
        />

        <NumberInput
          label="Peak Rate"
          value={peakRate}
          onChange={setPeakRate}
          min={5}
          max={80}
          step={1}
          unit="\u00A2/kWh"
          helpText="Your utility's peak electricity rate"
        />

        <NumberInput
          label="Off-Peak Rate"
          value={offPeakRate}
          onChange={setOffPeakRate}
          min={2}
          max={50}
          step={1}
          unit="\u00A2/kWh"
          helpText="Typically evenings and mornings"
        />

        <NumberInput
          label="Super Off-Peak Rate"
          value={superOffPeakRate}
          onChange={setSuperOffPeakRate}
          min={1}
          max={40}
          step={1}
          unit="\u00A2/kWh"
          helpText="Cheapest overnight rate (if your plan has one)"
        />

        <SelectInput
          label="Peak Hours Start"
          value={peakStart}
          onChange={setPeakStart}
          options={hourOptions}
          helpText="When peak pricing begins"
        />

        <SelectInput
          label="Peak Hours End"
          value={peakEnd}
          onChange={setPeakEnd}
          options={hourOptions}
          helpText="When peak pricing ends"
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
          Charging Cost Comparison
        </h2>

        {/* Three scenario cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <ResultCard
            label="Peak Charging"
            value={fmt.format(results.monthlyPeak)}
            unit="/month"
            icon="🔴"
          />
          <ResultCard
            label="Off-Peak Charging"
            value={fmt.format(results.monthlyOffPeak)}
            unit="/month"
            icon="🔵"
          />
          <ResultCard
            label="Super Off-Peak Charging"
            value={fmt.format(results.monthlySuperOff)}
            unit="/month"
            highlight
            icon="🟢"
          />
        </div>

        {/* Savings cards */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ResultCard
            label="Annual Savings (Off-Peak)"
            value={fmtAnnual.format(results.annualSavingsOffPeak)}
            unit="/year"
            icon="💰"
          />
          <ResultCard
            label="Annual Savings (Super Off-Peak)"
            value={fmtAnnual.format(results.annualSavingsSuperOff)}
            unit="/year"
            highlight
            icon="🌙"
          />
          <ResultCard
            label="Full Charge (Peak)"
            value={fmt.format(results.costFullPeak)}
            unit={`${vehicle.batteryCapacityKwh} kWh`}
            icon="🔋"
          />
          <ResultCard
            label="Full Charge (Super Off-Peak)"
            value={fmt.format(results.costFullSuperOff)}
            unit={`${vehicle.batteryCapacityKwh} kWh`}
            icon="🔋"
          />
        </div>

        {/* 24-Hour Schedule Visual */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            24-Hour Rate Schedule
          </h3>

          <div className="flex gap-0.5 overflow-hidden rounded-lg">
            {Array.from({ length: 24 }, (_, hour) => {
              const tier = getHourTier(hour);
              return (
                <div
                  key={hour}
                  className={`flex-1 ${tierColors[tier]} relative transition-all duration-300`}
                  style={{ minWidth: 0, height: 48 }}
                  title={`${formatHour(hour)}: ${tierLabels[tier]} (${
                    tier === "peak"
                      ? peakRate
                      : tier === "off-peak"
                        ? offPeakRate
                        : superOffPeakRate
                  }\u00A2/kWh)`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/90 sm:text-xs">
                    {hour % 3 === 0 ? formatHour(hour).replace(" ", "\n") : ""}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              Peak ({peakRate}\u00A2/kWh)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500/80" />
              Off-Peak ({offPeakRate}\u00A2/kWh)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              Super Off-Peak ({superOffPeakRate}\u00A2/kWh)
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Optimal Charging Window
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Charge between{" "}
              <span className="font-semibold text-[var(--color-text)]">
                11 PM and 6 AM
              </span>{" "}
              (super off-peak) to pay just{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {superOffPeakRate}\u00A2/kWh
              </span>{" "}
              instead of{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {peakRate}\u00A2/kWh
              </span>
              . That saves you{" "}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {results.pctSavingsSuperOff.toFixed(0)}%
              </span>{" "}
              on every charge, or{" "}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {fmtAnnual.format(results.annualSavingsSuperOff)}/year
              </span>
              . Set your EV or smart charger to start at 11 PM automatically.
            </p>
          </div>
        </div>

        {/* Cost breakdown table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">
                  Rate Tier
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Rate
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Full Charge
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Monthly
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text)]">
                  Annual
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  Peak
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                  {peakRate}\u00A2/kWh
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmt.format(results.costFullPeak)}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmt.format(results.monthlyPeak)}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmtAnnual.format(results.monthlyPeak * 12)}
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-500/80" />
                  Off-Peak
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                  {offPeakRate}\u00A2/kWh
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmt.format(results.costFullOffPeak)}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmt.format(results.monthlyOffPeak)}
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text)]">
                  {fmtAnnual.format(results.monthlyOffPeak * 12)}
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)] bg-emerald-500/5">
                <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-400">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  Super Off-Peak
                </td>
                <td className="px-4 py-3 text-right text-[var(--color-text-muted)]">
                  {superOffPeakRate}\u00A2/kWh
                </td>
                <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                  {fmt.format(results.costFullSuperOff)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                  {fmt.format(results.monthlySuperOff)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                  {fmtAnnual.format(results.monthlySuperOff * 12)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Contextual Cross-Links */}
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href="/bill-impact"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Calculate full bill impact &rarr;
          </Link>
          <Link
            href="/ev-charging-cost"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Detailed charging cost breakdown &rarr;
          </Link>
          <Link
            href="/charger-roi"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            Is a home charger worth it? &rarr;
          </Link>
        </div>

        <ShareResults
          title={`TOU Savings: ${fmtAnnual.format(results.annualSavingsSuperOff)}/year`}
          text={`By charging my ${vehicle.year} ${vehicle.make} ${vehicle.model} during super off-peak hours (${superOffPeakRate}\u00A2/kWh vs ${peakRate}\u00A2/kWh peak), I save ${fmtAnnual.format(results.annualSavingsSuperOff)} per year. Monthly cost: ${fmt.format(results.monthlySuperOff)} vs ${fmt.format(results.monthlyPeak)} at peak rates.`}
        />
      </div>

      <EducationalContent>
        <h2>Understanding Time-of-Use Electricity Plans</h2>
        <p>
          Time-of-Use (TOU) plans divide the day into pricing tiers based on
          grid demand. Peak hours (typically 4-9 PM) have the highest rates
          because everyone is home using appliances, AC, and cooking. Off-peak
          hours have moderate rates, and super off-peak hours (typically 11 PM
          to 6 AM) offer the lowest rates when demand is at its minimum.
        </p>
        <h3>Why TOU Plans Are Ideal for EV Owners</h3>
        <p>
          EV charging is one of the most &quot;shiftable&quot; electricity loads
          in a household. Unlike cooking or laundry, you can plug in your car
          whenever you get home but delay the actual charging to start at 11 PM
          automatically. This means you get the full benefit of cheap overnight
          rates without changing your daily routine at all.
        </p>
        <h3>Setting Up Scheduled Charging</h3>
        <ul>
          <li>
            Tesla: Go to Charging &gt; Schedule &gt; set departure time or
            start time in the Tesla app. The car will wait until off-peak hours.
          </li>
          <li>
            Most other EVs: Use the manufacturer&apos;s app (FordPass, myChevrolet,
            etc.) to set a charging schedule. Look for &quot;Charge
            Scheduling&quot; or &quot;Preferred Charging Times.&quot;
          </li>
          <li>
            Smart chargers: Products like ChargePoint Home Flex, Emporia, and
            Grizzl-E have built-in scheduling through their companion apps.
          </li>
          <li>
            Contact your utility to confirm your exact TOU rate schedule. Many
            utilities have EV-specific TOU plans with even deeper off-peak
            discounts than standard TOU plans.
          </li>
        </ul>
        <h3>Maximizing Your Savings</h3>
        <p>
          Beyond shifting EV charging, consider running your dishwasher, laundry,
          and other heavy appliances during off-peak hours too. Some smart home
          systems can automate this scheduling. Also check if your utility offers
          an EV-specific rate plan, which often provides steeper overnight
          discounts than their standard TOU plan.
        </p>
      </EducationalContent>
      <FAQSection questions={touFAQ} />
      <EmailCapture source="tou-optimizer" />
      <RelatedCalculators currentPath="/tou-optimizer" />
    </CalculatorLayout>
  );
}
