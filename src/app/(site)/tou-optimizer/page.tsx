"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import CalculatorShell from "@/components/CalculatorShell";
import SavingsVerdict from "@/components/SavingsVerdict";
import SavingsMeter from "@/components/SavingsMeter";
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
import { useUrlSync } from "@/lib/useUrlState";
import { EV_VEHICLES } from "@/data/ev-vehicles";

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
      "Savings vary by utility, but most EV owners save 40 to 60 percent on charging costs by switching from peak to off-peak hours. In states like California, the difference between peak and off-peak rates can be 20 to 30 cents per kWh, which adds up to $500 to $1,500 per year depending on how much you drive.",
  },
  {
    question: "Do I need a special charger to use TOU rates?",
    answer:
      "You do not need a special charger, but a smart charger or your EV's built-in charge scheduling makes it much easier. Most modern EVs (Tesla, Ford, Chevy, and so on) let you set a charging schedule directly in the car. Smart Level 2 chargers like the ChargePoint Home Flex or Emporia also support scheduling through their apps.",
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

    // Annual cost at each tier
    const annualPeak = monthlyPeak * 12;
    const annualSuperOff = monthlySuperOff * 12;

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
      annualPeak,
      annualSuperOff,
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

  const dialPercent = Math.max(0, Math.min(100, results.pctSavingsSuperOff));

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.batteryCapacityKwh} kWh battery, ${vehicle.kwhPer100Miles} kWh/100mi`}
      />
      <NumberInput
        label="Peak rate"
        value={peakRate}
        onChange={setPeakRate}
        min={5}
        max={80}
        step={1}
        unit={"\u00A2/kWh"}
        helpText="Your utility's peak rate"
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
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="YOU SAVE"
      amount={Math.max(0, results.annualSavingsSuperOff)}
      amountUnit="/year"
      sub={
        <>
          By moving EV charging from peak ({peakRate}
          {"\u00A2"}/kWh) to super off-peak ({superOffPeakRate}
          {"\u00A2"}/kWh). That cuts your charging bill by about{" "}
          {Math.round(results.pctSavingsSuperOff)} percent.
        </>
      }
      dialPercent={dialPercent}
      dialLabel="BILL CUT"
    >
      <SavingsTile
        label="ANNUAL SAVINGS"
        value={Math.max(0, results.annualSavingsSuperOff)}
        prefix="$"
        unit="/yr"
        tier="good"
        animate
      />
      <SavingsTile
        label="OFF-PEAK /KWH"
        value={superOffPeakRate}
        prefix=""
        decimals={0}
        unit={"\u00A2"}
        tier="brand"
      />
      <SavingsTile
        label="ON-PEAK /KWH"
        value={peakRate}
        prefix=""
        decimals={0}
        unit={"\u00A2"}
        tier="warn"
      />
      <SavingsTile
        label="PERCENT CHEAPER"
        value={Math.max(0, results.pctSavingsSuperOff)}
        prefix=""
        decimals={0}
        unit="%"
        tier="volt"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Time of use"
      title="TOU Optimizer"
      quickAnswer="Shifting EV charging to super off-peak hours typically cuts your charging bill by 50 to 75 percent on most TOU plans."
      inputs={inputs}
      hero={hero}
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

      {/* Advanced inputs (collapsed by default) */}
      <details className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer select-none text-sm font-semibold text-[var(--color-ink)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Off-peak rate"
            value={offPeakRate}
            onChange={setOffPeakRate}
            min={2}
            max={50}
            step={1}
            unit={"\u00A2/kWh"}
            helpText="Typically evenings and mornings"
          />
          <NumberInput
            label="Super off-peak rate"
            value={superOffPeakRate}
            onChange={setSuperOffPeakRate}
            min={1}
            max={40}
            step={1}
            unit={"\u00A2/kWh"}
            helpText="Cheapest overnight rate, if your plan has one"
          />
          <SelectInput
            label="Peak hours start"
            value={peakStart}
            onChange={setPeakStart}
            options={hourOptions}
            helpText="When peak pricing begins"
          />
          <SelectInput
            label="Peak hours end"
            value={peakEnd}
            onChange={setPeakEnd}
            options={hourOptions}
            helpText="When peak pricing ends"
          />
        </div>
      </details>

      {/* Signature split-column live meter: flat (peak) vs TOU (super off-peak) annual */}
      <SavingsMeter
        leftLabel="FLAT"
        leftValue={results.annualPeak}
        rightLabel="TOU"
        rightValue={results.annualSuperOff}
      />

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/bill-impact"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Calculate full bill impact
        </Link>
        <Link
          href="/ev-charging-cost"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Detailed charging cost breakdown
        </Link>
        <Link
          href="/charger-roi"
          className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]"
        >
          Is a home charger worth it?
        </Link>
      </div>

      <EducationalContent>
        <h2>Understanding Time-of-Use Electricity Plans</h2>
        <p>
          Time-of-Use (TOU) plans divide the day into pricing tiers based on grid demand. Peak hours (typically 4 to 9 PM) have the highest rates because everyone is home using appliances, AC, and cooking. Off-peak hours have moderate rates, and super off-peak hours (typically 11 PM to 6 AM) offer the lowest rates when demand is at its minimum.
        </p>
        <h3>Why TOU Plans Are Ideal for EV Owners</h3>
        <p>
          EV charging is one of the most shiftable electricity loads in a household. Unlike cooking or laundry, you can plug in your car whenever you get home but delay the actual charging to start at 11 PM automatically. This means you get the full benefit of cheap overnight rates without changing your daily routine at all.
        </p>
        <h3>Setting Up Scheduled Charging</h3>
        <ul>
          <li>
            Tesla: Go to Charging, then Schedule, then set departure time or start time in the Tesla app. The car will wait until off-peak hours.
          </li>
          <li>
            Most other EVs: Use the manufacturer&apos;s app (FordPass, myChevrolet, and so on) to set a charging schedule. Look for Charge Scheduling or Preferred Charging Times.
          </li>
          <li>
            Smart chargers: Products like ChargePoint Home Flex, Emporia, and Grizzl-E have built-in scheduling through their companion apps.
          </li>
          <li>
            Contact your utility to confirm your exact TOU rate schedule. Many utilities have EV-specific TOU plans with even deeper off-peak discounts than standard TOU plans.
          </li>
        </ul>
        <h3>Maximizing Your Savings</h3>
        <p>
          Beyond shifting EV charging, consider running your dishwasher, laundry, and other heavy appliances during off-peak hours too. Some smart home systems can automate this scheduling. Also check if your utility offers an EV-specific rate plan, which often provides steeper overnight discounts than their standard TOU plan.
        </p>
      </EducationalContent>
      <FAQSection questions={touFAQ} />
      <EmailCapture source="tou-optimizer" />
      <RelatedCalculators currentPath="/tou-optimizer" />
    </CalculatorShell>
  );
}
