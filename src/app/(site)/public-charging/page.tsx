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

const publicChargingFAQ = [
  {
    question: "How much does it cost to charge an EV at a public station?",
    answer:
      "Public charging costs vary widely by network and charging speed. Level 2 public chargers typically cost $0.20-$0.35 per kWh, while DC fast chargers range from $0.30-$0.60 per kWh. Many stations also charge a per-session fee of $1-$2. On average, a full DC fast charge costs 2-3x more than charging the same amount at home.",
  },
  {
    question: "Is it cheaper to charge at home or at a public station?",
    answer:
      "Home charging is almost always cheaper. The national average residential electricity rate is about 16 cents per kWh, while public Level 2 chargers average 25 cents per kWh and DC fast chargers average 35-45 cents per kWh. Home charging can save you 40-70% compared to public charging, which is why most EV owners do the majority of their charging at home.",
  },
  {
    question: "Why do DC fast chargers cost more than Level 2?",
    answer:
      "DC fast chargers require expensive equipment (often $100,000+ per unit), high-capacity electrical connections, and demand charges from utilities. These infrastructure costs get passed on to consumers. The convenience of charging in 20-40 minutes instead of several hours also commands a premium price.",
  },
  {
    question: "Do public charging session fees add up significantly?",
    answer:
      "Yes, session fees can meaningfully increase your cost. A $1.00 fee on 8 sessions per month adds $96 per year. For drivers who only top up small amounts at public chargers, the per-session fee can effectively double the per-kWh cost. Look for networks that waive session fees with a membership plan.",
  },
  {
    question: "How can I reduce my public charging costs?",
    answer:
      "Sign up for network memberships (Electrify America Plus, EVgo Plus) to get lower per-kWh rates. Use apps like PlugShare to find the cheapest nearby stations. Charge during off-peak hours when some stations offer discounts. If your workplace offers Level 2 charging, that is often free or low-cost. Finally, maximize home charging to reduce how often you need public stations.",
  },
];

export default function PublicChargingCostPage() {
  const [vehicleId, setVehicleId] = useState(EV_VEHICLES[0].id);
  const [stateCode, setStateCode] = useState("CA");
  const [publicPercent, setPublicPercent] = useState(30);
  const [level2Rate, setLevel2Rate] = useState(25);
  const [dcFastRate, setDcFastRate] = useState(40);
  const [sessionFee, setSessionFee] = useState(1.0);
  const [sessionsPerMonth, setSessionsPerMonth] = useState(8);
  const [dailyMiles, setDailyMiles] = useState(35);

  // Auto-detect state from timezone on first visit
  const [stateDetected, setStateDetected] = useState(false);
  useEffect(() => {
    if (!stateDetected) {
      setStateCode(getDefaultStateCode());
      setStateDetected(true);
    }
  }, [stateDetected]);

  // Sync state to/from URL for shareable links
  useUrlSync(
    {
      vehicle: vehicleId,
      state: stateCode,
      pub: String(publicPercent),
      l2: String(level2Rate),
      dc: String(dcFastRate),
      fee: String(sessionFee),
      sess: String(sessionsPerMonth),
      miles: dailyMiles,
    },
    useCallback((p: Record<string, string>) => {
      if (p.vehicle && EV_VEHICLES.some((v) => v.id === p.vehicle)) setVehicleId(p.vehicle);
      if (p.state && p.state in ELECTRICITY_RATES) setStateCode(p.state);
      if (p.pub) setPublicPercent(Number(p.pub));
      if (p.l2) setLevel2Rate(Number(p.l2));
      if (p.dc) setDcFastRate(Number(p.dc));
      if (p.fee) setSessionFee(Number(p.fee));
      if (p.sess) setSessionsPerMonth(Number(p.sess));
      if (p.miles) setDailyMiles(Number(p.miles));
    }, [])
  );

  const vehicle = useMemo(
    () => EV_VEHICLES.find((v) => v.id === vehicleId) ?? EV_VEHICLES[0],
    [vehicleId]
  );

  const homeRate = useMemo(() => {
    const stateRate = ELECTRICITY_RATES[stateCode];
    return (stateRate?.residential ?? NATIONAL_AVERAGE_RATE) / 100;
  }, [stateCode]);

  // Blended public rate: assume 40% Level 2, 60% DC fast for public sessions
  const blendedPublicRate = useMemo(() => {
    return (level2Rate * 0.4 + dcFastRate * 0.6) / 100;
  }, [level2Rate, dcFastRate]);

  const results = useMemo(() => {
    const dailyKwh = (dailyMiles / 100) * vehicle.kwhPer100Miles;
    const monthlyKwh = dailyKwh * 30;

    const publicFraction = publicPercent / 100;
    const homeFraction = 1 - publicFraction;

    const monthlySessionFees = sessionFee * sessionsPerMonth;

    // Scenario 1: 100% home charging
    const homeOnlyMonthly = monthlyKwh * homeRate;
    const homeOnlyAnnual = homeOnlyMonthly * 12;
    const homeOnlyCostPerMile = homeRate * (vehicle.kwhPer100Miles / 100);

    // Scenario 2: Current mix
    const mixHomeKwh = monthlyKwh * homeFraction;
    const mixPublicKwh = monthlyKwh * publicFraction;
    const mixMonthly = mixHomeKwh * homeRate + mixPublicKwh * blendedPublicRate + monthlySessionFees;
    const mixAnnual = mixMonthly * 12;
    const mixCostPerMile = mixMonthly / (dailyMiles * 30);

    // Scenario 3: 100% public charging
    const publicOnlyMonthly = monthlyKwh * blendedPublicRate + monthlySessionFees;
    const publicOnlyAnnual = publicOnlyMonthly * 12;
    const publicOnlyCostPerMile = publicOnlyMonthly / (dailyMiles * 30);

    // Extra cost of public vs home
    const extraMonthlyCost = mixMonthly - homeOnlyMonthly;
    const extraAnnualCost = extraMonthlyCost * 12;

    return {
      homeOnlyMonthly,
      homeOnlyAnnual,
      homeOnlyCostPerMile,
      mixMonthly,
      mixAnnual,
      mixCostPerMile,
      publicOnlyMonthly,
      publicOnlyAnnual,
      publicOnlyCostPerMile,
      extraMonthlyCost,
      extraAnnualCost,
      monthlyKwh,
    };
  }, [dailyMiles, vehicle, homeRate, blendedPublicRate, publicPercent, sessionFee, sessionsPerMonth]);

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

  // Typical DC fast session: ~half a battery worth
  const sessionKwh = vehicle.batteryCapacityKwh * 0.5;
  const perSessionCost = sessionKwh * (dcFastRate / 100) + sessionFee;

  // Percent more than home
  const pctMoreThanHome =
    results.homeOnlyMonthly > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((results.publicOnlyMonthly - results.homeOnlyMonthly) / results.homeOnlyMonthly) * 100
          )
        )
      : 0;

  const inputs = (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectInput
        label="Your EV"
        value={vehicleId}
        onChange={setVehicleId}
        options={vehicleOptions}
        helpText={`${vehicle.kwhPer100Miles} kWh/100mi, ${vehicle.batteryCapacityKwh} kWh battery`}
      />
      <SelectInput
        label="Your state"
        value={stateCode}
        onChange={setStateCode}
        options={stateOptions}
      />
      <SliderInput
        label="% public charging"
        value={publicPercent}
        onChange={setPublicPercent}
        min={0}
        max={100}
        step={5}
        unit="%"
        showValue
      />
    </div>
  );

  const hero = (
    <SavingsVerdict
      headline="PER SESSION"
      amount={perSessionCost}
      amountUnit="/session"
      sub={
        <>
          Typical DC fast session at {dcFastRate}&cent;/kWh on a {vehicle.batteryCapacityKwh} kWh battery (about a half charge, ${sessionFee.toFixed(2)} connection fee).
          Your current mix runs {`$${Math.round(results.mixMonthly)}`}/mo vs {`$${Math.round(results.homeOnlyMonthly)}`}/mo at home only.
        </>
      }
      dialPercent={pctMoreThanHome}
      dialLabel="OVER HOME"
    >
      <SavingsTile
        label="PER KWH"
        value={dcFastRate / 100}
        prefix="$"
        decimals={2}
        unit="/kWh DC"
        tier="warn"
        animate
      />
      <SavingsTile
        label="PER SESSION"
        value={perSessionCost}
        prefix="$"
        decimals={2}
        unit="/session"
        tier="mid"
        animate
      />
      <SavingsTile
        label="MONTHLY"
        value={results.publicOnlyMonthly}
        prefix="$"
        unit="/mo (all public)"
        tier="warn"
        animate
      />
      <SavingsTile
        label="VS HOME"
        value={Math.round(pctMoreThanHome)}
        unit="% more"
        tier="brand"
        animate
      />
    </SavingsVerdict>
  );

  return (
    <CalculatorShell
      eyebrow="Public charging"
      title="Public Charging Cost Calculator"
      quickAnswer="Public DC fast charging runs 2 to 3x home rates. A typical session costs $15 to $25, versus $5 to $10 at home for the same energy."
      inputs={inputs}
      hero={hero}
    >
      <CalculatorSchema name="Public Charging Cost Calculator" description="Compare public EV charging costs vs home charging. Estimate monthly costs for different mixes of home, Level 2, and DC fast charging." url="https://chargemath.com/public-charging" />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://chargemath.com" }, { name: "Public Charging Cost Calculator", url: "https://chargemath.com/public-charging" }]} />

      {/* Advanced inputs */}
      <details className="group mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink-2)]">
          Advanced inputs
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Level 2 public rate"
            value={level2Rate}
            onChange={setLevel2Rate}
            min={5}
            max={80}
            step={1}
            unit={"\u00A2/kWh"}
            helpText="Typical range: 20-35 cents/kWh"
          />
          <NumberInput
            label="DC fast charging rate"
            value={dcFastRate}
            onChange={setDcFastRate}
            min={10}
            max={100}
            step={1}
            unit={"\u00A2/kWh"}
            helpText="Typical range: 30-60 cents/kWh"
          />
          <NumberInput
            label="Session fee"
            value={sessionFee}
            onChange={setSessionFee}
            min={0}
            max={5}
            step={0.25}
            unit={"$/session"}
            helpText="Per-session connection fee (some networks charge $0-$2)"
          />
          <NumberInput
            label="Public sessions per month"
            value={sessionsPerMonth}
            onChange={setSessionsPerMonth}
            min={0}
            max={30}
            step={1}
            unit={"sessions"}
            helpText="How often you charge at public stations"
          />
          <SliderInput
            label="Daily miles driven"
            value={dailyMiles}
            onChange={setDailyMiles}
            min={10}
            max={150}
            step={5}
            unit="miles"
            showValue
          />
        </div>
      </details>

      {/* Signature live meter: HOME vs PUBLIC annual cost */}
      <SavingsMeter
        leftLabel="PUBLIC"
        leftValue={results.publicOnlyAnnual}
        rightLabel="HOME"
        rightValue={results.homeOnlyAnnual}
        period="/yr"
      />

      {/* Contextual cross-links */}
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/ev-charging-cost" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          Calculate home charging costs
        </Link>
        <Link href="/charging-time" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          How long does charging take?
        </Link>
        <Link href="/gas-vs-electric" className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand-soft)]">
          Compare gas vs electric costs
        </Link>
      </div>

      <EducationalContent>
        <h2>Understanding Public Charging Costs</h2>
        <p>
          Public EV charging costs more than home charging for several reasons: station operators must recoup their investment in equipment ($50,000-$150,000 per DC fast charger), pay commercial electricity rates and demand charges, maintain the hardware, and earn a profit. These costs add up, making public charging roughly 2-3x more expensive per kWh than plugging in at home.
        </p>
        <h3>How This Calculator Works</h3>
        <p>
          We calculate your monthly energy consumption based on your vehicle&apos;s EPA efficiency rating and daily mileage. Then we split that energy between home and public charging based on your selected percentage. For public charging, we use a blended rate of 40% Level 2 and 60% DC fast charging, plus per-session fees. This gives you three clear scenarios to compare: all home, your current mix, and all public.
        </p>
        <h3>Tips to Save on Public Charging</h3>
        <ul>
          <li>Join network membership programs. Electrify America&apos;s Pass+ membership ($4/month) drops DC fast rates from ~$0.43 to ~$0.31/kWh, paying for itself after about 3-4 sessions.</li>
          <li>Use Level 2 public chargers when you have time. They cost 30-50% less than DC fast chargers and are gentler on your battery.</li>
          <li>Check for free workplace charging. Many employers offer Level 2 chargers as a perk, which can eliminate your public charging costs entirely on work days.</li>
          <li>Charge at home overnight whenever possible. Even shifting 10% of your charging from public to home saves $100-$200 per year for the average driver.</li>
          <li>Use apps like PlugShare or ABRP to compare prices at nearby stations before you charge. Prices can vary by $0.10-$0.20/kWh between stations just a few miles apart.</li>
        </ul>
        <h3>When Public Charging Makes Sense</h3>
        <p>
          Not everyone can charge at home. Apartment dwellers, renters, and people without a garage often rely on public charging for most or all of their needs. If that describes you, focus on finding the most affordable network in your area and consider a membership plan. Some cities also offer subsidized public charging rates for residents who lack home charging access.
        </p>
      </EducationalContent>

      <FAQSection questions={publicChargingFAQ} />
      <EmailCapture source="public-charging" />
      <RelatedCalculators currentPath="/public-charging" />
    </CalculatorShell>
  );
}
